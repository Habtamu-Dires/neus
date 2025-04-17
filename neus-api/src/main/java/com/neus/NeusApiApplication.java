package com.neus;

import com.neus.common.SubscriptionLevel;
import com.neus.subscription_plan.SubscriptionPlan;
import com.neus.subscription_plan.SubscriptionPlanRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@SpringBootApplication
@EnableConfigurationProperties
@EnableAsync
@EnableScheduling
public class NeusApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(NeusApiApplication.class, args);
	}

	//ToDo: to be replaced by flay way migration
	@Bean
	CommandLineRunner runner(SubscriptionPlanRepository subPlanRepository){

		return args -> {
				//create basic if not exists
			if(subPlanRepository.getByLevel(SubscriptionLevel.BASIC).isEmpty()){
				subPlanRepository.save(
						SubscriptionPlan.builder()
							.externalId(UUID.randomUUID())
							.level(SubscriptionLevel.BASIC)
							.price(BigDecimal.valueOf(350L))
							.benefits(List.of("things"))
							.enabled(true)
							.build()
				);
			}

			if(subPlanRepository.getByLevel(SubscriptionLevel.ADVANCED).isEmpty()){
				subPlanRepository.save(
						SubscriptionPlan.builder()
							.externalId(UUID.randomUUID())
							.level(SubscriptionLevel.ADVANCED)
							.price(BigDecimal.valueOf(500L))
							.benefits(List.of("things"))
							.enabled(true)
							.build()
				);
			}

			if(subPlanRepository.getByLevel(SubscriptionLevel.PREMIUM).isEmpty()){
				subPlanRepository.save(
						SubscriptionPlan.builder()
							.externalId(UUID.randomUUID())
							.level(SubscriptionLevel.PREMIUM)
							.price(BigDecimal.valueOf(1000L))
							.benefits(List.of("things"))
							.enabled(true)
							.build()
				);
			}


		};
	}



}
