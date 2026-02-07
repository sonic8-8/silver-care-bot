package site.silverbot.api.robot.request;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import site.silverbot.domain.conversation.ConversationCommandType;
import site.silverbot.domain.conversation.ConversationIntent;
import site.silverbot.domain.conversation.ConversationSentiment;

public record CreateConversationRequest(
        @NotBlank
        String voiceOriginal,

        @NotNull
        @Valid
        ParsedData parsedData,

        LocalDateTime recordedAt
) {
    public record ParsedData(
            @NotBlank
            String normalizedText,

            @NotNull
            ConversationIntent intent,

            ConversationCommandType commandType,

            @DecimalMin("0.0")
            @DecimalMax("1.0")
            Float confidence,

            @Min(0)
            Integer duration,

            ConversationSentiment sentiment,

            List<@NotBlank String> keywords
    ) {
    }
}
