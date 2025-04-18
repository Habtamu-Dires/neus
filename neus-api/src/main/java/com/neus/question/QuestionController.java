package com.neus.question;

import com.neus.common.TextDto;
import com.neus.question.dto.CreateQuestionDto;
import com.neus.question.dto.QuestionDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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

    // get question by exam id
    @GetMapping("/{exam-id}")
    public ResponseEntity<List<QuestionDto>> getQuestionsByExamId(
            @PathVariable("exam-id") String examId
    ){

        var res = questionService.getQuestionByExamId(examId);
        return ResponseEntity.ok(res);
    }

    // update question
    @PutMapping
    public ResponseEntity<?> updateQuestion(
        @RequestBody @Valid CreateQuestionDto dto
    ){
        questionService.updateQuestion(dto);
        return ResponseEntity.accepted().build();
    }

    //delete question
    @DeleteMapping("/{question-id}")
    public void deleteQuestion(
            @PathVariable("question-id") String questionId
    ){
        questionService.deleteQuestion(questionId);
    }

    //upload images
    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TextDto> uploadImage(@RequestPart MultipartFile file){
        return ResponseEntity.ok(questionService.uploadImage(file));
    }

    // remove image
    @DeleteMapping("/image")
    public ResponseEntity<?> deleteImage(@RequestParam("url") String url){
        questionService.deleteImage(url);
        return ResponseEntity.accepted().build();
    }


}
