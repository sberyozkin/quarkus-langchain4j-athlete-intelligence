package org.acme.security.openid.connect.plugin;

import org.jboss.logging.Logger;

import dev.langchain4j.model.chat.listener.ChatModelListener;
import dev.langchain4j.model.chat.listener.ChatModelResponseContext;
import io.quarkus.oidc.UserInfo;
import io.quarkus.security.Authenticated;
import io.quarkus.websockets.next.OnOpen;
import io.quarkus.websockets.next.OnTextMessage;
import io.quarkus.websockets.next.WebSocket;
import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@WebSocket(path = "/fitnessAdviser")
@Authenticated
public class FitnessAdviserResource {

    private static final Logger log = Logger.getLogger(FitnessAdviserResource.class);

    FitnessAdviserService fitnessAdviser;

    public FitnessAdviserResource(FitnessAdviserService fitnessAdviser) {
        this.fitnessAdviser = fitnessAdviser;
    }

    @Inject
    UserInfo userInfo;

    @OnOpen
    public String onOpen() {
        return "Hello, " + userInfo.getJsonObject().getString("firstname")
                + ", I'm your Fitness Adviser, how can I help you?";
    }

    @OnTextMessage
    public String onMessage(String question) {
        return fitnessAdviser.advise(question);
    }

    @Singleton
    public static class AssistantChatModelListener implements ChatModelListener {
        @Inject
        WebSocketConnection wsConnection;

        public void onResponse(ChatModelResponseContext context) {
            if (context.chatResponse().aiMessage().text() != null
                    && context.chatResponse().aiMessage().hasToolExecutionRequests()) {
                log.info(
                        "Gemini provided text content while also requesting tool executions to complete the user query. Sending this text to the user now.");
                wsConnection.sendText(context.chatResponse().aiMessage().text());
            }
        }
    }
}
