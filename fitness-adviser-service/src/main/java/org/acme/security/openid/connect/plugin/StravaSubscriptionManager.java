package org.acme.security.openid.connect.plugin;

import org.acme.security.openid.connect.plugin.StravaSubscriptionClient.SubscriptionCreationResponse;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jboss.logging.Logger;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class StravaSubscriptionManager {

    private static final Logger log = Logger.getLogger(StravaSubscriptionManager.class);

    @Inject
    @RestClient
    StravaSubscriptionClient stravaSubscriptionClient;

    @Inject
    @ConfigProperty(name = "quarkus.oidc.client-id")
    String clientId;

    @Inject
    @ConfigProperty(name = "quarkus.oidc.credentials.secret")
    String clientSecret;

    //@Inject
    //@ConfigProperty(name = "ngrok.host")
    //String ngrokHost;

    volatile SubscriptionCreationResponse subscription;

    public void pushSubscription(String accessToken) {
        //subscription = stravaSubscriptionClient.pushSubscription(clientId, clientSecret,
        //        "https://" + ngrokHost + "/subscription", accessToken);
        //log.debugf("Subscription %s is created", subscription.id());

    }

    public void deleteSubscription() {
        if (subscription != null) {
            stravaSubscriptionClient.deleteSubscription(subscription.id(), clientId, clientSecret);
        }
    }
}
