package site.silverbot.api.robot.service;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import site.silverbot.api.common.service.CurrentUserService;
import site.silverbot.api.robot.request.CreateConversationRequest;
import site.silverbot.api.robot.request.CreateSearchResultRequest;
import site.silverbot.api.robot.response.ConversationListResponse;
import site.silverbot.api.robot.response.ConversationResponse;
import site.silverbot.api.robot.response.SearchResultListResponse;
import site.silverbot.api.robot.response.SearchResultResponse;
import site.silverbot.domain.conversation.Conversation;
import site.silverbot.domain.conversation.ConversationRepository;
import site.silverbot.domain.conversation.ConversationSentiment;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.search.SearchResult;
import site.silverbot.domain.search.SearchResultRepository;
import site.silverbot.domain.user.User;

@Service
@RequiredArgsConstructor
@Transactional
public class RobotAiService {
    private static final int MAX_PAGE_SIZE = 100;

    private final RobotRepository robotRepository;
    private final ConversationRepository conversationRepository;
    private final SearchResultRepository searchResultRepository;
    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper;

    public ConversationResponse createConversation(Long robotId, CreateConversationRequest request) {
        Robot robot = getAccessibleRobot(robotId, true);
        Elder elder = requireRobotElder(robot);
        CreateConversationRequest.ParsedData parsed = request.parsedData();

        Conversation conversation = conversationRepository.save(Conversation.builder()
                .robot(robot)
                .elder(elder)
                .voiceOriginal(request.voiceOriginal())
                .normalizedText(parsed.normalizedText())
                .intent(parsed.intent())
                .commandType(parsed.commandType())
                .confidence(parsed.confidence())
                .durationSeconds(parsed.duration())
                .sentiment(parsed.sentiment() == null ? ConversationSentiment.NEUTRAL : parsed.sentiment())
                .keywords(toJson(parsed.keywords()))
                .recordedAt(request.recordedAt() == null ? LocalDateTime.now() : request.recordedAt())
                .build());

        return toConversationResponse(conversation);
    }

    @Transactional(readOnly = true)
    public ConversationListResponse getConversations(Long robotId, int page, int size) {
        validatePage(page, size);
        getAccessibleRobot(robotId, true);

        Page<Conversation> conversationPage = conversationRepository.findByRobotIdOrderByRecordedAtDescIdDesc(
                robotId,
                PageRequest.of(page, size)
        );

        return new ConversationListResponse(
                conversationPage.getContent().stream().map(this::toConversationResponse).toList(),
                conversationPage.getNumber(),
                conversationPage.getSize(),
                conversationPage.getTotalElements(),
                conversationPage.getTotalPages(),
                conversationPage.hasNext()
        );
    }

    public SearchResultResponse createSearchResult(Long robotId, CreateSearchResultRequest request) {
        Robot robot = getAccessibleRobot(robotId, true);
        Elder elder = requireRobotElder(robot);

        CreateSearchResultRequest.ParsedData parsed = request.parsedData();
        Conversation conversation = conversationRepository.save(Conversation.builder()
                .robot(robot)
                .elder(elder)
                .voiceOriginal(request.voiceOriginal())
                .normalizedText(parsed.normalizedText())
                .intent(parsed.intent())
                .commandType(parsed.commandType())
                .confidence(parsed.confidence())
                .durationSeconds(parsed.duration())
                .sentiment(parsed.sentiment() == null ? ConversationSentiment.NEUTRAL : parsed.sentiment())
                .keywords(toJson(parsed.keywords()))
                .recordedAt(request.recordedAt() == null ? LocalDateTime.now() : request.recordedAt())
                .build());

        CreateSearchResultRequest.SearchedData searchedData = request.searchedData();
        String query = StringUtils.hasText(searchedData.query()) ? searchedData.query() : parsed.normalizedText();
        LocalDateTime searchedAt = searchedData.searchedAt() == null ? LocalDateTime.now() : searchedData.searchedAt();

        SearchResult saved = searchResultRepository.save(SearchResult.builder()
                .robot(robot)
                .elder(elder)
                .conversation(conversation)
                .searchType(searchedData.type())
                .query(query)
                .content(searchedData.content())
                .searchedAt(searchedAt)
                .build());

        return toSearchResultResponse(saved);
    }

    @Transactional(readOnly = true)
    public SearchResultListResponse getSearchResults(Long robotId, int page, int size) {
        validatePage(page, size);
        getAccessibleRobot(robotId, true);

        Page<SearchResult> searchResultPage = searchResultRepository.findByRobotIdOrderBySearchedAtDescIdDesc(
                robotId,
                PageRequest.of(page, size)
        );

        return new SearchResultListResponse(
                searchResultPage.getContent().stream().map(this::toSearchResultResponse).toList(),
                searchResultPage.getNumber(),
                searchResultPage.getSize(),
                searchResultPage.getTotalElements(),
                searchResultPage.getTotalPages(),
                searchResultPage.hasNext()
        );
    }

    private Robot getAccessibleRobot(Long robotId, boolean allowRobotPrincipal) {
        Robot robot = robotRepository.findById(robotId)
                .orElseThrow(() -> new EntityNotFoundException("Robot not found"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new AuthenticationCredentialsNotFoundException("User not authenticated");
        }

        if (hasRole(authentication, "ROLE_ROBOT")) {
            if (!allowRobotPrincipal) {
                throw new AccessDeniedException("Robot principal is not allowed");
            }
            Long principalRobotId = parseLong(authentication.getName());
            if (principalRobotId == null || !robotId.equals(principalRobotId)) {
                throw new AccessDeniedException("Robot access denied");
            }
            return robot;
        }

        User user = currentUserService.getCurrentUser();
        Elder elder = requireRobotElder(robot);
        if (elder.getUser() == null || !elder.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Robot access denied");
        }
        return robot;
    }

    private Elder requireRobotElder(Robot robot) {
        Elder elder = robot.getElder();
        if (elder == null) {
            throw new EntityNotFoundException("Robot is not assigned to elder");
        }
        return elder;
    }

    private ConversationResponse toConversationResponse(Conversation conversation) {
        return new ConversationResponse(
                conversation.getId(),
                conversation.getRobot().getId(),
                conversation.getElder().getId(),
                conversation.getVoiceOriginal(),
                conversation.getNormalizedText(),
                conversation.getIntent(),
                conversation.getCommandType(),
                conversation.getConfidence(),
                conversation.getDurationSeconds(),
                conversation.getSentiment(),
                fromJson(conversation.getKeywords()),
                conversation.getRecordedAt(),
                conversation.getCreatedAt()
        );
    }

    private SearchResultResponse toSearchResultResponse(SearchResult searchResult) {
        return new SearchResultResponse(
                searchResult.getId(),
                searchResult.getRobot().getId(),
                searchResult.getElder().getId(),
                searchResult.getConversation() == null ? null : searchResult.getConversation().getId(),
                searchResult.getSearchType(),
                searchResult.getQuery(),
                searchResult.getContent(),
                searchResult.getSearchedAt(),
                searchResult.getCreatedAt()
        );
    }

    private String toJson(List<String> values) {
        if (values == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(values);
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException("Unable to serialize keywords", ex);
        }
    }

    private List<String> fromJson(String rawJson) {
        if (!StringUtils.hasText(rawJson)) {
            return List.of();
        }
        try {
            return objectMapper.readValue(rawJson, new TypeReference<List<String>>() {
            });
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Unable to parse keywords", ex);
        }
    }

    private void validatePage(int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("page must be greater than or equal to 0");
        }
        if (size <= 0 || size > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException("size must be between 1 and 100");
        }
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> role.equals(authority.getAuthority()));
    }

    private Long parseLong(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
