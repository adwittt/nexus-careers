package com.nexus.job.service;

import org.junit.jupiter.api.Test;

class ApplicationMessageConsumerTest {
    @Test
    void testConsume() {
        ApplicationMessageConsumer consumer = new ApplicationMessageConsumer();
        consumer.consumeMessage("test");
    }
}
