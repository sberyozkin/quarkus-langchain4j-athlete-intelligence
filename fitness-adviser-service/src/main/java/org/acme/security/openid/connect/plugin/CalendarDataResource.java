package org.acme.security.openid.connect.plugin;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.acme.security.openid.connect.plugin.StravaAthleteClient.SummaryActivity;

import io.quarkus.oidc.UserInfo;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

@Path("/api/calendar-data")
@Authenticated
public class CalendarDataResource {

    @Inject
    UserInfo userInfo;

    @Inject
    @RestClient
    StravaAthleteClient stravaClient;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public JsonObject getCalendarData() {
        try {
            List<SummaryActivity> allActivities = stravaClient.athleteActivities();

            // Get activities from the past year
            LocalDate oneYearAgo = LocalDate.now().minusYears(1);
            LocalDateTime cutoffDate = oneYearAgo.atStartOfDay();

            // Group activities by date and calculate total duration per day
            Map<LocalDate, DayData> dayDataMap = new HashMap<>();
            
            for (SummaryActivity activity : allActivities) {
                if (activity.start_date_local() != null 
                    && activity.start_date_local().isAfter(cutoffDate)) {
                    LocalDate date = activity.start_date_local().toLocalDate();
                    
                    DayData dayData = dayDataMap.getOrDefault(date, new DayData(date));
                    dayData.addActivity(activity);
                    dayDataMap.put(date, dayData);
                }
            }

            // Generate all days for the past year (including days with no activity)
            List<DayData> allDays = new ArrayList<>();
            LocalDate currentDate = oneYearAgo;
            LocalDate today = LocalDate.now();
            
            while (!currentDate.isAfter(today)) {
                DayData dayData = dayDataMap.getOrDefault(currentDate, new DayData(currentDate));
                allDays.add(dayData);
                currentDate = currentDate.plusDays(1);
            }

            // Build JSON response
            var daysArrayBuilder = Json.createArrayBuilder();
            for (DayData dayData : allDays) {
                var activitiesArrayBuilder = Json.createArrayBuilder();
                for (SummaryActivity activity : dayData.activities) {
                    activitiesArrayBuilder.add(Json.createObjectBuilder()
                        .add("id", activity.id())
                        .add("name", activity.name())
                        .add("distance", activity.distance())
                        .add("duration", activity.moving_time())
                        .build());
                }
                
                daysArrayBuilder.add(Json.createObjectBuilder()
                    .add("date", dayData.date.format(DateTimeFormatter.ISO_LOCAL_DATE))
                    .add("value", dayData.totalMinutes)
                    .add("activities", activitiesArrayBuilder.build())
                    .build());
            }
            
            JsonArray daysArray = daysArrayBuilder.build();

            return Json.createObjectBuilder()
                .add("days", daysArray)
                .build();
        } catch (Exception e) {
            return Json.createObjectBuilder()
                .add("error", "Unable to load calendar data: " + e.getMessage())
                .build();
        }
    }

    private static class DayData {
        LocalDate date;
        int totalMinutes = 0;
        List<SummaryActivity> activities = new ArrayList<>();

        DayData(LocalDate date) {
            this.date = date;
        }

        void addActivity(SummaryActivity activity) {
            activities.add(activity);
            // Use moving_time (in seconds) converted to minutes
            totalMinutes += activity.moving_time() / 60;
        }
    }
}
