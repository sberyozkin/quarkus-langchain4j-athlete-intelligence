package org.acme.security.openid.connect.plugin;

import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

@RegisterRestClient(configKey = "strava-subscription-client")
@Path("/push_subscriptions")
public interface StravaSubscriptionClient {

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    SubscriptionCreationResponse pushSubscription(@FormParam("client_id") String clientId,
            @FormParam("client_secret") String clientSecret, @FormParam("callback_url") String callbackUrl,
            @FormParam("verify_token") String verifyToken);

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    SubscriptionView viewSubscription(@QueryParam("client_id") String clientId,
            @QueryParam("client_secret") String clientSecret);

    @DELETE
    @Path("{id}")
    void deleteSubscription(@PathParam("id") String id, @QueryParam("client_id") String clientId,
            @QueryParam("client_secret") String clientSecret);

    record SubscriptionView(String id, int resource_state, int application_id, String callback_url) {

    }

    record SubscriptionCreationResponse(String id) {

    }
}
