package com.neus.user.dto;

public record UserAggregateData(
        Long registered_users,
        Long basic_subscribers,
        Long advanced_subscribers,
        Long premium_subscribers
) {}
