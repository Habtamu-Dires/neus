package com.neus.user;

import com.neus.common.PageResponse;
import com.neus.user.dto.UserDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "users")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // get pages of users
    @GetMapping("/page")
    public ResponseEntity<PageResponse<UserDto>> getPageOfUsers(
            @RequestParam(value = "page",defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "10", required = false) int size
    ){
        return ResponseEntity.ok(userService.getPageOfUsers(page,size));
    }

    // delete user
    @DeleteMapping("/{user-id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("user-id") String userId) {
        userService.deleteUser(userId);
        return ResponseEntity.accepted().build();
    }

    // toggle enable status
    @PutMapping("/{user-id}")
    public ResponseEntity<?> toggleUserStatus(
            @PathVariable("user-id") String userId) {
        userService.toggleEnableStatus(userId);
        return ResponseEntity.accepted().build();
    }
}
