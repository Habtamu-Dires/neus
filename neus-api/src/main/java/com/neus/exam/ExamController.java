package com.neus.exam;


import com.neus.exam.dto.CreateExamDto;
import com.neus.exam.dto.ExamDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/exams")
@RequiredArgsConstructor
@Tag(name = "exams")
public class ExamController {

    private final ExamService examService;

    // get exam detail
    @GetMapping("/{exam-id}")
    public ResponseEntity<ExamDto> getExamDetail(
            @PathVariable("exam-id") String examId, Authentication authentication
    ){
        var res = examService.getExamDetail(examId, authentication);
        return ResponseEntity.ok(res);
    }

    // create exam
    @PostMapping
    public ResponseEntity<?> createExam(
            @RequestBody @Valid CreateExamDto dto
    ){
        examService.createExam(dto);
        return ResponseEntity.accepted().build();
    }
}
