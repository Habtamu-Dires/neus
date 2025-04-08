package com.neus.user.dto;

import com.neus.user.User;

public class UserDtoMapper {

    public static UserDto toUserDto(User user){
        return UserDto.builder()
                .id(user.getExternalId())
                .username(user.getUsername())
                .email(user.getEmail())
                .subscriptionLevel(user.getSubscription()!=null? user.getSubscription().getLevel():null)
                .startDate(user.getSubscription()!=null? user.getSubscription().getStartDate():null)
                .endDate(user.getSubscription()!=null? user.getSubscription().getEndDate():null)
                .registeredDate(user.getRegistrationDate())
                .enabled(user.isEnabled())
                .build();
    }
}
