package com.neus.user;

import com.neus.common.PageResponse;
import com.neus.exceptions.ResourceNotFoundException;
import com.neus.keycloak.KeycloakService;
import com.neus.keycloak.KeycloakUserRequest;
import com.neus.user.dto.UserDto;
import com.neus.user.dto.UserDtoMapper;
import com.neus.user.dto.registrationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final KeycloakService keycloakService;

    @Transactional
    public void createUser(registrationDto dto) {
        String keyCloakUserId = null;
        try{
            KeycloakUserRequest keycloakUserRequest = KeycloakUserRequest.builder()
                    .username(dto.username())
                    .password(dto.password())
                    .email(dto.email())
                    .enabled(true)
                    .build();
            //save to keycloak
            keyCloakUserId = keycloakService.createUser(keycloakUserRequest);

            User user = User.builder()
                    .externalId(keyCloakUserId)
                    .username(dto.username())
                    .email(dto.email())
                    .enabled(true)
                    .registrationDate(LocalDateTime.now())
                    .build();

            // save to database
            userRepository.save(user);
            userRepository.flush();

        } catch (Exception e){
            // RollBack in keycloak if database operation failed
            if(keyCloakUserId != null){
                try{
                    keycloakService.deleteUser(keyCloakUserId);
                } catch (Exception ex){
                    throw new RuntimeException("Failed to rollback Keycloak user creation after database failure", ex);
                }
            }
            throw new RuntimeException("Error "
                    + e.getMessage());
        }
    }

    // get all users
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> UserDto.builder()
                        .username(u.getUsername())
                        .email(u.getUsername())
                        .build())
                .toList();
    }

    // get pages of user
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public PageResponse<UserDto> getPageOfUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> res = userRepository.findAll(pageable);

        List<UserDto> userDtoList = res.map(UserDtoMapper::toUserDto).toList();

        return PageResponse.<UserDto>builder()
                .content(userDtoList)
                .totalElements(res.getTotalElements())
                .numberOfElements(res.getNumberOfElements())
                .totalPages(res.getTotalPages())
                .size(res.getSize())
                .number(res.getNumber())
                .first(res.isFirst())
                .last(res.isLast())
                .empty(res.isEmpty())
                .build();
    }

    // delete user
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public void deleteUser(String userId) {
        User user = this.findByExternalId(userId);

        try{
            keycloakService.deleteUser(userId);
        } catch (Exception e){
            throw new RuntimeException("Keycloak user deletion failed: " + e.getMessage(), e);
        }
        try{
            userRepository.deleteById(user.getId());
        } catch (Exception e) {
            //roll back the keycloak deletion
            KeycloakUserRequest keycloakUserRequest = KeycloakUserRequest.builder()
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .enabled(user.isEnabled())
                    .build();
            keycloakService.createUser(keycloakUserRequest); // create again
            throw  new RuntimeException("Database deletion failed " + e.getMessage());
        }
    }

    // find user by external id
    public User findByExternalId(String userId){
        return userRepository.findByExternalId(userId)
                .orElseThrow(()-> new ResourceNotFoundException("User not Found"));
    }

    // toggle enable status
    public void toggleEnableStatus(String userId) {
        User user = this.findByExternalId(userId);
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
    }


}
