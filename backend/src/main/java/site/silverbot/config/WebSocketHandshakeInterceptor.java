package site.silverbot.config;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {
    public static final String AUTH_TOKEN_ATTRIBUTE = "WS_AUTH_TOKEN";

    @Value("${spring.profiles.active:prod}")
    private String activeProfile;

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpRequest = servletRequest.getServletRequest();
            String token = resolveToken(httpRequest);
            if (StringUtils.hasText(token)) {
                attributes.put(AUTH_TOKEN_ATTRIBUTE, token);
            }
        }
        return true;
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception
    ) {
        // no-op
    }

    private String resolveToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header)) {
            return stripBearer(header);
        }
        if (isQueryTokenAllowed()) {
            String token = request.getParameter("token");
            return StringUtils.hasText(token) ? token : null;
        }
        return null;
    }

    private String stripBearer(String value) {
        if (value.startsWith("Bearer ")) {
            return value.substring(7);
        }
        return value;
    }

    private boolean isQueryTokenAllowed() {
        if (!StringUtils.hasText(activeProfile)) {
            return false;
        }
        return Arrays.stream(activeProfile.split(","))
                .map(String::trim)
                .anyMatch(profile -> "dev".equalsIgnoreCase(profile) || "local".equalsIgnoreCase(profile));
    }
}
