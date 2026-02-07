package site.silverbot.api.robot.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import site.silverbot.api.robot.request.CreateConversationRequest;
import site.silverbot.api.robot.request.CreateSearchResultRequest;
import site.silverbot.api.robot.response.ConversationListResponse;
import site.silverbot.api.robot.response.ConversationResponse;
import site.silverbot.api.robot.response.SearchResultResponse;
import site.silverbot.domain.conversation.Conversation;
import site.silverbot.domain.conversation.ConversationIntent;
import site.silverbot.domain.conversation.ConversationRepository;
import site.silverbot.domain.conversation.ConversationSentiment;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.search.SearchResultRepository;
import site.silverbot.domain.search.SearchType;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RobotAiServiceTest {

    @Autowired
    private RobotAiService robotAiService;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private SearchResultRepository searchResultRepository;

    @Autowired
    private RobotRepository robotRepository;

    @Autowired
    private ElderRepository elderRepository;

    @Autowired
    private UserRepository userRepository;

    private Robot robot;

    @BeforeEach
    void setUp() {
        searchResultRepository.deleteAllInBatch();
        conversationRepository.deleteAllInBatch();
        robotRepository.deleteAllInBatch();
        elderRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        User user = userRepository.save(User.builder()
                .name("김복지")
                .email("worker@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build());

        Elder elder = elderRepository.save(Elder.builder()
                .user(user)
                .name("김옥분")
                .birthDate(LocalDate.of(1946, 5, 15))
                .gender(Gender.FEMALE)
                .status(ElderStatus.SAFE)
                .build());

        robot = robotRepository.save(Robot.builder()
                .elder(elder)
                .serialNumber("ROBOT-AI-01")
                .authCode("123456")
                .build());
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void createConversation_savesKeywordsAndReturnsResponse() {
        CreateConversationRequest request = new CreateConversationRequest(
                "오느을 날씨이 좋네요오",
                new CreateConversationRequest.ParsedData(
                        "오늘 날씨 좋네요",
                        ConversationIntent.CHAT,
                        null,
                        0.88f,
                        12,
                        ConversationSentiment.NEUTRAL,
                        List.of("날씨", "좋다")
                ),
                LocalDateTime.of(2026, 2, 7, 10, 30)
        );

        ConversationResponse response = robotAiService.createConversation(robot.getId(), request);

        assertThat(response.id()).isNotNull();
        assertThat(response.normalizedText()).isEqualTo("오늘 날씨 좋네요");
        assertThat(response.keywords()).containsExactly("날씨", "좋다");
        assertThat(conversationRepository.count()).isEqualTo(1);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void createSearchResult_createsConversationAndSearchResult() {
        CreateSearchResultRequest request = new CreateSearchResultRequest(
                "오느을 날씨가아 어때애?",
                new CreateSearchResultRequest.ParsedData(
                        "오늘 날씨가 어때?",
                        ConversationIntent.COMMAND,
                        site.silverbot.domain.conversation.ConversationCommandType.SEARCH,
                        0.93f,
                        8,
                        ConversationSentiment.NEUTRAL,
                        List.of("날씨")
                ),
                LocalDateTime.of(2026, 2, 7, 10, 31),
                new CreateSearchResultRequest.SearchedData(
                        SearchType.WEATHER,
                        null,
                        "오늘 서울 날씨는 맑음입니다.",
                        LocalDateTime.of(2026, 2, 7, 10, 31, 5)
                )
        );

        SearchResultResponse response = robotAiService.createSearchResult(robot.getId(), request);

        assertThat(response.id()).isNotNull();
        assertThat(response.conversationId()).isNotNull();
        assertThat(response.searchType()).isEqualTo(SearchType.WEATHER);
        assertThat(conversationRepository.count()).isEqualTo(1);
        assertThat(searchResultRepository.count()).isEqualTo(1);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getConversations_otherUsersRobot_throwsAccessDenied() {
        User another = userRepository.save(User.builder()
                .name("다른 사용자")
                .email("other@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build());
        Elder anotherElder = elderRepository.save(Elder.builder()
                .user(another)
                .name("타인 어르신")
                .birthDate(LocalDate.of(1940, 1, 1))
                .gender(Gender.FEMALE)
                .status(ElderStatus.SAFE)
                .build());
        Robot anotherRobot = robotRepository.save(Robot.builder()
                .elder(anotherElder)
                .serialNumber("ROBOT-AI-02")
                .authCode("654321")
                .build());

        conversationRepository.save(Conversation.builder()
                .robot(anotherRobot)
                .elder(anotherElder)
                .voiceOriginal("원본")
                .normalizedText("정규화")
                .intent(ConversationIntent.CHAT)
                .recordedAt(LocalDateTime.of(2026, 2, 7, 11, 0))
                .build());

        assertThrows(AccessDeniedException.class,
                () -> robotAiService.getConversations(anotherRobot.getId(), 0, 20));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getConversations_returnsPagedList() {
        conversationRepository.save(Conversation.builder()
                .robot(robot)
                .elder(robot.getElder())
                .voiceOriginal("원본")
                .normalizedText("정규화")
                .intent(ConversationIntent.CHAT)
                .recordedAt(LocalDateTime.of(2026, 2, 7, 11, 0))
                .build());

        ConversationListResponse response = robotAiService.getConversations(robot.getId(), 0, 20);

        assertThat(response.conversations()).hasSize(1);
        assertThat(response.totalElements()).isEqualTo(1);
    }
}
