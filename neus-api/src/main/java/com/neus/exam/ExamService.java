package com.neus.exam;

import com.neus.common.PageResponse;
import com.neus.common.SubscriptionLevel;
import com.neus.exam.dto.CreateExamDto;
import com.neus.exam.dto.ExamDetailDto;
import com.neus.exam.dto.ExamDto;
import com.neus.exam.dto.ExamDtoMapper;
import com.neus.exceptions.ResourceNotFoundException;
import com.neus.question.QuestionRepository;
import com.neus.question.dto.QuestionDto;
import com.neus.question.dto.QuestionDtoMapper;
import com.neus.resource.Resource;
import com.neus.resource.ResourceRepository;
import com.neus.resource.ResourceType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
    private final ExamDtoMapper examDtoMapper;

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
    // get page of exams
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public PageResponse<ExamDto> getPageOfExams(int page, int size) {
        Pageable pageable = PageRequest.of(page,size);
        Page<Exam> res = examRepository.findAll(pageable);

        List<ExamDto> examDtoList = res.map(exam -> {
            Resource resource = this.findResourceById(exam.getId());
            return examDtoMapper.mapToExamDto(exam, resource);
        }).toList();

        return PageResponse.<ExamDto>builder()
                .content(examDtoList)
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

    // get exam by id
    @PreAuthorize("hasRole('ADMIN')")
    public ExamDto getExamById(String examId) {
        Exam exam = this.findByExternalId(examId);
        Resource resource = this.findResourceById(exam.getId());
        return examDtoMapper.mapToExamDto(exam,resource);
    }

    // get exam detail
    public ExamDetailDto getExamDetail(String examId, Authentication authentication) {
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
        boolean hasFullAccess = false;
        if(requiredLevel == SubscriptionLevel.NONE){
            hasFullAccess = true;
        } else {
            hasFullAccess = userLevel != null && userLevel.compareTo(requiredLevel) >= 0;
        }

        //  Fetch exam 
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
        return examDtoMapper.mapToExamDetailDto(exam, resource, questionDtos);
    }

    // find resource by id
    public Resource findResourceById(Long id){
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
    }

    // update exam
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void updateExam(CreateExamDto dto) {
        Exam exam = this.findByExternalId(dto.id());
        Resource resource = this.findResourceById(exam.getId());

        resource.setTitle(dto.title());
        resource.setDescription(dto.description());
        resource.setRequiredSubLevel(dto.requiredSubLevel());
        resource.setDepartment(dto.department());
        resourceRepository.save(resource);

        // save exam
        exam.setDuration(dto.duration());
        examRepository.save(exam);

    }

    // delete exam
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteExam(String examId) {
        Exam exam = this.findByExternalId(examId);
        Resource resource = this.findResourceById(exam.getId());
        examRepository.delete(exam);
        resourceRepository.delete(resource);
    }

}
