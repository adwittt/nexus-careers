package com.nexus.application.service;

import com.nexus.application.config.RabbitMQConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class ApplicationMessageProducer {
    private static final Logger log = LoggerFactory.getLogger(ApplicationMessageProducer.class);

    private final RabbitTemplate rabbitTemplate;

    public ApplicationMessageProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendApplicationEvent(String message) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, message);
        log.info("Sent RabbitMQ message: {}", message);
    }
}
