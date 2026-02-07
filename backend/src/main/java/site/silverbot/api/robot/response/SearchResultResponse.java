package site.silverbot.api.robot.response;

import java.time.LocalDateTime;

import site.silverbot.domain.search.SearchType;

public record SearchResultResponse(
        Long id,
        Long robotId,
        Long elderId,
        Long conversationId,
        SearchType searchType,
        String query,
        String content,
        LocalDateTime searchedAt,
        LocalDateTime createdAt
) {
}
