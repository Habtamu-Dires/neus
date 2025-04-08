package com.neus.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;

@Validated
public record registrationDto(
        @NotEmpty(message = "Username is mandatory")
        String username,
        @NotEmpty(message = "Email is mandatory")
        @Email(message = "Email format not accepted")
        String email,
        @NotEmpty(message = "Password is mandatory")
        @Size(min = 4, message = "Password should have 4 characters minimum")
        String password
) { }
