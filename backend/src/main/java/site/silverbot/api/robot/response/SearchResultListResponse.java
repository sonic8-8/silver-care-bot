package site.silverbot.api.robot.response;

import java.util.List;

public record SearchResultListResponse(
        List<SearchResultResponse> results,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext
) {
}
