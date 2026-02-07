package site.silverbot.api.robot.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import site.silverbot.api.common.ApiResponse;
import site.silverbot.api.robot.request.CreateConversationRequest;
import site.silverbot.api.robot.request.CreateSearchResultRequest;
import site.silverbot.api.robot.response.ConversationListResponse;
import site.silverbot.api.robot.response.ConversationResponse;
import site.silverbot.api.robot.response.SearchResultListResponse;
import site.silverbot.api.robot.response.SearchResultResponse;
import site.silverbot.api.robot.service.RobotAiService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/robots/{robotId}")
public class RobotAiController {
    private final RobotAiService robotAiService;

    @GetMapping("/conversations")
    public ApiResponse<ConversationListResponse> getConversations(
            @PathVariable Long robotId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(robotAiService.getConversations(robotId, page, size));
    }

    @PostMapping("/conversations")
    public ApiResponse<ConversationResponse> createConversation(
            @PathVariable Long robotId,
            @Valid @RequestBody CreateConversationRequest request
    ) {
        return ApiResponse.success(robotAiService.createConversation(robotId, request));
    }

    @GetMapping("/search-results")
    public ApiResponse<SearchResultListResponse> getSearchResults(
            @PathVariable Long robotId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(robotAiService.getSearchResults(robotId, page, size));
    }

    @PostMapping("/search-results")
    public ApiResponse<SearchResultResponse> createSearchResult(
            @PathVariable Long robotId,
            @Valid @RequestBody CreateSearchResultRequest request
    ) {
        return ApiResponse.success(robotAiService.createSearchResult(robotId, request));
    }
}
