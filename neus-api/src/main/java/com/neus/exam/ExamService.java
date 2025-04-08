package com.neus.exam;

import com.neus.common.SubscriptionLevel;
import com.neus.exam.dto.CreateExamDto;
import com.neus.exam.dto.ExamDto;
import com.neus.exceptions.ResourceNotFoundException;
import com.neus.question.dto.QuestionDto;
import com.neus.question.dto.QuestionDtoMapper;
import com.neus.question.QuestionRepository;
import com.neus.resource.Resource;
import com.neus.resource.ResourceRepository;
import com.neus.resource.ResourceType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static com.neus.common.ExtractUserRole.getUserRoleFromJwt;
import static com.neus.common.ExtractUserRole.mapRoleToSubscriptionLevel;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final ResourceRepository resourceRepository;
    private final QuestionRepository questionRepository;
    private final QuestionDtoMapper questionDtoMapper;

    public ExamDto getExamDetail(String examId, Authentication authentication) {
        // Fetch the resource
        Resource resource = resourceRepository.findByExternalId(UUID.fromString(examId))
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        //  Verify it’s an exam
        if(!resource.getType().equals(ResourceType.EXAM)){
            throw new IllegalArgumentException("Resource is not an exam");
        }

        // Get the required subscription level
        SubscriptionLevel requiredLevel = resource.getRequiredSubLevel();

        // Check user’s subscription level (from JWT roles)
        String userRole = getUserRoleFromJwt(authentication);
        SubscriptionLevel userLevel = mapRoleToSubscriptionLevel(userRole);

        //  Determine access
        boolean hasFullAccess = userLevel != null && userLevel.compareTo(requiredLevel) >= 0;

        //  Fetch exam details
        Exam exam = examRepository.findByResourceId(resource.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));


        List<QuestionDto> questionDtos;
        if(hasFullAccess){
            questionDtos = questionRepository.findByExamId(exam.getId()).stream()
                    .map(questionDtoMapper::mapToQuestionDto)
                    .toList();
        } else {
            Pageable page = PageRequest.of(0, 1);
            questionDtos = questionRepository.findPreviewQuestions(exam.getId(),page).stream()
                    .map(questionDtoMapper::mapToQuestionDto)
                    .toList();
        }

        // Build & Return the response DTO
        return ExamDto.builder()
                .title(resource.getTitle())
                .description(resource.getDescription())
                .duration(exam.getDuration())
                .questions(questionDtos)
                .build();
    }

    // create an exam
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void createExam(CreateExamDto dto){
        Resource resource = resourceRepository.save(
            Resource.builder()
                .externalId(UUID.randomUUID())
                .title(dto.title())
                .department(dto.department())
                .description(dto.description())
                .type(ResourceType.EXAM)
                .requiredSubLevel(dto.requiredSubLevel())
                .build()
        );

        examRepository.save(
            Exam.builder()
                .resource(resource)
                .externalId(resource.getExternalId())
                .duration(dto.duration())
                .build()
        );
    }

    // find exam by external id
    public Exam findByExternalId(String externalId) {
         return examRepository.findExternalId(UUID.fromString(externalId))
                 .orElseThrow(()-> new ResourceNotFoundException("Exam not found"));
    }
}
