package site.silverbot.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.Key;
import java.time.Instant;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {
    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_TYPE = "type";
    private static final String TYPE_ACCESS = "access";
    private static final String TYPE_REFRESH = "refresh";

    private final Key key;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-expiration}") long accessTokenExpiration,
            @Value("${app.jwt.refresh-token-expiration}") long refreshTokenExpiration
    ) {
        this.key = Keys.hmacShaKeyFor(resolveKey(secret));
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    public String createAccessToken(String subject, String role, String email) {
        return createToken(subject, role, email, TYPE_ACCESS, accessTokenExpiration);
    }

    public String createRefreshToken(String subject) {
        return createToken(subject, null, null, TYPE_REFRESH, refreshTokenExpiration);
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException ex) {
            return false;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public boolean isRefreshToken(String token) {
        return TYPE_REFRESH.equals(getTokenType(token));
    }

    public boolean isAccessToken(String token) {
        return TYPE_ACCESS.equals(getTokenType(token));
    }

    public Optional<Long> getSubjectAsLong(String token) {
        try {
            String subject = parseClaims(token).getSubject();
            if (subject == null) {
                return Optional.empty();
            }
            return Optional.of(Long.parseLong(subject));
        } catch (JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    public Authentication getAuthentication(String token) {
        Claims claims = parseClaims(token);
        String subject = claims.getSubject();
        String role = claims.get(CLAIM_ROLE, String.class);
        List<SimpleGrantedAuthority> authorities = role == null
                ? Collections.emptyList()
                : List.of(new SimpleGrantedAuthority("ROLE_" + role));
        return new UsernamePasswordAuthenticationToken(subject, null, authorities);
    }

    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }

    private String createToken(String subject, String role, String email, String type, long expirationMillis) {
        Instant now = Instant.now();
        Date issuedAt = Date.from(now);
        Date expiresAt = Date.from(now.plusMillis(expirationMillis));

        var builder = Jwts.builder()
                .subject(subject)
                .issuedAt(issuedAt)
                .expiration(expiresAt)
                .claim(CLAIM_TYPE, type);

        if (role != null) {
            builder.claim(CLAIM_ROLE, role);
        }
        if (email != null) {
            builder.claim(CLAIM_EMAIL, email);
        }

        return builder.signWith(key).compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private String getTokenType(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.get(CLAIM_TYPE, String.class);
        } catch (JwtException | IllegalArgumentException ex) {
            return null;
        }
    }

    private byte[] resolveKey(String secret) {
        byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
        if (raw.length >= 32) {
            return raw;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return digest.digest(raw);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("Unable to initialize JWT secret", ex);
        }
    }
}
