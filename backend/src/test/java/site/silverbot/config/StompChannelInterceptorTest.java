package site.silverbot.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationContext;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

@ExtendWith(MockitoExtension.class)
class StompChannelInterceptorTest {
    @Mock
    private ApplicationContext applicationContext;

    private StompChannelInterceptor interceptor;

    @BeforeEach
    void setUp() {
        interceptor = new StompChannelInterceptor(applicationContext);
    }

    @Test
    void connect_withValidToken_setsAuthenticatedUser() {
        when(applicationContext.containsBean("jwtTokenProvider")).thenReturn(true);
        when(applicationContext.getBean("jwtTokenProvider")).thenReturn(new JwtTokenProviderStub());

        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setNativeHeader("Authorization", "Bearer valid-token");
        accessor.setLeaveMutable(true);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        Message<?> result = interceptor.preSend(message, null);
        StompHeaderAccessor resultAccessor = StompHeaderAccessor.wrap(result);

        assertThat(resultAccessor.getUser()).isNotNull();
        assertThat(resultAccessor.getUser().getName()).isEqualTo("7");
    }

    @Test
    void subscribe_toAnotherUserTopic_throwsAccessDenied() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setDestination("/topic/user/9/notifications");
        Authentication authentication = new UsernamePasswordAuthenticationToken("7", null, List.of());
        accessor.setUser(authentication);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        assertThrows(AccessDeniedException.class, () -> interceptor.preSend(message, null));
    }

    static class JwtTokenProviderStub {
        public boolean validateToken(String token) {
            return "valid-token".equals(token);
        }

        public Authentication getAuthentication(String token) {
            return new UsernamePasswordAuthenticationToken("7", null, List.of());
        }
    }
}
