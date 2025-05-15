package com.neus.user.dto;

import com.neus.common.SubscriptionLevel;
import com.neus.subscription.Subscription;
import com.neus.user.User;

import java.time.LocalDateTime;


public class UserDtoMapper {

    public static UserDto toUserDto(User user){
        return UserDto.builder()
                .id(user.getExternalId())
                .email(user.getEmail())
                .subscriptionLevel(getActiveSubscriptionLevel(user))
                .startDate(user.getSubscription()!=null? user.getSubscription().getStartDate():null)
                .endDate(user.getSubscription()!=null? user.getSubscription().getEndDate():null)
                .registeredDate(user.getRegistrationDate())
                .enabled(user.isEnabled())
                .build();
    }

    private static SubscriptionLevel getActiveSubscriptionLevel(User user){
        Subscription subscription = user.getSubscription();
        if(subscription !=null && subscription.getEndDate().isAfter(LocalDateTime.now())){
            return subscription.getLevel();
        }
        return null;
    }
}
