package com.miros.ArbiterReact;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@EnableJpaRepositories(basePackages = "com.miros.ArbiterReact.repositories")
@SpringBootApplication
public class ArbiterReactApplication {

	public static void main(String[] args) {
		SpringApplication.run(ArbiterReactApplication.class, args);
	}
}
