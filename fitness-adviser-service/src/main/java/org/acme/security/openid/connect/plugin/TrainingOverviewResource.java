package org.acme.security.openid.connect.plugin;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.acme.security.openid.connect.plugin.StravaAthleteClient.SummaryActivity;

import io.quarkus.oidc.UserInfo;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

@Path("/api/training-overview")
@Authenticated
public class TrainingOverviewResource {

    @Inject
    UserInfo userInfo;

    @Inject
    @RestClient
    StravaAthleteClient stravaClient;

    @Inject
    FitnessAdviserService fitnessAdviserService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public JsonObject getTrainingOverview(@QueryParam("days") Integer days) {
        if (days == null) {
            days = 30; // Default to 30 days
        }

        try {
            List<SummaryActivity> allActivities = stravaClient.athleteActivities();

            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
            List<SummaryActivity> recentActivities = allActivities.stream()
                .filter(activity -> activity.start_date_local() != null 
                    && activity.start_date_local().isAfter(cutoffDate))
                .collect(Collectors.toList());

            // Calculate stats
            int activityCount = recentActivities.size();
            float totalDistance = recentActivities.stream()
                .map(SummaryActivity::distance)
                .reduce(0f, Float::sum);
            float totalElevation = recentActivities.stream()
                .map(SummaryActivity::total_elevation_gain)
                .reduce(0f, Float::sum);
            
            // Calculate weekly frequency
            double weeks = Math.max(1.0, days / 7.0);
            double weeklyFrequency = activityCount / weeks;

            // Get AI summary
            String summary = fitnessAdviserService.advise(
                String.format("Provide a one-sentence summary of my training in the last %d days. " +
                    "I had %d activities, %.1f km total distance, %.0f m elevation gain, and %.1f activities per week. " +
                    "Focus on consistency, intensity trends, and overall training pattern.",
                    days, activityCount, totalDistance / 1000, totalElevation, weeklyFrequency)
            );

            return Json.createObjectBuilder()
                .add("period", days)
                .add("stats", Json.createObjectBuilder()
                    .add("activities", activityCount)
                    .add("weeklyFrequency", Math.round(weeklyFrequency * 10.0) / 10.0)
                    .add("distance", Math.round(totalDistance / 1000.0 * 10.0) / 10.0) // km
                    .add("elevation", Math.round(totalElevation)) // meters
                )
                .add("summary", summary)
                .build();
        } catch (Exception e) {
            return Json.createObjectBuilder()
                .add("error", "Unable to load training overview: " + e.getMessage())
                .build();
        }
    }

}
