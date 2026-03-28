package com.nexus.job.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;


@Service
public class ApplicationMessageConsumer {
    private static final Logger log = LoggerFactory.getLogger(ApplicationMessageConsumer.class);
    
    @RabbitListener(queues = "application_queue")
    public void consumeMessage(String message) {
        log.info("Job Service received RabbitMQ notification -> {}", message);
    }
}
