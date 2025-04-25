package com.neus.user_exam;

import com.neus.exam.Exam;
import com.neus.exam.ExamService;
import com.neus.user.User;
import com.neus.user.UserService;
import com.neus.user_exam.dto.UpdateUserExamDto;
import com.neus.user_exam.dto.UserExamDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserExamService {

    private final UserExamRepository userExamRepository;
    private final UserService userService;
    private final ExamService examService;

    // create new user exam
    @Transactional
    public UserExam createUserExam(UpdateUserExamDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        User user = userService.findByExternalId(userId);
        Exam exam = examService.findByExternalId(dto.examId());

        UserExam userExam = UserExam.builder()
                .user(user)
                .exam(exam)
                .lastModifiedDate(LocalDateTime.now())
                .build();
        if(dto.mode() == ExamMode.STUDY){
            userExam.setStudyModeUserAnswers(dto.userAnswers());
            userExam.setStudyModeCorrectAnswers(dto.correctAnswers());
        } else if(dto.mode() == ExamMode.TEST){
            userExam.setTestModeUserAnswers(dto.userAnswers());
            userExam.setTestModeCorrectAnswers(dto.correctAnswers());
            userExam.setTimeLeftInMinutes(dto.timeLeftInMinutes());
        }
        return userExamRepository.save(userExam);
    }

    // update user exam
    @Transactional
    public void updateUserExam(@Valid UpdateUserExamDto dto, Authentication authentication) {
        String userId = authentication.getName();
        UserExam userExam = userExamRepository
                .findByUserIdExamIdAndMode(userId, UUID.fromString(dto.examId()))
                .or(() -> Optional.of(createUserExam(dto)))
                .orElseThrow(() -> new RuntimeException("User Exam couldn't be created"));

        userExam.setLastModifiedDate(LocalDateTime.now());
        if(dto.mode() == ExamMode.STUDY){
            userExam.setStudyModeUserAnswers(dto.userAnswers());
            userExam.setStudyModeCorrectAnswers(dto.correctAnswers());
        } else if(dto.mode() == ExamMode.TEST){
            userExam.setTestModeUserAnswers(dto.userAnswers());
            userExam.setTestModeCorrectAnswers(dto.correctAnswers());
            userExam.setTimeLeftInMinutes(dto.timeLeftInMinutes());
        }
        userExamRepository.save(userExam);
    }

    // reset user answers
    @Transactional
    public void resetUserAnswers(String userId, String examId, String mode) {
        UserExam userExam = userExamRepository
                .findByUserIdExamIdAndMode(userId, UUID.fromString(examId))
                .orElseThrow(() -> new RuntimeException("User Exam couldn't be found"));

        userExam.setLastModifiedDate(LocalDateTime.now());
        if(mode.equals(ExamMode.STUDY.toString())){
            userExam.setStudyModeUserAnswers(null);
            userExam.setStudyModeCorrectAnswers(null);
        } else if(mode.equals(ExamMode.TEST.toString())){
            userExam.setTestModeUserAnswers(null);
            userExam.setTestModeCorrectAnswers(null);
            userExam.setTimeLeftInMinutes(null);
        }
        userExamRepository.save(userExam);
    }

    // get user answers
    public UserExamDto getUserAnswers(String examId, Authentication authentication) {
        String userId = authentication.getName();
        UserExam userExam = userExamRepository
                .findByUserIdExamIdAndMode(userId, UUID.fromString(examId))
                .orElseThrow(() -> new RuntimeException("User Exam doesn't exist"));

        return UserExamDto.builder()
            .userId(userId)
            .examId(examId)
            .lastModifiedDate(userExam.getLastModifiedDate())
            .timeLeftInMinutes(userExam.getTimeLeftInMinutes())
            .studyModeCorrectAnswers(userExam.getStudyModeCorrectAnswers())
            .studyModeUserAnswers(userExam.getStudyModeUserAnswers())
            .testModeCorrectAnswers(userExam.getTestModeCorrectAnswers())
            .testModeUserAnswers(userExam.getTestModeUserAnswers())
            .build();
    }
}
