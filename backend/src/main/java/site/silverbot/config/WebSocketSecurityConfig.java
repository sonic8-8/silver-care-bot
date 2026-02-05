package site.silverbot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class WebSocketSecurityConfig {
    @Bean
    public WebSocketHandshakeInterceptor webSocketHandshakeInterceptor(Environment environment) {
        return new WebSocketHandshakeInterceptor(environment);
    }
}
