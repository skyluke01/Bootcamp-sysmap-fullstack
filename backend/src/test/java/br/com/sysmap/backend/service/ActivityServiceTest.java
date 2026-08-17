package br.com.sysmap.backend.service;

import br.com.sysmap.backend.dto.CreateActivityRequest;
import br.com.sysmap.backend.dto.UpdateActivityRequest;
import br.com.sysmap.backend.exception.BusinessException;
import br.com.sysmap.backend.model.Activity;
import br.com.sysmap.backend.model.ActivityParticipant;
import br.com.sysmap.backend.model.User;
import br.com.sysmap.backend.model.enums.*;
import br.com.sysmap.backend.repository.ActivityParticipantRepository;
import br.com.sysmap.backend.repository.ActivityRepository;
import br.com.sysmap.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivityServiceTest {

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private ActivityParticipantRepository activityParticipantRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserService userService;

    @Mock
    private AchievementService achievementService;

    @InjectMocks
    private ActivityService activityService;

    @Test
    void deveCriarAtividadeComSucesso() {
        User creator = activeUser();

        CreateActivityRequest request = new CreateActivityRequest(
                "Futebol",
                "Futebol no parque",
                ActivityType.SPORT,
                "foto.png",
                LocalDateTime.now().plusDays(1),
                "Parque",
                ActivityVisibility.PUBLIC
        );

        when(userService.getLoggedUser(creator.getEmail())).thenReturn(creator);
        when(activityRepository.save(any(Activity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(activityRepository.countByCreator(creator)).thenReturn(1L);

        var response = activityService.create(request, creator.getEmail());

        assertEquals("Futebol", response.title());
        assertEquals(ActivityType.SPORT, response.type());

        verify(activityRepository).save(any(Activity.class));
        verify(userService).addXp(creator, 20);
        verify(achievementService).unlock(creator, AchievementType.FIRST_ACTIVITY_CREATED);
    }

    @Test
    void naoDeveCriarAtividadeComImagemInvalida() {
        User creator = activeUser();

        CreateActivityRequest request = new CreateActivityRequest(
                "Futebol",
                "Futebol no parque",
                ActivityType.SPORT,
                "arquivo.txt",
                LocalDateTime.now().plusDays(1),
                "Parque",
                ActivityVisibility.PUBLIC
        );

        when(userService.getLoggedUser(creator.getEmail())).thenReturn(creator);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> activityService.create(request, creator.getEmail())
        );

        assertEquals("E2: A imagem deve ser um arquivo PNG ou JPG.", exception.getMessage());
        verify(activityRepository, never()).save(any(Activity.class));
    }

    @Test
    void deveInscreverUsuarioComSucessoEmAtividadePublica() {
        User creator = activeUser();
        creator.setId(UUID.randomUUID());

        User participant = activeUser();
        participant.setId(UUID.randomUUID());
        participant.setEmail("participante@email.com");

        Activity activity = activeActivity(creator);
        activity.setVisibility(ActivityVisibility.PUBLIC);

        when(activityRepository.findById(activity.getId())).thenReturn(Optional.of(activity));
        when(userService.getLoggedUser(participant.getEmail())).thenReturn(participant);
        when(activityParticipantRepository.existsByActivityAndUser(activity, participant)).thenReturn(false);
        when(activityParticipantRepository.countByUser(participant)).thenReturn(1L);

        activityService.subscribe(activity.getId(), participant.getEmail());

        verify(activityParticipantRepository).save(any(ActivityParticipant.class));
        verify(userService).addXp(participant, 10);
        verify(achievementService).unlock(participant, AchievementType.FIRST_SUBSCRIPTION);
    }

    @Test
    void naoDeveInscreverQuandoAtividadeNaoExiste() {
        UUID activityId = UUID.randomUUID();

        when(activityRepository.findById(activityId)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> activityService.subscribe(activityId, "user@email.com")
        );

        assertEquals("E4: Atividade não encontrada.", exception.getMessage());
    }

    @Test
    void naoDeveInscreverDuasVezes() {
        User creator = activeUser();
        creator.setId(UUID.randomUUID());

        User participant = activeUser();
        participant.setId(UUID.randomUUID());
        participant.setEmail("participante@email.com");

        Activity activity = activeActivity(creator);

        when(activityRepository.findById(activity.getId())).thenReturn(Optional.of(activity));
        when(userService.getLoggedUser(participant.getEmail())).thenReturn(participant);
        when(activityParticipantRepository.existsByActivityAndUser(activity, participant)).thenReturn(true);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> activityService.subscribe(activity.getId(), participant.getEmail())
        );

        assertEquals("E7: Você já se registrou nesta atividade.", exception.getMessage());
    }

    @Test
    void naoDevePermitirCriadorSeInscrever() {
        User creator = activeUser();
        Activity activity = activeActivity(creator);

        when(activityRepository.findById(activity.getId())).thenReturn(Optional.of(activity));
        when(userService.getLoggedUser(creator.getEmail())).thenReturn(creator);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> activityService.subscribe(activity.getId(), creator.getEmail())
        );

        assertEquals("E8: O criador da atividade não pode se inscrever como um participante.", exception.getMessage());
    }

    @Test
    void deveAprovarParticipanteComSucesso() {
        User creator = activeUser();
        User participantUser = activeUser();
        participantUser.setId(UUID.randomUUID());
        participantUser.setEmail("participante@email.com");

        Activity activity = activeActivity(creator);
        activity.setVisibility(ActivityVisibility.PRIVATE);

        ActivityParticipant participant = ActivityParticipant.builder()
                .id(UUID.randomUUID())
                .activity(activity)
                .user(participantUser)
                .status(ParticipantStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        when(activityRepository.findById(activity.getId())).thenReturn(Optional.of(activity));
        when(userService.getLoggedUser(creator.getEmail())).thenReturn(creator);
        when(userRepository.findById(participantUser.getId())).thenReturn(Optional.of(participantUser));
        when(activityParticipantRepository.findByActivityAndUser(activity, participantUser))
                .thenReturn(Optional.of(participant));

        activityService.approve(activity.getId(), participantUser.getId(), creator.getEmail());

        assertEquals(ParticipantStatus.APPROVED, participant.getStatus());
        verify(activityParticipantRepository).save(participant);
    }

    @Test
    void naoDeveAprovarQuandoNaoForCriador() {
        User creator = activeUser();
        creator.setId(UUID.randomUUID());

        User otherUser = activeUser();
        otherUser.setId(UUID.randomUUID());
        otherUser.setEmail("outro@email.com");

        Activity activity = activeActivity(creator);

        when(activityRepository.findById(activity.getId())).thenReturn(Optional.of(activity));
        when(userService.getLoggedUser(otherUser.getEmail())).thenReturn(otherUser);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> activityService.approve(activity.getId(), UUID.randomUUID(), otherUser.getEmail())
        );

        assertEquals("E16: Apenas o criador da atividade pode aprovar participantes.", exception.getMessage());
    }

    @Test
    void deveFazerCheckInComSucesso() {
        User creator = activeUser();

        User participantUser = activeUser();
        participantUser.setId(UUID.randomUUID());
        participantUser.setEmail("participante@email.com");

        Activity activity = activeActivity(creator);
        activity.setConfirmationCode("123456");

        ActivityParticipant participant = ActivityParticipant.builder()
                .id(UUID.randomUUID())
                .activity(activity)
                .user(participantUser)
                .status(ParticipantStatus.APPROVED)
                .createdAt(LocalDateTime.now())
                .build();

        when(activityRepository.findById(activity.getId())).thenReturn(Optional.of(activity));
        when(userService.getLoggedUser(participantUser.getEmail())).thenReturn(participantUser);
        when(activityParticipantRepository.findByActivityAndUser(activity, participantUser))
                .thenReturn(Optional.of(participant));
        when(activityParticipantRepository.countByUserAndStatus(participantUser, ParticipantStatus.CHECKED_IN))
                .thenReturn(1L);

        activityService.checkIn(activity.getId(), "123456", participantUser.getEmail());

        assertEquals(ParticipantStatus.CHECKED_IN, participant.getStatus());
        verify(activityParticipantRepository).save(participant);
        verify(userService).addXp(participantUser, 30);
        verify(userService).addXp(creator, 30);
        verify(achievementService).unlock(participantUser, AchievementType.FIRST_CHECKIN);
    }

    @Test
    void naoDeveFazerCheckInDuasVezes() {
        User creator = activeUser();

        User participantUser = activeUser();
        participantUser.setId(UUID.randomUUID());
        participantUser.setEmail("participante@email.com");

        Activity activity = activeActivity(creator);
        activity.setConfirmationCode("123456");

        ActivityParticipant participant = ActivityParticipant.builder()
                .id(UUID.randomUUID())
                .activity(activity)
                .user(participantUser)
                .status(ParticipantStatus.CHECKED_IN)
                .createdAt(LocalDateTime.now())
                .build();

        when(activityRepository.findById(activity.getId())).thenReturn(Optional.of(activity));
        when(userService.getLoggedUser(participantUser.getEmail())).thenReturn(participantUser);
        when(activityParticipantRepository.findByActivityAndUser(activity, participantUser))
                .thenReturn(Optional.of(participant));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> activityService.checkIn(activity.getId(), "123456", participantUser.getEmail())
        );

        assertEquals("E11: Você já confirmou sua participação nesta atividade.", exception.getMessage());
    }

    @Test
    void deveAtualizarAtividadeComSucesso() {
        User creator = activeUser();
        Activity activity = activeActivity(creator);

        UpdateActivityRequest request = new UpdateActivityRequest(
                "Novo título",
                "Nova descrição",
                ActivityType.CULTURE,
                "imagem.jpg",
                LocalDateTime.now().plusDays(2),
                "Novo local",
                ActivityVisibility.PRIVATE
        );

        when(activityRepository.findById(activity.getId())).thenReturn(Optional.of(activity));
        when(userService.getLoggedUser(creator.getEmail())).thenReturn(creator);
        when(activityRepository.save(activity)).thenReturn(activity);

        var response = activityService.update(activity.getId(), request, creator.getEmail());

        assertEquals("Novo título", response.title());
        assertEquals(ActivityType.CULTURE, response.type());
        verify(activityRepository).save(activity);
    }

    @Test
    void naoDeveAtualizarAtividadeDeOutroCriador() {
        User creator = activeUser();
        creator.setId(UUID.randomUUID());

        User otherUser = activeUser();
        otherUser.setId(UUID.randomUUID());
        otherUser.setEmail("outro@email.com");

        Activity activity = activeActivity(creator);

        UpdateActivityRequest request = new UpdateActivityRequest(
                "Novo título",
                null,
                null,
                null,
                null,
                null,
                null
        );

        when(activityRepository.findById(activity.getId())).thenReturn(Optional.of(activity));
        when(userService.getLoggedUser(otherUser.getEmail())).thenReturn(otherUser);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> activityService.update(activity.getId(), request, otherUser.getEmail())
        );

        assertEquals("E14: Apenas o criador da atividade pode editá-la.", exception.getMessage());
    }

    @Test
    void deveDeletarAtividadeComSucesso() {
        User creator = activeUser();
        Activity activity = activeActivity(creator);

        when(activityRepository.findById(activity.getId())).thenReturn(Optional.of(activity));
        when(userService.getLoggedUser(creator.getEmail())).thenReturn(creator);

        activityService.delete(activity.getId(), creator.getEmail());

        assertEquals(ActivityStatus.DELETED, activity.getStatus());
        verify(activityRepository).save(activity);
    }

    private User activeUser() {
        return User.builder()
                .id(UUID.randomUUID())
                .name("Lucas")
                .email("lucas@email.com")
                .cpf("12345678900")
                .password("senha")
                .active(true)
                .xp(0)
                .level(1)
                .build();
    }

    private Activity activeActivity(User creator) {
        return Activity.builder()
                .id(UUID.randomUUID())
                .title("Atividade")
                .description("Descrição")
                .type(ActivityType.SPORT)
                .imageUrl("foto.png")
                .activityDate(LocalDateTime.now().plusDays(1))
                .location("Parque")
                .visibility(ActivityVisibility.PUBLIC)
                .status(ActivityStatus.ACTIVE)
                .confirmationCode("123456")
                .creator(creator)
                .build();
    }
}
