package site.silverbot.api.robot.response;

import java.util.List;

public record ConversationListResponse(
        List<ConversationResponse> conversations,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext
) {
}
