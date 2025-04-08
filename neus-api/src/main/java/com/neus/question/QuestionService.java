package com.neus.question;

import com.neus.exam.Exam;
import com.neus.exam.ExamService;
import com.neus.question.dto.CreateQuestionDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ExamService examService;

    @PreAuthorize("hasRole('ADMIN')")
    public void createQuestion(CreateQuestionDto dto){
        Exam exam = examService.findByExternalId(dto.examId());

        questionRepository.save(
              Question.builder()
                      .exam(exam)
                      .questionText(dto.questionText())
                      .choice(dto.choices())
                      .explanation(dto.explanation())
                      .imageUrls(dto.imgUrls())
                      .build()
            );
    }
}
