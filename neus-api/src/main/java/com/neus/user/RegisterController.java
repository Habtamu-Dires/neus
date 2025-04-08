package com.neus.user;

import com.neus.user.dto.registrationDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/register")
@Tag(name = "register")
public class RegisterController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<?> register(
            @RequestBody @Valid registrationDto dto
    ){
        userService.createUser(dto);
        return ResponseEntity.accepted().build();
    }
}
