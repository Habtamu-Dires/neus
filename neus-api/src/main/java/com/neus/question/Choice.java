package com.neus.question;


import lombok.Builder;

import java.util.UUID;

@Builder
public record Choice(
         UUID id,
         String text,
         boolean isCorrect
) { }
