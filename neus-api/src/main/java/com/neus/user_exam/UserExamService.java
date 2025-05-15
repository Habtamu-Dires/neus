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

    // update user exam
    @Transactional
    public void updateUserExam(@Valid UpdateUserExamDto dto, Authentication authentication) {
        String userId = authentication.getName();
        UserExam userExam = userExamRepository
                .findByUserIdAndExamId(userId, UUID.fromString(dto.examId()))
                .or(() -> Optional.of(createUserExam(dto,userId)))
                .orElseThrow(() -> new RuntimeException("User Exam couldn't be created"));

        userExam.setLastModifiedDate(LocalDateTime.now());
        userExam.setStatus(dto.status());
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

    // create new user exam if not exists
    @Transactional
    public UserExam createUserExam(UpdateUserExamDto dto,String userId) {
        User user = userService.findByExternalId(userId);
        Exam exam = examService.findByExternalId(dto.examId());

        UserExam userExam = UserExam.builder()
                .user(user)
                .exam(exam)
                .status(dto.status())
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


    // get user answers
    public UserExamDto getUserAnswers(String examId, Authentication authentication) {
        String userId = authentication.getName();
        UserExam userExam = userExamRepository
                .findByUserIdAndExamId(userId, UUID.fromString(examId))
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
