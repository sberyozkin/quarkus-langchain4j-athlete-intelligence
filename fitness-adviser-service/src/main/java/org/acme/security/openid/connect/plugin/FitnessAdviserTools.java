package org.acme.security.openid.connect.plugin;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.acme.security.openid.connect.plugin.StravaAthleteClient.DetailedAthlete;
import org.acme.security.openid.connect.plugin.StravaAthleteClient.SummaryActivity;
import org.acme.security.openid.connect.plugin.StravaAthleteClient.SummaryGear;

import dev.langchain4j.agent.tool.Tool;
import io.quarkus.oidc.UserInfo;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.json.JsonArray;
import jakarta.json.JsonNumber;
import jakarta.json.JsonObject;
import org.eclipse.microprofile.rest.client.inject.RestClient;

@Singleton
@Authenticated
public class FitnessAdviserTools {

    @Inject
    UserInfo userInfo;

    @Inject
    @RestClient
    StravaAthleteClient stravaClient;

    @Tool("Get the athlete name.")
    public String getAthleteName() {
        return userInfo.getJsonObject().getString("firstname");
    }

    @Tool("Get the athlete profile.")
    public DetailedAthlete getAhtleteProfile() {
        JsonObject json = userInfo.getJsonObject();
        return new DetailedAthlete(getLong(json.getJsonNumber("id")), json.getString("firstname"),
                json.getString("lastname"), json.getString("city"), json.getString("state"), json.getString("country"),
                getDouble(json.getJsonNumber("weight")), getSummaryGear(json.getJsonArray("bikes")),
                getSummaryGear(json.getJsonArray("shoes")));
    }

    @Tool("Get a one-sentence summary of the athlete's training for the specified number of days. Analyze activities, consistency, intensity, and trends.")
    public String get_training_summary(int days) {
        try {
            List<SummaryActivity> allActivities = stravaClient.athleteActivities();
            
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
            List<SummaryActivity> recentActivities = allActivities.stream()
                .filter(activity -> activity.start_date_local() != null 
                    && activity.start_date_local().isAfter(cutoffDate))
                .collect(Collectors.toList());

            if (recentActivities.isEmpty()) {
                return "No activities found in the last " + days + " days.";
            }

            // Calculate basic metrics for context
            int activityCount = recentActivities.size();
            float totalDistance = recentActivities.stream()
                .map(SummaryActivity::distance)
                .reduce(0f, Float::sum);
            float totalElevation = recentActivities.stream()
                .map(SummaryActivity::total_elevation_gain)
                .reduce(0f, Float::sum);
            
            // Calculate weekly frequency
            double weeks = days / 7.0;
            double weeklyFrequency = activityCount / weeks;

            // Build context string for AI
            String context = String.format(
                "In the last %d days: %d activities, %.1f km total distance, %.0f m elevation gain, %.1f activities per week on average.",
                days, activityCount, totalDistance / 1000, totalElevation, weeklyFrequency
            );

            return context;
        } catch (Exception e) {
            return "Unable to generate training summary at this time.";
        }
    }

    private static Double getDouble(JsonNumber jsonNumber) {
        return jsonNumber == null ? null : jsonNumber.doubleValue();
    }

    private static Long getLong(JsonNumber jsonNumber) {
        return jsonNumber == null ? null : jsonNumber.longValue();
    }

    private static List<SummaryGear> getSummaryGear(JsonArray gearJson) {
        if (gearJson == null) {
            return List.of();
        }
        List<SummaryGear> gears = new ArrayList<>();
        for (int i = 0; i < gearJson.size(); i++) {
            JsonObject json = gearJson.getJsonObject(i);
            gears.add(new SummaryGear(json.getString("name"), getDouble(json.getJsonNumber("distance"))));
        }
        return gears;
    }
}