package site.silverbot.config;

import java.lang.reflect.Method;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class StompChannelInterceptor implements org.springframework.messaging.support.ChannelInterceptor {
    private static final String JWT_TOKEN_PROVIDER_BEAN = "jwtTokenProvider";
    private static final String USER_NOTIFICATION_PREFIX = "/topic/user/";
    private static final String USER_NOTIFICATION_SUFFIX = "/notifications";

    private final ApplicationContext applicationContext;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = resolveToken(accessor);
            if (!StringUtils.hasText(token)) {
                throw new AuthenticationCredentialsNotFoundException("WebSocket token is missing");
            }
            Authentication authentication = authenticate(token);
            accessor.setUser(authentication);
        }

        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            Authentication authentication = resolveAuthentication(accessor);
            validateSubscriptionDestination(accessor, authentication);
        }

        return message;
    }

    private String resolveToken(StompHeaderAccessor accessor) {
        String header = accessor.getFirstNativeHeader("Authorization");
        if (StringUtils.hasText(header)) {
            return stripBearer(header);
        }
        String tokenHeader = accessor.getFirstNativeHeader("token");
        if (StringUtils.hasText(tokenHeader)) {
            return tokenHeader;
        }
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes != null) {
            Object token = sessionAttributes.get(WebSocketHandshakeInterceptor.AUTH_TOKEN_ATTRIBUTE);
            if (token instanceof String tokenValue && StringUtils.hasText(tokenValue)) {
                return tokenValue;
            }
        }
        return null;
    }

    private String stripBearer(String value) {
        if (value.startsWith("Bearer ")) {
            return value.substring(7);
        }
        return value;
    }

    private Authentication authenticate(String token) {
        Object provider = resolveJwtTokenProvider();
        try {
            Method validateToken = provider.getClass().getMethod("validateToken", String.class);
            Method getAuthentication = provider.getClass().getMethod("getAuthentication", String.class);

            Object valid = validateToken.invoke(provider, token);
            if (!(valid instanceof Boolean) || !(Boolean) valid) {
                throw new AuthenticationCredentialsNotFoundException("WebSocket token is invalid");
            }

            Object authentication = getAuthentication.invoke(provider, token);
            if (authentication instanceof Authentication auth) {
                return auth;
            }
            throw new AuthenticationCredentialsNotFoundException("WebSocket authentication is invalid");
        } catch (AuthenticationCredentialsNotFoundException exception) {
            throw exception;
        } catch (ReflectiveOperationException exception) {
            throw new AuthenticationCredentialsNotFoundException("WebSocket token validation failed", exception);
        }
    }

    private Authentication resolveAuthentication(StompHeaderAccessor accessor) {
        if (accessor.getUser() instanceof Authentication authentication) {
            return authentication;
        }
        throw new AuthenticationCredentialsNotFoundException("WebSocket user is not authenticated");
    }

    private void validateSubscriptionDestination(StompHeaderAccessor accessor, Authentication authentication) {
        String destination = accessor.getDestination();
        if (!StringUtils.hasText(destination)) {
            return;
        }
        if (!destination.startsWith(USER_NOTIFICATION_PREFIX) || !destination.endsWith(USER_NOTIFICATION_SUFFIX)) {
            return;
        }

        String requestedUserId = destination.substring(
                USER_NOTIFICATION_PREFIX.length(),
                destination.length() - USER_NOTIFICATION_SUFFIX.length()
        );
        if (!StringUtils.hasText(requestedUserId)) {
            throw new AccessDeniedException("Invalid notification topic");
        }
        if (!requestedUserId.equals(authentication.getName())) {
            throw new AccessDeniedException("Not allowed to subscribe to other user's notification topic");
        }
    }

    private Object resolveJwtTokenProvider() {
        if (!applicationContext.containsBean(JWT_TOKEN_PROVIDER_BEAN)) {
            throw new AuthenticationCredentialsNotFoundException("JwtTokenProvider bean not found");
        }
        return applicationContext.getBean(JWT_TOKEN_PROVIDER_BEAN);
    }
}
