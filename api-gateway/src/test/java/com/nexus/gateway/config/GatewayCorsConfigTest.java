package com.nexus.gateway.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.cors.reactive.CorsWebFilter;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class GatewayCorsConfigTest {

    @Test
    void corsWebFilter_ConfiguredCorrectly() {
        GatewayCorsConfig config = new GatewayCorsConfig();
        CorsWebFilter filter = config.corsWebFilter();
        assertNotNull(filter);
    }
}
