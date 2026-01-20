package org.acme.security.openid.connect.plugin;

import java.time.LocalDateTime;
import java.util.List;

import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import dev.langchain4j.agent.tool.Tool;
import io.quarkus.oidc.token.propagation.common.AccessToken;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@RegisterRestClient(configKey = "strava-athlete-client")
@AccessToken
@Path("/")
public interface StravaAthleteClient {

    @Tool("Get athlete statistics")
    @GET
    @Path("athletes/{id}/stats")
    @Produces(MediaType.APPLICATION_JSON)
    AthleteStats athleteStats(@PathParam("id") long athleteId);

    @Tool("Get all athlete activities")
    @GET
    @Path("athlete/activities")
    @Produces(MediaType.APPLICATION_JSON)
    List<SummaryActivity> athleteActivities();

    @Tool("Get an individual athlete activity")
    @GET
    @Path("activities/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    DetailedActivity athleteActivity(@PathParam("id") long activityId);

    @Tool("Get an individual athlete activity's laps")
    @GET
    @Path("activities/{id}/laps")
    @Produces(MediaType.APPLICATION_JSON)
    List<Lap> athleteActivityLaps(@PathParam("id") long activityId);

    @Tool("Get an individual athlete activity's zones")
    @GET
    @Path("activities/{id}/zones")
    @Produces(MediaType.APPLICATION_JSON)
    List<ActivityZone> athleteActivityZones(@PathParam("id") long activityId);

    @Tool("Get an individual athlete activity's stream")
    @GET
    @Path("activities/{id}/streams")
    @Produces(MediaType.APPLICATION_JSON)
    StreamSet athleteActivityStreams(@PathParam("id") long activityId);

    @Tool("Get an individual athlete activity's kudoers")
    @GET
    @Path("activities/{id}/kudos")
    @Produces(MediaType.APPLICATION_JSON)
    List<DetailedAthlete> athleteActivityKudos(@PathParam("id") long activityId);

    @Tool("Get all athlete routes")
    @GET
    @Path("athletes/{id}/routes")
    @Produces(MediaType.APPLICATION_JSON)
    List<Route> athleteRoutes(@PathParam("id") long athleteId);

    @Tool("Get an individual athlete route")
    @GET
    @Path("routes/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    Route athleteRoute(@PathParam("id") long routeId);

    @Tool("Get an individual route's stream")
    @GET
    @Path("activities/{id}/streams")
    @Produces(MediaType.APPLICATION_JSON)
    StreamSet athleteRouteStreams(@PathParam("id") long activityId);

    @Tool("Get all athlete zones")
    @GET
    @Path("athlete/zones")
    @Produces(MediaType.APPLICATION_JSON)
    Zones athleteZones();

    record DetailedAthlete(long id, String firstname, String lastname, String city, String state, String country,
            Double weight, List<SummaryGear> bikes, List<SummaryGear> shoes) {
    }

    record AthleteStats(double biggest_ride_distance, double biggest_climb_elevation_gain,
            ActivityTotal recent_ride_totals, ActivityTotal recent_run_totals, ActivityTotal recent_swim_totals,
            ActivityTotal ytd_ride_totals, ActivityTotal ytd_run_totals, ActivityTotal ytd_swim_totals,
            ActivityTotal all_ride_totals, ActivityTotal all_run_totals, ActivityTotal all_swim_totals) {

        record ActivityTotal(int count, float distance, int moving_time, int elapsed_time, float elevation_gain,
                int achievement_count) {
        }
    }

    record ActivityZone(int score, ActivityZoneType type, boolean sensor_based, int points, int max) {

    }

    record MetaAthlete(long id) {
    }

    record SummaryActivity(long id, MetaAthlete athlete, String name, float distance, int moving_time, int elapsed_time,
            float total_elevation_gain, float elev_high, float elev_low, SportType sport_type,
            LocalDateTime start_date_local, String timezone, int achievement_count, int kudos_count, PolylineMap map,
            float average_speed, float max_speed, String gear_id) {
    }

    record DetailedActivity(long id, String name, float distance, int moving_time, int elapsed_time,
            float total_elevation_gain, float elev_high, float elev_low, SportType sport_type,
            LocalDateTime start_date_local, String timezone, int achievement_count, int kudos_count, PolylineMap map,
            float average_speed, float max_speed, String description, SummaryGear gear, float calories,
            List<DetailedSegmentEffort> segment_efforts, List<DetailedSegmentEffort> best_efforts, List<Lap> laps) {

        record DetailedSegmentEffort(long id, long activity_id, int elapsed_time, LocalDateTime start_date_local,
                float distance) {
        }
    }

    record MetaActivity(long id) {
    }

    record Lap(long id, MetaActivity activity, MetaAthlete athlete, float averafe_cadence, float averafe_speed,
            float distance, int elapsed_time, int start_index, int end_index, int lap_index, float max_speed,
            int moving_time, String name, int pace_zone, int split, LocalDateTime start_date_local,
            float total_elevation_gain) {

    }

    record Route(SummaryAthlete athlete, String description, float distance, float elevation_game, long id,
            PolylineMap map, String name, int type, LocalDateTime created_at, int estimated_moving_time,
            List<SummarySegment> segments, List<Waypoint> waypoints) {
        record SummaryAthlete(long id, String firstname, String lastname, String city, String state, String country) {
        }

        record SummarySegment(long id, String name, ActivityType activity_type, float distance, float average_grade,
                float maximum_grade, float elevation_high, float elevation_low, int climb_category, String city,
                String state, String country, SummaryPRSegmentEffort athlete_pr_effort,
                SummarySegmentEffort athlete_segment_stats) {
        }

        record SummarySegmentEffort(long id, long activity_id, int elapsed_time, LocalDateTime start_date_local,
                float distance, boolean is_kom) {
        }

        record SummaryPRSegmentEffort(long pr_activity_id, int pr_elapsed_time, LocalDateTime pr_date,
                int effort_count) {
        }

        record Waypoint(String title, int distance_into_route) {
        }
    }

    record Zones(HeartRateZoneRanges heart_rate, PowerZoneRanges power) {
        record HeartRateZoneRanges(ZoneRanges zones) {

        }

        record PowerZoneRanges(List<ZoneRange> zones) {

        }

        record ZoneRanges(List<ZoneRange> zones) {

        }

        record ZoneRange(int min, int max) {
        }
    }

    record PolylineMap(String polyline, String summary_polyline) {
    }

    record SummaryGear(String name, Double distance) {
    }

    record StreamSet(TimeStream time, DistanceStream distance, HeartrateStream heartrate) {
        record TimeStream(int original_size, StreamResolution resolution, SeriesType series_type, int date) {

        }

        record DistanceStream(int original_size, StreamResolution resolution, SeriesType series_type, int date) {

        }

        record HeartrateStream(int original_size, StreamResolution resolution, SeriesType series_type, int date) {

        }

        enum SeriesType {
            distance, time
        }

        enum StreamResolution {
            low, medium, high
        }
    }

    enum ActivityType {
        Ride, Run
    }

    enum ActivityZoneType {
        heartrate, power
    }

    enum SportType {
        AlpineSki, BackcountrySki, Badminton, Canoeing, Crossfit, EBikeRide, Elliptical, EMountainBikeRide, Golf,
        GravelRide, Handcycle, HighIntensityIntervalTraining, Hike, IceSkate, InlineSkate, Kayaking, Kitesurf,
        MountainBikeRide, NordicSki, Pickleball, Pilates, Racquetball, Ride, RockClimbing, RollerSki, Rowing, Run, Sail,
        Skateboard, Snowboard, Snowshoe, Soccer, Squash, StairStepper, StandUpPaddling, Surfing, Swim, TableTennis,
        Tennis, TrailRun, Velomobile, VirtualRide, VirtualRow, VirtualRun, Walk, WeightTraining, Wheelchair, Windsurf,
        Workout, Yoga
    }
}
