package com.neus.question;

import com.neus.common.TextDto;
import com.neus.exam.Exam;
import com.neus.exam.ExamService;
import com.neus.exceptions.ResourceNotFoundException;
import com.neus.file.FileStorageService;
import com.neus.question.dto.CreateQuestionDto;
import com.neus.question.dto.QuestionDto;
import com.neus.question.dto.QuestionDtoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    private final ExamService examService;
    private final FileStorageService fileStorageService;
    private final QuestionDtoMapper questionDtoMapper;

    @PreAuthorize("hasRole('ADMIN')")
    public void createQuestion(CreateQuestionDto dto){
        Exam exam = examService.findByExternalId(dto.examId());

        questionRepository.save(
              Question.builder()
                      .externalId(UUID.randomUUID())
                      .exam(exam)
                      .questionNumber(dto.questionNumber())
                      .questionText(dto.questionText())
                      .choice(addChoiceId(dto.choices()))
                      .explanation(dto.explanation())
                      .imageUrls(dto.imgUrls())
                      .build()
            );
    }

    // add choice id
    private List<Choice> addChoiceId(List<Choice> choiceList){
        return choiceList.stream()
                .map(c ->
                    Choice.builder()
                        .id(UUID.randomUUID())
                        .text(c.text())
                        .isCorrect(c.isCorrect())
                        .build()
                ).toList();
    }

    // get questions by exam id
    @PreAuthorize("hasRole('ADMIN')")
    public List<QuestionDto> getQuestionByExamId(String examId) {
        Exam exam = examService.findByExternalId(examId);
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

    // update question
    @PreAuthorize("hasRole('ADMIN')")
    public void updateQuestion(@Valid CreateQuestionDto dto) {
        Question question = this.findByExternalId(dto.id());

        question.setQuestionNumber(dto.questionNumber());
        question.setQuestionText(dto.questionText());
        question.setChoice(dto.choices());
        question.setExplanation(dto.explanation());
        question.setImageUrls(dto.imgUrls());

        questionRepository.save(question);
    }

    // delete question
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteQuestion(String questionId) {
        Question question = this.findByExternalId(questionId);
        List<String> images = question.getImageUrls();
        questionRepository.delete(question);
        // delete images
        if(images != null){
            for(String url: images){
                fileStorageService.deleteFile(url);
            }
        }
    }

    // upload image
    @PreAuthorize("hasRole('ADMIN')")
    public TextDto uploadImage(MultipartFile file) {
        String url = fileStorageService.saveFile(file, "Image");
        return new TextDto(url);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteImage(String url) {
        fileStorageService.deleteFile(url);
    }
}
