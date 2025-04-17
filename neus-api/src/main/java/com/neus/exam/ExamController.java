package com.neus.exam;


import com.neus.common.PageResponse;
import com.neus.exam.dto.CreateExamDto;
import com.neus.exam.dto.ExamDetailDto;
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

    // create exam
    @PostMapping
    public ResponseEntity<?> createExam(
            @RequestBody @Valid CreateExamDto dto
    ){
        examService.createExam(dto);
        return ResponseEntity.accepted().build();
    }

    // get page of exams
    @GetMapping
    public ResponseEntity<PageResponse<ExamDto>> getPageOfExams(
            @RequestParam(value = "page",defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "10", required = false) int size
    ){
        return ResponseEntity.ok(examService.getPageOfExams(page,size));
    }

    // get exam by id
    @GetMapping("/{exam-id}")
    public ResponseEntity<ExamDto> getExamById(
        @PathVariable("exam-id") String examId
    ){
        return ResponseEntity.ok(examService.getExamById(examId));
    }
    // get exam detail
    @GetMapping("/detail/{exam-id}")
    public ResponseEntity<ExamDetailDto> getExamDetail(
            @PathVariable("exam-id") String examId, Authentication authentication
    ){
        var res = examService.getExamDetail(examId, authentication);
        return ResponseEntity.ok(res);
    }

    // update exam
    @PutMapping
    public ResponseEntity<?> updateExam(
            @RequestBody @Valid CreateExamDto dto
    ){
        examService.updateExam(dto);
        return ResponseEntity.accepted().build();
    }


    // delete exam
    @DeleteMapping("/{exam-id}")
    public ResponseEntity<?> deleteExam(
            @PathVariable("exam-id") String examId
    ){
        examService.deleteExam(examId);
        return ResponseEntity.accepted().build();
    }
}
