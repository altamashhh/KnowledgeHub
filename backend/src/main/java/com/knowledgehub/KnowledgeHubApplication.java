package com.knowledgehub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * KnowledgeHub — Personal Technical Learning Knowledge Management System.
 *
 * <p>Entry point for the Spring Boot application. All auto-configuration is
 * handled by Spring Boot. Flyway migrations run on startup before Hibernate
 * validation.</p>
 */
@SpringBootApplication
public class KnowledgeHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(KnowledgeHubApplication.class, args);
    }
}
