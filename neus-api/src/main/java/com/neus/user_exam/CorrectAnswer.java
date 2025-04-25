package com.neus.user_exam;

public record CorrectAnswer(
        String questionId,
        Boolean isCorrect
) {
}
