package site.silverbot.api.robot.response;

import java.time.LocalDateTime;
import java.util.List;

import site.silverbot.domain.conversation.ConversationCommandType;
import site.silverbot.domain.conversation.ConversationIntent;
import site.silverbot.domain.conversation.ConversationSentiment;

public record ConversationResponse(
        Long id,
        Long robotId,
        Long elderId,
        String voiceOriginal,
        String normalizedText,
        ConversationIntent intent,
        ConversationCommandType commandType,
        Float confidence,
        Integer durationSeconds,
        ConversationSentiment sentiment,
        List<String> keywords,
        LocalDateTime recordedAt,
        LocalDateTime createdAt
) {
}
