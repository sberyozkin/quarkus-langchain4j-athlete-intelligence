package org.acme.security.openid.connect.plugin;

import java.util.ArrayList;
import java.util.List;

import org.acme.security.openid.connect.plugin.StravaAthleteClient.DetailedAthlete;
import org.acme.security.openid.connect.plugin.StravaAthleteClient.SummaryGear;

import dev.langchain4j.agent.tool.Tool;
import io.quarkus.oidc.UserInfo;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.json.JsonArray;
import jakarta.json.JsonNumber;
import jakarta.json.JsonObject;

@Singleton
@Authenticated
public class FitnessAdviserTools {

    @Inject
    UserInfo userInfo;

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