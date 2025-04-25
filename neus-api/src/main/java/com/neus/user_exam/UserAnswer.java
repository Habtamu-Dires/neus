package com.neus.user_exam;

import lombok.Builder;

@Builder
public record UserAnswer(
        String questionId,
        String choiceId
) {}
