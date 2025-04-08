package com.neus.question;

import com.neus.question.dto.CreateQuestionDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/questions")
@RequiredArgsConstructor
@Tag(name = "questions")
public class QuestionController {

    private final QuestionService questionService;

    //create questions
    @PostMapping
    public ResponseEntity<?> createQuestions(
            @RequestBody @Valid CreateQuestionDto dto
    ) {
        questionService.createQuestion(dto);
        return ResponseEntity.accepted().build();
    }
}
