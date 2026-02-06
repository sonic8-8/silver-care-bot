package site.silverbot.config;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {
    public static final String AUTH_TOKEN_ATTRIBUTE = "WS_AUTH_TOKEN";

    private final Environment environment;

    public WebSocketHandshakeInterceptor(Environment environment) {
        this.environment = environment;
    }

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
        return environment.acceptsProfiles(Profiles.of("dev", "local"));
    }
}
