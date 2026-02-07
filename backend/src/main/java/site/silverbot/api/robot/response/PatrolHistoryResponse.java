package site.silverbot.api.robot.response;

import java.util.List;

public record PatrolHistoryResponse(
        List<PatrolHistoryEntryResponse> patrols,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext
) {
}
