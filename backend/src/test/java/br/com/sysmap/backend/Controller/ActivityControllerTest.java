package br.com.sysmap.backend.Controller;

import br.com.sysmap.backend.dto.*;
import br.com.sysmap.backend.exception.BusinessException;
import br.com.sysmap.backend.exception.GlobalExceptionHandler;
import br.com.sysmap.backend.model.enums.*;
import br.com.sysmap.backend.service.ActivityService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class ActivityControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @Mock
    private ActivityService activityService;

    private TestingAuthenticationToken authentication;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new ActivityController(activityService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        authentication = new TestingAuthenticationToken("lucas@email.com", null);
    }

    @Test
    void deveCriarAtividadeComSucesso() throws Exception {
        CreateActivityRequest request = createRequest();

        when(activityService.create(any(CreateActivityRequest.class), eq("lucas@email.com")))
                .thenReturn(activityResponse());

        mockMvc.perform(post("/activities/new")
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Futebol"));
    }

    @Test
    void naoDeveCriarAtividadeComImagemInvalida() throws Exception {
        CreateActivityRequest request = new CreateActivityRequest(
                "Futebol",
                "Futebol no parque",
                ActivityType.SPORT,
                "arquivo.txt",
                LocalDateTime.now().plusDays(1),
                "Parque",
                ActivityVisibility.PRIVATE
        );

        when(activityService.create(any(CreateActivityRequest.class), eq("lucas@email.com")))
                .thenThrow(new BusinessException("E2: A imagem deve ser um arquivo PNG ou JPG."));

        mockMvc.perform(post("/activities/new")
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("A imagem deve ser um arquivo PNG ou JPG."));
    }

    @Test
    void deveListarTipos() throws Exception {
        mockMvc.perform(get("/activities/types").principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").exists());
    }

    @Test
    void deveListarAtividades() throws Exception {
        when(activityService.findAll(isNull(), eq("lucas@email.com")))
                .thenReturn(List.of(activityResponse()));

        mockMvc.perform(get("/activities").principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Futebol"));
    }

    @Test
    void deveListarTodasAtividades() throws Exception {
        when(activityService.findAllActivities("lucas@email.com"))
                .thenReturn(List.of(activityResponse()));

        mockMvc.perform(get("/activities/all").principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Futebol"));
    }

    @Test
    void deveInscreverUsuarioComSucesso() throws Exception {
        UUID id = UUID.randomUUID();

        doNothing().when(activityService).subscribe(id, "lucas@email.com");

        mockMvc.perform(post("/activities/{id}/subscribe", id)
                        .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(content().string("Inscrito com sucesso"));
    }

    @Test
    void naoDeveInscreverQuandoJaRegistrado() throws Exception {
        UUID id = UUID.randomUUID();

        doThrow(new BusinessException("E7: Você já se registrou nesta atividade."))
                .when(activityService).subscribe(id, "lucas@email.com");

        mockMvc.perform(post("/activities/{id}/subscribe", id)
                        .principal(authentication))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Você já se registrou nesta atividade."));
    }

    @Test
    void naoDeveInscreverQuandoAtividadeNaoExiste() throws Exception {
        UUID id = UUID.randomUUID();

        doThrow(new BusinessException("E4: Atividade não encontrada."))
                .when(activityService).subscribe(id, "lucas@email.com");

        mockMvc.perform(post("/activities/{id}/subscribe", id)
                        .principal(authentication))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Atividade não encontrada."));
    }

    @Test
    void deveCancelarInscricaoComSucesso() throws Exception {
        UUID id = UUID.randomUUID();

        doNothing().when(activityService).unsubscribe(id, "lucas@email.com");

        mockMvc.perform(delete("/activities/{id}/unsubscribe", id)
                        .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(content().string("Inscrição cancelada com sucesso"));
    }

    @Test
    void deveAprovarParticipanteComSucesso() throws Exception {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        doNothing().when(activityService).approve(id, userId, "lucas@email.com");

        mockMvc.perform(post("/activities/{id}/approve", id)
                        .param("userId", userId.toString())
                        .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(content().string("Participante aprovado com sucesso"));
    }

    @Test
    void naoDeveAprovarParticipanteInexistente() throws Exception {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        doThrow(new BusinessException("E4: Participante não encontrado."))
                .when(activityService).approve(id, userId, "lucas@email.com");

        mockMvc.perform(post("/activities/{id}/approve", id)
                        .param("userId", userId.toString())
                        .principal(authentication))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Participante não encontrado."));
    }

    @Test
    void deveFazerCheckInComSucesso() throws Exception {
        UUID id = UUID.randomUUID();
        CheckInRequest request = new CheckInRequest("123456");

        doNothing().when(activityService).checkIn(id, "123456", "lucas@email.com");

        mockMvc.perform(post("/activities/{id}/checkin", id)
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Check-in realizado com sucesso"));
    }

    @Test
    void naoDeveFazerCheckInDuasVezes() throws Exception {
        UUID id = UUID.randomUUID();
        CheckInRequest request = new CheckInRequest("123456");

        doThrow(new BusinessException("E11: Você já confirmou sua participação nesta atividade."))
                .when(activityService).checkIn(id, "123456", "lucas@email.com");

        mockMvc.perform(post("/activities/{id}/checkin", id)
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Você já confirmou sua participação nesta atividade."));
    }

    @Test
    void deveAtualizarAtividadeComSucesso() throws Exception {
        UUID id = UUID.randomUUID();

        UpdateActivityRequest request = new UpdateActivityRequest(
                "Novo título",
                "Nova descrição",
                ActivityType.CULTURE,
                "imagem.jpg",
                LocalDateTime.now().plusDays(2),
                "Novo local",
                ActivityVisibility.PUBLIC
        );

        ActivityResponse response = new ActivityResponse(
                id,
                "Novo título",
                "Nova descrição",
                ActivityType.CULTURE,
                "imagem.jpg",
                request.activityDate(),
                "Novo local",
                ActivityVisibility.PUBLIC,
                ActivityStatus.ACTIVE,
                "Lucas"
        );

        when(activityService.update(eq(id), any(UpdateActivityRequest.class), eq("lucas@email.com")))
                .thenReturn(response);

        mockMvc.perform(put("/activities/{id}/update", id)
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Novo título"));
    }

    @Test
    void deveConcluirAtividadeComSucesso() throws Exception {
        UUID id = UUID.randomUUID();

        doNothing().when(activityService).complete(id, "lucas@email.com");

        mockMvc.perform(post("/activities/{id}/conclude", id)
                        .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(content().string("Atividade concluída com sucesso"));
    }

    @Test
    void deveDeletarAtividadeComSucesso() throws Exception {
        UUID id = UUID.randomUUID();

        doNothing().when(activityService).delete(id, "lucas@email.com");

        mockMvc.perform(delete("/activities/{id}/delete", id)
                        .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(content().string("Atividade deletada com sucesso"));
    }

    private CreateActivityRequest createRequest() {
        return new CreateActivityRequest(
                "Futebol",
                "Futebol no parque",
                ActivityType.SPORT,
                "foto.png",
                LocalDateTime.now().plusDays(1),
                "Parque",
                ActivityVisibility.PRIVATE
        );
    }

    private ActivityResponse activityResponse() {
        return new ActivityResponse(
                UUID.randomUUID(),
                "Futebol",
                "Futebol no parque",
                ActivityType.SPORT,
                "foto.png",
                LocalDateTime.now().plusDays(1),
                "Parque",
                ActivityVisibility.PRIVATE,
                ActivityStatus.ACTIVE,
                "Lucas"
        );
    }
}
