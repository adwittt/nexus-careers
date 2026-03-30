package com.nexus.application.config;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class SwaggerConfigTest {

    @Test
    void instantiate_Success() {
        SwaggerConfig config = new SwaggerConfig();
        assertNotNull(config);
    }
}
