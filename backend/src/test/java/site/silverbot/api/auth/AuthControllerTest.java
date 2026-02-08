package site.silverbot.api.auth;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.headers.HeaderDocumentation.headerWithName;
import static org.springframework.restdocs.headers.HeaderDocumentation.responseHeaders;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.payload.PayloadDocumentation.requestFields;
import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import org.springframework.restdocs.payload.JsonFieldType;
import site.silverbot.api.auth.request.LoginRequest;
import site.silverbot.api.auth.request.RobotLoginRequest;
import site.silverbot.api.auth.request.SignupRequest;
import site.silverbot.api.auth.response.AuthRobotResponse;
import site.silverbot.api.auth.response.AuthUserResponse;
import site.silverbot.api.auth.response.TokenResponse;
import site.silverbot.api.auth.service.AuthService;
import site.silverbot.api.auth.service.RobotAuthService;
import site.silverbot.domain.user.UserRole;
import site.silverbot.support.RestDocsSupport;

class AuthControllerTest extends RestDocsSupport {

    @MockBean
    private AuthService authService;

    @MockBean
    private RobotAuthService robotAuthService;

    @Test
    void signup() throws Exception {
        SignupRequest request = new SignupRequest(
                "홍길동",
                "test@test.com",
                "password123",
                "01012345678",
                UserRole.WORKER
        );

        TokenResponse response = TokenResponse.withUser(
                "access-token",
                "refresh-token",
                3600000L,
                new AuthUserResponse(1L, "홍길동", "test@test.com", UserRole.WORKER, "01012345678")
        );
        given(authService.signup(any(SignupRequest.class))).willReturn(response);

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andDo(document("auth-signup",
                        responseHeaders(
                                headerWithName(HttpHeaders.SET_COOKIE)
                                        .description("refresh 토큰 (HttpOnly 쿠키)")
                        ),
                        requestFields(
                                fieldWithPath("name").type(JsonFieldType.STRING).description("사용자 이름"),
                                fieldWithPath("email").type(JsonFieldType.STRING).description("이메일"),
                                fieldWithPath("password").type(JsonFieldType.STRING).description("비밀번호"),
                                fieldWithPath("phone").type(JsonFieldType.STRING).optional().description("전화번호"),
                                fieldWithPath("role").type(JsonFieldType.STRING).description("역할")
                        ),
                        responseFields(
                                fieldWithPath("success").type(JsonFieldType.BOOLEAN).description("성공 여부"),
                                fieldWithPath("data.accessToken").type(JsonFieldType.STRING).description("액세스 토큰"),
                                fieldWithPath("data.refreshToken").type(JsonFieldType.STRING).description("리프레시 토큰"),
                                fieldWithPath("data.expiresIn").type(JsonFieldType.NUMBER).description("액세스 토큰 만료(ms)"),
                                fieldWithPath("data.user").type(JsonFieldType.OBJECT).description("로그인 사용자"),
                                fieldWithPath("data.user.id").type(JsonFieldType.NUMBER).description("사용자 ID"),
                                fieldWithPath("data.user.name").type(JsonFieldType.STRING).description("사용자 이름"),
                                fieldWithPath("data.user.email").type(JsonFieldType.STRING).description("이메일"),
                                fieldWithPath("data.user.role").type(JsonFieldType.STRING).description("역할"),
                                fieldWithPath("data.user.phone").type(JsonFieldType.STRING).description("전화번호").optional(),
                                fieldWithPath("timestamp").type(JsonFieldType.STRING).description("응답 시간")
                        )
                ));
    }

    @Test
    void login() throws Exception {
        LoginRequest request = new LoginRequest("test@test.com", "password123");
        TokenResponse response = TokenResponse.withUser(
                "access-token",
                "refresh-token",
                3600000L,
                new AuthUserResponse(1L, "홍길동", "test@test.com", UserRole.WORKER, "01012345678")
        );
        given(authService.login(any(LoginRequest.class))).willReturn(response);

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andDo(document("auth-login",
                        responseHeaders(
                                headerWithName(HttpHeaders.SET_COOKIE)
                                        .description("refresh 토큰 (HttpOnly 쿠키)")
                        ),
                        requestFields(
                                fieldWithPath("email").type(JsonFieldType.STRING).description("이메일"),
                                fieldWithPath("password").type(JsonFieldType.STRING).description("비밀번호")
                        ),
                        responseFields(
                                fieldWithPath("success").type(JsonFieldType.BOOLEAN).description("성공 여부"),
                                fieldWithPath("data.accessToken").type(JsonFieldType.STRING).description("액세스 토큰"),
                                fieldWithPath("data.refreshToken").type(JsonFieldType.STRING).description("리프레시 토큰"),
                                fieldWithPath("data.expiresIn").type(JsonFieldType.NUMBER).description("액세스 토큰 만료(ms)"),
                                fieldWithPath("data.user").type(JsonFieldType.OBJECT).description("로그인 사용자"),
                                fieldWithPath("data.user.id").type(JsonFieldType.NUMBER).description("사용자 ID"),
                                fieldWithPath("data.user.name").type(JsonFieldType.STRING).description("사용자 이름"),
                                fieldWithPath("data.user.email").type(JsonFieldType.STRING).description("이메일"),
                                fieldWithPath("data.user.role").type(JsonFieldType.STRING).description("역할"),
                                fieldWithPath("data.user.phone").type(JsonFieldType.STRING).description("전화번호").optional(),
                                fieldWithPath("timestamp").type(JsonFieldType.STRING).description("응답 시간")
                        )
                ));
    }

    @Test
    void refresh() throws Exception {
        TokenResponse response = TokenResponse.tokens("new-access", "new-refresh", 3600000L);
        given(authService.refresh(any(), any())).willReturn(response);

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "refreshToken": "refresh-token"
                                }
                                """))
                .andExpect(status().isOk())
                .andDo(document("auth-refresh",
                        responseHeaders(
                                headerWithName(HttpHeaders.SET_COOKIE)
                                        .description("refresh 토큰 (HttpOnly 쿠키)")
                        ),
                        requestFields(
                                fieldWithPath("refreshToken").type(JsonFieldType.STRING).description("리프레시 토큰").optional()
                        ),
                        responseFields(
                                fieldWithPath("success").type(JsonFieldType.BOOLEAN).description("성공 여부"),
                                fieldWithPath("data.accessToken").type(JsonFieldType.STRING).description("액세스 토큰"),
                                fieldWithPath("data.refreshToken").type(JsonFieldType.STRING).description("리프레시 토큰"),
                                fieldWithPath("data.expiresIn").type(JsonFieldType.NUMBER).description("액세스 토큰 만료(ms)"),
                                fieldWithPath("data.user").type(JsonFieldType.OBJECT).description("사용자 정보").optional(),
                                fieldWithPath("data.robot").type(JsonFieldType.OBJECT).description("로봇 정보").optional(),
                                fieldWithPath("timestamp").type(JsonFieldType.STRING).description("응답 시간")
                        )
                ));
    }

    @Test
    void robotLogin() throws Exception {
        RobotLoginRequest request = new RobotLoginRequest("RB-001", "123456");
        TokenResponse response = TokenResponse.withRobot(
                "robot-access",
                new AuthRobotResponse(1L, "RB-001", 2L, "김옥분")
        );
        given(robotAuthService.robotLogin(any(RobotLoginRequest.class))).willReturn(response);

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/auth/robot/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andDo(document("auth-robot-login",
                        requestFields(
                                fieldWithPath("serialNumber").type(JsonFieldType.STRING).description("로봇 시리얼 번호"),
                                fieldWithPath("authCode").type(JsonFieldType.STRING).description("인증 코드")
                        ),
                        responseFields(
                                fieldWithPath("success").type(JsonFieldType.BOOLEAN).description("성공 여부"),
                                fieldWithPath("data.accessToken").type(JsonFieldType.STRING).description("액세스 토큰"),
                                fieldWithPath("data.refreshToken").type(JsonFieldType.STRING).description("리프레시 토큰").optional(),
                                fieldWithPath("data.expiresIn").type(JsonFieldType.NUMBER).description("액세스 토큰 만료(ms)").optional(),
                                fieldWithPath("data.user").type(JsonFieldType.OBJECT).description("사용자 정보").optional(),
                                fieldWithPath("data.robot").type(JsonFieldType.OBJECT).description("로봇 정보"),
                                fieldWithPath("data.robot.id").type(JsonFieldType.NUMBER).description("로봇 ID"),
                                fieldWithPath("data.robot.serialNumber").type(JsonFieldType.STRING).description("로봇 시리얼 번호"),
                                fieldWithPath("data.robot.elderId").type(JsonFieldType.NUMBER).description("연결된 어르신 ID").optional(),
                                fieldWithPath("data.robot.elderName").type(JsonFieldType.STRING).description("연결된 어르신 이름").optional(),
                                fieldWithPath("timestamp").type(JsonFieldType.STRING).description("응답 시간")
                        )
                ));
    }
}
