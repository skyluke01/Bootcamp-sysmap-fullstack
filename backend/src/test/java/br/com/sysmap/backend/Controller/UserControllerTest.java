package br.com.sysmap.backend.Controller;

import br.com.sysmap.backend.dto.*;
import br.com.sysmap.backend.exception.BusinessException;
import br.com.sysmap.backend.exception.GlobalExceptionHandler;
import br.com.sysmap.backend.model.User;
import br.com.sysmap.backend.model.enums.AchievementType;
import br.com.sysmap.backend.model.enums.InterestType;
import br.com.sysmap.backend.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.web.multipart.MultipartFile;
import static org.mockito.Mockito.doReturn;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private UserService userService;

    private TestingAuthenticationToken authentication;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new UserController(userService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        authentication = new TestingAuthenticationToken("lucas@email.com", null);
    }

    @Test
    void deveBuscarUsuarioLogadoComSucesso() throws Exception {
        User user = activeUser();

        when(userService.getLoggedUser("lucas@email.com")).thenReturn(user);

        mockMvc.perform(get("/user").principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Lucas"))
                .andExpect(jsonPath("$.email").value("lucas@email.com"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void deveAtualizarUsuarioComSucesso() throws Exception {
        User user = activeUser();
        user.setName("Lucas Mendes");
        user.setEmail("lucasnovo@email.com");

        UpdateUserRequest request = new UpdateUserRequest(
                "Lucas Mendes",
                "lucasnovo@email.com",
                "123456"
        );

        when(userService.updateLoggedUser(eq("lucas@email.com"), any(UpdateUserRequest.class)))
                .thenReturn(user);

        mockMvc.perform(put("/user/update")
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Lucas Mendes"))
                .andExpect(jsonPath("$.email").value("lucasnovo@email.com"));
    }

    @Test
    void deveAtualizarAvatarComSucesso() throws Exception {
        User user = activeUser();
        user.setProfileImageUrl("http://localhost:4566/profile-images/profiles/foto.png");

        MockMultipartFile file = new MockMultipartFile(
                "avatar",
                "foto.png",
                "image/png",
                "conteudo".getBytes()
        );

        doReturn(user)
                .when(userService)
                .updateProfileImage(anyString(), any(MultipartFile.class));

        mockMvc.perform(MockMvcRequestBuilders.multipart("/user/avatar")
                        .file(file)
                        .principal(authentication)
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("http://localhost:4566/profile-images/profiles/foto.png"));

    }

    @Test
    void deveDesativarContaComSucesso() throws Exception {
        doNothing().when(userService).deactivateLoggedUser("lucas@email.com");

        mockMvc.perform(delete("/user/deactivate").principal(authentication))
                .andExpect(status().isOk())
                .andExpect(content().string("Conta desativada com sucesso"));

        verify(userService).deactivateLoggedUser("lucas@email.com");
    }

    @Test
    void deveBuscarPreferenciasComSucesso() throws Exception {
        User user = activeUser();
        user.setInterests(Set.of(InterestType.SPORT, InterestType.TECHNOLOGY));

        when(userService.getLoggedUser("lucas@email.com")).thenReturn(user);

        mockMvc.perform(get("/user/preferences").principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").exists());
    }

    @Test
    void deveDefinirPreferenciasComSucesso() throws Exception {
        UpdateInterestsRequest request = new UpdateInterestsRequest(
                Set.of(InterestType.SPORT)
        );

        when(userService.updateInterests(eq("lucas@email.com"), any(UpdateInterestsRequest.class)))
                .thenReturn(activeUser());

        mockMvc.perform(post("/user/preferences/define")
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Preferências atualizadas com sucesso"));
    }

    @Test
    void deveRetornarErroQuandoPreferenciasInvalidas() throws Exception {
        UpdateInterestsRequest request = new UpdateInterestsRequest(Set.of());

        when(userService.updateInterests(eq("lucas@email.com"), any(UpdateInterestsRequest.class)))
                .thenThrow(new BusinessException("Um ou mais IDs informados são inválidos."));

        mockMvc.perform(post("/user/preferences/define")
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Um ou mais IDs informados são inválidos."));
    }

    @Test
    void deveBuscarConquistasComSucesso() throws Exception {
        AchievementResponse achievement = new AchievementResponse(
                AchievementType.FIRST_ACTIVITY_CREATED,
                LocalDateTime.now()
        );

        when(userService.getMyAchievements("lucas@email.com"))
                .thenReturn(List.of(achievement));

        mockMvc.perform(get("/user/achievements").principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("FIRST_ACTIVITY_CREATED"));
    }

    private User activeUser() {
        return User.builder()
                .id(UUID.randomUUID())
                .name("Lucas")
                .email("lucas@email.com")
                .cpf("12345678900")
                .password("senha")
                .active(true)
                .profileImageUrl("default.png")
                .xp(0)
                .level(1)
                .interests(Set.of(InterestType.SPORT))
                .build();
    }
}
