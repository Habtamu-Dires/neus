package com.neus.user_exam;

import com.neus.user_exam.dto.UpdateUserExamDto;
import com.neus.user_exam.dto.UserExamDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user-exam")
@Tag(name = "user-exam")
@RequiredArgsConstructor
public class UserExamController {
    private final UserExamService userExamService;

    // save user answers
    @PutMapping
    private ResponseEntity<?> saveUserAnswers(
            @RequestBody @Valid UpdateUserExamDto dto,
            Authentication authentication
    ){
        userExamService.updateUserExam(dto, authentication);
        return ResponseEntity.accepted().build();
    }

    // fetch user answers
    @GetMapping("/{exam-id}")
    public ResponseEntity<UserExamDto> getUserAnswers(
        @PathVariable("exam-id") String examId,
        Authentication authentication
    ){
        return ResponseEntity.ok(userExamService.getUserAnswers(examId, authentication));
    }

    // reset user answers
    @PutMapping("/reset/{user-id}/{exam-id}/{mode}")
    private ResponseEntity<?> restUserAnswers(
            @PathVariable("user-id") String userId,
            @PathVariable("exam-id") String examId,
            @PathVariable("mode") String mode
    ){
        userExamService.resetUserAnswers(userId, examId, mode);
        return ResponseEntity.accepted().build();
    }
}
