package com.nexus.gateway.filter;

import com.nexus.gateway.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Global JWT filter — runs before every routed request.
 *
 * Logic:
 *  1. Allow public paths through (register, login, GET /api/jobs)
 *  2. Extract and validate Bearer token from Authorization header
 *  3. Inject X-User-Email, X-User-Role, X-User-Id, X-User-Name headers into downstream request
 *  4. Return 401 if token is missing or invalid
 */
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /** Paths that never require a token */
    private static final List<String> PUBLIC_PATHS = List.of(
        "/api/auth/register",
        "/api/auth/login",
        "/api/auth/validate",
        "/api/auth/forgot-password",
        "/api/auth/reset-password"
    );

    /** GET-only public paths (job browsing without login) */
    private static final List<String> PUBLIC_GET_PREFIXES = List.of(
        "/api/jobs",
        "/api/auth/me",
        "/api/applications/download",
        "/v3/api-docs",
        "/swagger-ui"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path   = request.getPath().value();
        String method = request.getMethod().name();

        log.info("Gateway Filter: Method={}, Path={}", method, path);

        // Allow public paths & OPTIONS pre-flight
        if ("OPTIONS".equals(method) ||
            PUBLIC_PATHS.stream().anyMatch(p -> path.equals(p) || path.endsWith(p))) {
            return chain.filter(exchange);
        }

        // Allow public GET paths (job listings visible without auth)
        if (HttpMethod.GET.name().equals(method) &&
            PUBLIC_GET_PREFIXES.stream().anyMatch(p -> path.equals(p) || path.contains(p))) {
            return chain.filter(exchange);
        }

        // Extract Authorization header
        String authHeader = request.getHeaders().getFirst("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("Missing or invalid Authorization header for path: {}", path);
            return onUnauthorized(exchange, "Missing Authorization header");
        }

        String token = authHeader.substring(7);

        // Validate token
        if (!jwtUtil.isTokenValid(token)) {
            log.debug("Invalid or expired JWT for path: {}", path);
            return onUnauthorized(exchange, "Invalid or expired token");
        }

        // Extract claims
        String email  = jwtUtil.extractUsername(token);
        String role   = jwtUtil.extractRole(token);
        String userId = jwtUtil.extractUserId(token);
        // FIX: extract real display name instead of forwarding email as name
        String name   = jwtUtil.extractName(token);
        if (name == null || name.isBlank()) {
            name = email; // fallback to email if name claim absent (old tokens)
        }

        log.info("Gateway Extracted: email={}, role={}, userId={}, name={}", email, role, userId, name);
        log.debug("Authenticated request: {} {} [role={}]", method, path, role);

        // Inject user context headers into downstream request
        ServerHttpRequest mutatedRequest = request.mutate()
            .header("X-User-Email", email  != null ? email  : "")
            .header("X-User-Role",  role   != null ? role   : "")
            .header("X-User-Id",    userId != null ? userId : "0")
            .header("X-User-Name",  name)
            .build();

        ServerWebExchange mutatedExchange = exchange.mutate()
            .request(mutatedRequest)
            .build();

        return chain.filter(mutatedExchange);
    }

    /** Return 401 Unauthorized with a JSON body */
    private Mono<Void> onUnauthorized(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().add("Content-Type", "application/json");
        var body = String.format("{\"status\":401,\"message\":\"%s\"}", message);
        var buffer = exchange.getResponse()
            .bufferFactory()
            .wrap(body.getBytes());
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    /** Run before other filters (highest precedence) */
    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
