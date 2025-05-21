package com.neus.exam;

import com.neus.common.NumberDto;
import com.neus.common.PageResponse;
import com.neus.common.SubscriptionLevel;
import com.neus.exam.dto.*;
import com.neus.exceptions.ResourceNotFoundException;
import com.neus.question.Question;
import com.neus.question.QuestionRepository;
import com.neus.question.QuestionService;
import com.neus.question.dto.QuestionDetailDto;
import com.neus.question.dto.QuestionDtoMapper;
import com.neus.question_choice_stats.QuestionChoiceStats;
import com.neus.question_choice_stats.QuestionChoiceStatsService;
import com.neus.resource.Resource;
import com.neus.resource.ResourceRepository;
import com.neus.resource.ResourceType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import static com.neus.common.ExtractRoleFromJwt.getUserRoleFromJwt;
import static com.neus.common.ExtractRoleFromJwt.mapRoleToSubscriptionLevel;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final ResourceRepository resourceRepository;
    private final QuestionRepository questionRepository;
    private final QuestionService questionService;
    private final QuestionDtoMapper questionDtoMapper;
    private final ExamDtoMapper examDtoMapper;
    private final QuestionChoiceStatsService choiceStatsService;

    // create an exam
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void createExam(CreateExamDto dto){

        //get parent resource
        Resource parentResource = getParentResource(dto.examType());

        Resource resource = resourceRepository.save(
            Resource.builder()
                .externalId(UUID.randomUUID())
                .title(dto.title())
                .description(dto.description())
                .type(ResourceType.EXAM)
                .requiredSubLevel(parentResource != null
                        ? parentResource.getRequiredSubLevel()
                        : dto.requiredSubLevel()
                )
                .parentResource(parentResource)
                .build()
        );

        examRepository.save(
            Exam.builder()
                .externalId(resource.getExternalId())
                .resource(resource)
                .duration(dto.duration())
                .examType(dto.examType())
                .year(dto.year())
                .randomQuestionCount(dto.randomQuestionCount())
                .build()
        );
    }
    // get parent resource (exam)
    private Resource getParentResource(ExamType examType){
        if(examType.equals(ExamType.TEST)){
             return null;
        }
        return this.findParentExamResource(examType);
    }

    // find parent exam resource
    public Resource findParentExamResource(ExamType examType){
        ResourceType resourceType = ResourceType.valueOf(examType.name());
        return resourceRepository.findParentExamResource(resourceType)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Parent resource not found")
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

        List<ExamDto> examDtoList = res.map(exam ->
            examDtoMapper.mapToExamDto(exam, exam.getResource())
        ).toList();

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
        return examDtoMapper.mapToExamDto(exam,exam.getResource());
    }

    // get exam detail by ExamType and Year
    public ExamDetailDto getExamDetail(
            String examId, String department, String block, Authentication authentication
    ) {
        // Fetch the resource
        Resource resource = resourceRepository.findByExternalId(UUID.fromString(examId))
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

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

        List<QuestionDetailDto> questionDetailDtos;
        if(hasFullAccess){

            if(exam.getRandomQuestionCount() != null && exam.getRandomQuestionCount() > 0
                && (department == null || department.isBlank())
            ) {  // random sampling for USMLE
                Pageable page = PageRequest.ofSize(exam.getRandomQuestionCount());

                List<Question> sampleQuestions = questionRepository.findRandomQuestion(page,exam.getId());
                //fetch choice stats for specific questions
                List<String> questionIds = sampleQuestions
                        .parallelStream()
                        .map(q -> q.getExternalId().toString()).toList();
                var stats = choiceStatsService.getChoiceStatsByQuestionIds(questionIds);
                Map<String,List<QuestionChoiceStats>> choiceStatsByQuestionId = stats.stream()
                        .collect(Collectors.groupingBy(
                                stat -> stat.getId().getQuestionId()
                        ));
                questionDetailDtos = sampleQuestions
                        .stream()
                        .sorted(Comparator.comparingInt(Question::getQuestionNumber))
                        .map(question -> questionDtoMapper.mapToQuestionDetailDto(
                                question,
                                choiceStatsByQuestionId.get(question.getExternalId().toString()))
                        )
                        .toList();
            } else { // in case of no random sampling
                List<QuestionChoiceStats> stats = choiceStatsService.getChoiceStatsByExamId(exam.getId());
                // group by question (externalId)
                Map<String,List<QuestionChoiceStats>> choiceStatsByQuestionId =
                        stats.parallelStream()
                        .collect(Collectors.groupingBy(
                                stat -> stat.getId().getQuestionId()
                        ));

                questionDetailDtos = questionService
                        .getQuestionsByExamId(exam.getId(), department, block)
                        .stream()
                        .map(question -> questionDtoMapper.mapToQuestionDetailDto(
                                question,
                                choiceStatsByQuestionId.get(question.getExternalId().toString()))
                        )
                        .toList();
            }
        } else { // preview mode
            List<Question> previewQuestions = questionService
                    .getPreviewQuestionsByExamId(exam.getId(), department, block);

            //fetch choice stats for specific questions
            List<String> questionIds = previewQuestions.stream()
                    .map(q -> q.getExternalId().toString()).toList();
            var stats = choiceStatsService.getChoiceStatsByQuestionIds(questionIds);
            Map<String,List<QuestionChoiceStats>> choiceStatsByQuestionId = stats.stream()
                    .collect(Collectors.groupingBy(
                            stat -> stat.getId().getQuestionId()
                    ));

            questionDetailDtos = previewQuestions
                    .stream()
                    .map(question -> questionDtoMapper.mapToQuestionDetailDto(
                            question,
                            choiceStatsByQuestionId.get(question.getExternalId().toString()))
                    )
                    .toList();
        }

        // Build & Return the response DTO
        return examDtoMapper.mapToExamDetailDto(exam, resource, questionDetailDtos);
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
        // check wheather to update parent resource
        if(!dto.examType().equals(exam.getExamType())){ // if it not equal
            Resource parentExamResource = this.findParentExamResource(dto.examType());
            resource.setParentResource(parentExamResource);
        }
        resourceRepository.save(resource);

        // save exam
        exam.setDuration(dto.duration());
        exam.setExamType(dto.examType());
        exam.setYear(dto.year());
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

    // get exam years by exam type
    public List<NumberDto> getYearsByExamType(ExamType examType) {
        return examRepository.findYearsByExamType(examType);
    }

    // get exam names by exam type and years
    public List<ExamNameDto> getExamNamesByExamTypeAndYear(ExamType examType, int year) {
        return examRepository.findExamNamesByExamTypeAndYear(examType, year);
    }


    // get exam names by exam type
    public List<ExamNameDto> getExamNamesByExamType(ExamType examType) {
        return examRepository.findExamNamesByExamType(examType);
    }

    // filter exams
    public PageResponse<ExamDto> filterExams(
            String title, String type, Integer year, String requiredSubLevel, int page, int size
    ) {
        ExamType examType = null;
        try {
            examType = ExamType.valueOf(type);
        }catch (Exception _){}

        SubscriptionLevel requiredLevel = null;
        try {
            requiredLevel = SubscriptionLevel.valueOf(requiredSubLevel);
        }catch (Exception _){};

        Specification<Exam> spec = ExamSpecification.filterExams(title,examType,year,requiredLevel);

        Pageable pageable = PageRequest.of(page,size);

        Page<Exam> res = examRepository.findAll(spec, pageable);

        List<ExamDto> examDtoList = res.map(exam -> examDtoMapper
                        .mapToExamDto(exam, exam.getResource()))
                        .toList();

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
}
