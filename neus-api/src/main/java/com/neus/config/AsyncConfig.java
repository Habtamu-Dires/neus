package com.neus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class AsyncConfig {

   // @Bean(name = "cpuBoundExecutor")
    public Executor cpuBoundExecutor(){
        ThreadPoolTaskExecutor taskExecutor = new ThreadPoolTaskExecutor();
        taskExecutor.setCorePoolSize(1);
        taskExecutor.setMaxPoolSize(1);
        taskExecutor.setQueueCapacity(5);
        taskExecutor.setThreadNamePrefix("cpu-task-");
        taskExecutor.setAllowCoreThreadTimeOut(true); // Allows core threads to be released if idle
        taskExecutor.setKeepAliveSeconds(60); // If idle for 60 seconds, terminate the thread
        taskExecutor.initialize();
        return taskExecutor;
    }
}
