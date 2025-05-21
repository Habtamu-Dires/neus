package com.neus.question;

import com.neus.common.TextDto;
import com.neus.exam.Exam;
import com.neus.exam.ExamRepository;
import com.neus.exam.ExamType;
import com.neus.exceptions.ResourceNotFoundException;
import com.neus.file.FileStorageService;
import com.neus.question.dto.CreateChoiceDto;
import com.neus.question.dto.CreateQuestionDto;
import com.neus.question.dto.QuestionDto;
import com.neus.question.dto.QuestionDtoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ExamRepository examRepository;
    private final FileStorageService fileStorageService;
    private final QuestionDtoMapper questionDtoMapper;

    // create question
    @PreAuthorize("hasRole('ADMIN')")
    public void createQuestion(CreateQuestionDto dto){
        Exam exam = this.findExamByExternalId(dto.examId());

        questionRepository.save(
              Question.builder()
                  .externalId(UUID.randomUUID())
                  .exam(exam)
                  .questionNumber(dto.questionNumber())
                  .questionText(dto.questionText())
                  .choice(addChoiceId(dto.choices()))
                  .explanation(dto.explanation())
                  .department(dto.department())
                  .blockNumber(dto.blockNumber())
                  .mediaUrls(dto.mediaUrls())
                  .build()
            );
    }

    //find exam by external id
    private Exam findExamByExternalId(String externalId){
        return examRepository.findExternalId(UUID.fromString(externalId))
                .orElseThrow(()-> new ResourceNotFoundException("Exam not found"));
    }

    // add choice id
    private List<Choice> addChoiceId(List<CreateChoiceDto> choiceList){
        return choiceList.stream()
                .map(c -> {
                   if(isValidUUID(c.id())){
                       return  Choice.builder()
                               .id(UUID.fromString(c.id()))
                               .text(c.text())
                               .isCorrect(c.isCorrect())
                               .build();
                   }   else {
                       return  Choice.builder()
                               .id(UUID.randomUUID())
                               .text(c.text())
                               .isCorrect(c.isCorrect())
                               .build();
                   }
                })
                .toList();
    }

    //  uuid validator
    private boolean isValidUUID(String uuid){
        try {
            UUID.fromString(uuid);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    // update question
    @PreAuthorize("hasRole('ADMIN')")
    public void updateQuestion(@Valid CreateQuestionDto dto) {
        Question question = this.findByExternalId(dto.id());

        question.setQuestionNumber(dto.questionNumber());
        question.setQuestionText(dto.questionText());
        question.setChoice(addChoiceId(dto.choices()));
        question.setExplanation(dto.explanation());
        question.setDepartment(dto.department());
        question.setBlockNumber(dto.blockNumber());
        question.setMediaUrls(dto.mediaUrls());

        questionRepository.save(question);
    }

    // get questions by exam id
    @PreAuthorize("hasRole('ADMIN')")
    public List<QuestionDto> getQuestionByExamId(String examId) {
        Exam exam = this.findExamByExternalId(examId);
        return questionRepository.findByExamId(exam.getId())
                .stream()
                .sorted(Comparator.comparing(Question::getQuestionNumber))
                .map(questionDtoMapper::mapToQuestionDto)
                .toList();
    }

    // find question by external id
    @Transactional
    public Question findByExternalId(String externalId){
        return questionRepository.findByExternalId(UUID.fromString(externalId))
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
    }

    // delete question
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteQuestion(String questionId) {
        Question question = this.findByExternalId(questionId);
        List<String> mediaUrls = question.getMediaUrls();
        questionRepository.delete(question);
        // delete mediaUrls
        if(mediaUrls != null){
            for(String url: mediaUrls){
                fileStorageService.deleteFile(url);
            }
        }
    }

    // upload image
    @PreAuthorize("hasRole('ADMIN')")
    public TextDto uploadMedia(MultipartFile file) {
        String url = fileStorageService.saveFile(file, "Image");
        return new TextDto(url);
    }

    // delete image
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteMedia(String url) {
        fileStorageService.deleteFile(url);
    }

    // get departments by exam type
    public List<Department[]> getDepartmentsByExamType(ExamType examType, int year) {
        return questionRepository.findDepartmentsByExamTypeAndYear(examType, year);
    }

    // get question by exam id
    public List<Question> getQuestionsByExamId(
            Long examId, String department, String block
    ){
        Department dept = null;
        BlockNumber blockNumber = null;
        try{
            blockNumber = BlockNumber.valueOf(block);
        } catch (Exception _){} // ignored
        try {
            dept = Department.valueOf(department);
        }catch (Exception _){} // ignored

        var questionSpec = QuestionSpecification.getQuestionByExamId(examId, dept, blockNumber);
        return questionRepository.findAll(questionSpec);
    }

    // get question by exam id
    public List<Question> getPreviewQuestionsByExamId(
            Long examId, String department, String block
    ){
        Department dept = null;
        BlockNumber blockNumber = null;
        try{
            blockNumber = BlockNumber.valueOf(block);
        } catch (Exception _){} // ignored
        try {
            dept = Department.valueOf(department);
        }catch (Exception _){} // ignored

        var questionSpec = QuestionSpecification.getQuestionByExamId(examId, dept, blockNumber);

        Pageable pageable = PageRequest.of(0,1);

         return questionRepository.findAll(questionSpec,pageable)
                 .stream()
                 .toList();
    }

    // get Block number exam type, year and department
    public List<BlockNumber> getBlocksByExamTypeAndYearAndDepartment(
            ExamType examType, int year, String department
    ) {
        Department dept = null;
        try{
            dept = Department.valueOf(department);
        }catch (Exception _){}; // ignore
        return questionRepository.findBlocksByExamTypeAndYearAndDepartment(examType, year, dept);
    }
}
