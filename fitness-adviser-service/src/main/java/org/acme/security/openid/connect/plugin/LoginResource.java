package org.acme.security.openid.connect.plugin;

import io.quarkus.oidc.AccessTokenCredential;
import io.quarkus.oidc.UserInfo;
import io.quarkus.qute.Template;
import io.quarkus.qute.TemplateInstance;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;

/**
 * Login resource
 */
@Path("/login")
@Authenticated
public class LoginResource {

    @Inject
    UserInfo userInfo;

    @Inject
    Template fitnessAdviser;

    @Inject
    AccessTokenCredential accessToken;

    @Inject
    StravaSubscriptionManager subscriptionManager;

    @GET
    @Produces("text/html")
    public TemplateInstance login() {
        subscriptionManager.pushSubscription(accessToken.getToken());
        return fitnessAdviser.data("name", userInfo.getJsonObject().getString("firstname"));
    }
}
