package site.silverbot.api.robot.controller;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import org.springframework.security.test.context.support.WithMockUser;

import site.silverbot.api.robot.request.CreateConversationRequest;
import site.silverbot.api.robot.request.CreateSearchResultRequest;
import site.silverbot.domain.conversation.Conversation;
import site.silverbot.domain.conversation.ConversationIntent;
import site.silverbot.domain.conversation.ConversationRepository;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.search.SearchType;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;
import site.silverbot.support.RestDocsSupport;

class RobotAiControllerTest extends RestDocsSupport {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private RobotRepository robotRepository;

    @Autowired
    private ElderRepository elderRepository;

    @Autowired
    private UserRepository userRepository;

    private Robot robot;

    @BeforeEach
    void setUp() {
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
                .serialNumber("ROBOT-AI-CTRL-01")
                .authCode("123456")
                .build());
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void createConversation_createsRecord() throws Exception {
        CreateConversationRequest request = new CreateConversationRequest(
                "오느을 날씨이 좋네요오",
                new CreateConversationRequest.ParsedData(
                        "오늘 날씨 좋네요",
                        ConversationIntent.CHAT,
                        null,
                        0.88f,
                        12,
                        site.silverbot.domain.conversation.ConversationSentiment.NEUTRAL,
                        List.of("날씨", "좋다")
                ),
                LocalDateTime.of(2026, 2, 7, 10, 30)
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/conversations", robot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.normalizedText").value("오늘 날씨 좋네요"))
                .andDo(document("robot-conversation-create"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getConversations_returnsList() throws Exception {
        conversationRepository.save(Conversation.builder()
                .robot(robot)
                .elder(robot.getElder())
                .voiceOriginal("원본 텍스트")
                .normalizedText("정규화 텍스트")
                .intent(ConversationIntent.CHAT)
                .recordedAt(LocalDateTime.of(2026, 2, 7, 10, 30))
                .build());

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/robots/{robotId}/conversations", robot.getId())
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.conversations.length()").value(1))
                .andDo(document("robot-conversation-list"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void createSearchResult_createsRecord() throws Exception {
        CreateSearchResultRequest request = new CreateSearchResultRequest(
                "오느을 날씨가아 어때애?",
                new CreateSearchResultRequest.ParsedData(
                        "오늘 날씨가 어때?",
                        ConversationIntent.COMMAND,
                        site.silverbot.domain.conversation.ConversationCommandType.SEARCH,
                        0.93f,
                        8,
                        site.silverbot.domain.conversation.ConversationSentiment.NEUTRAL,
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

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/search-results", robot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.searchType").value("WEATHER"))
                .andDo(document("robot-search-result-create"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getSearchResults_returnsList() throws Exception {
        CreateSearchResultRequest request = new CreateSearchResultRequest(
                "뉴스를 알려줘",
                new CreateSearchResultRequest.ParsedData(
                        "뉴스를 알려줘",
                        ConversationIntent.COMMAND,
                        site.silverbot.domain.conversation.ConversationCommandType.SEARCH,
                        0.90f,
                        6,
                        site.silverbot.domain.conversation.ConversationSentiment.NEUTRAL,
                        List.of("뉴스")
                ),
                LocalDateTime.of(2026, 2, 7, 12, 0),
                new CreateSearchResultRequest.SearchedData(
                        SearchType.WEB_SEARCH,
                        "오늘 주요 뉴스",
                        "주요 뉴스 요약",
                        LocalDateTime.of(2026, 2, 7, 12, 0, 5)
                )
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/search-results", robot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/robots/{robotId}/search-results", robot.getId())
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.results.length()").value(1))
                .andDo(document("robot-search-result-list"));
    }
}
