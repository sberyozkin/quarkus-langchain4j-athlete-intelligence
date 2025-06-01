package org.acme.security.openid.connect.plugin;

import java.util.Map;

import org.jboss.logging.Logger;

import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;

@Path("subscription")
public class StravaSubscription {

    private static final Logger log = Logger.getLogger(StravaSubscription.class);

    @Inject
    WebSocketConnection wsConnection;

    @GET
    @Produces("application/json")
    public String validate(@QueryParam("hub.verify_token") String hubVerifyToken,
            @QueryParam("hub.challenge") String hubChallenge, @QueryParam("hub.mode") String hubMode) {
        log.infof("hub.challenge: %s", hubChallenge);
        return "{\"hub.challenge\":\"" + hubChallenge + "\"}";

    }

    @POST
    @Consumes("application/json")
    public void event(Event event) {
        wsConnection.sendText(event.toString());
    }

    public static record Event(String object_type, long object_id, String aspect_type, Map<String, String> updates,
            long owner_id, int subscription_id, long event_time) {
    }

}
