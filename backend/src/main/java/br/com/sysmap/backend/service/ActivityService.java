package br.com.sysmap.backend.service;

import br.com.sysmap.backend.dto.ActivityParticipantResponse;
import br.com.sysmap.backend.dto.ActivityResponse;
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
import br.com.sysmap.backend.model.enums.InterestType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import br.com.sysmap.backend.model.enums.ParticipantStatus;


import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ActivityParticipantRepository activityParticipantRepository;
    private final AchievementService achievementService;
    private final StorageService storageService;

    public ActivityResponse create(CreateActivityRequest request, String userEmail) {
        User creator = userService.getLoggedUser(userEmail);

        Activity activity = Activity.builder()
                .id(UUID.randomUUID())
                .title(request.title())
                .description(request.description())
                .type(request.type())
                .imageUrl(request.imageUrl())
                .activityDate(request.activityDate())
                .location(request.location())
                .visibility(request.visibility())
                .status(ActivityStatus.ACTIVE)
                .confirmationCode(generateConfirmationCode())
                .creator(creator)
                .build();

        if (request.imageUrl() != null && !request.imageUrl().isBlank()) {

            String image = request.imageUrl().toLowerCase();

            if (!(image.endsWith(".png") || image.endsWith(".jpg"))) {
                throw new BusinessException("E2: A imagem deve ser um arquivo PNG ou JPG.");
            }
        }

        Activity saved = activityRepository.save(activity);

        userService.addXp(creator, 20);

        long createdCount = activityRepository.countByCreator(creator);

        if (createdCount >= 1) {
            achievementService.unlock(creator, AchievementType.FIRST_ACTIVITY_CREATED);
        }

        if (createdCount >= 5) {
            achievementService.unlock(creator, AchievementType.FIVE_ACTIVITIES_CREATED);
        }

        if (createdCount >= 10) {
            achievementService.unlock(creator, AchievementType.TEN_ACTIVITIES_CREATED);
        }

        if (creator.getLevel() > 1 || creator.getXp() >= 100) {
            achievementService.unlock(creator, AchievementType.ONE_HUNDRED_XP);
        }

        return toResponse(saved);

    }

    public List<ActivityResponse> findAll(ActivityType type, String userEmail) {
        User user = userService.getLoggedUser(userEmail);

        List<Activity> activities;

        if (type != null) {
            activities = activityRepository.findByTypeAndStatus(type, ActivityStatus.ACTIVE);
        } else {
            activities = activityRepository.findByStatus(ActivityStatus.ACTIVE);

            activities = activities.stream()
                    .sorted((a1, a2) -> {
                        boolean a1Matches = user.getInterests().contains(toInterestType(a1.getType()));
                        boolean a2Matches = user.getInterests().contains(toInterestType(a2.getType()));

                        return Boolean.compare(a2Matches, a1Matches);
                    })
                    .toList();
        }

        return activities.stream()
                .map(this::toResponse)
                .toList();
    }

    private ActivityResponse toResponse(Activity activity) {
        return new ActivityResponse(
                activity.getId(),
                activity.getTitle(),
                activity.getDescription(),
                activity.getType(),
                activity.getImageUrl(),
                activity.getActivityDate(),
                activity.getLocation(),
                activity.getVisibility(),
                activity.getStatus(),
                activity.getCreator().getName()
        );
    }

    private String generateConfirmationCode() {
        int code = new SecureRandom().nextInt(900000) + 100000;
        return String.valueOf(code);
    }

    public void subscribe(UUID activityId, String userEmail) {

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new BusinessException("E4: Atividade não encontrada."));

        User user = userService.getLoggedUser(userEmail);

        if (activity.getCreator().getId().equals(user.getId())) {
            throw new BusinessException("E8: O criador da atividade não pode se inscrever como um participante.");
        }

        if (activity.getStatus() == ActivityStatus.COMPLETED) {
            throw new BusinessException("E12: Não é possível se inscrever em uma atividade concluída.");
        }

        if (activity.getStatus() == ActivityStatus.DELETED) {
            throw new BusinessException("E4: Atividade não encontrada.");
        }

        if (activityParticipantRepository.existsByActivityAndUser(activity, user)) {
            throw new BusinessException("E7: Você já se registrou nesta atividade.");
        }

        ParticipantStatus status = activity.getVisibility() == ActivityVisibility.PRIVATE
                ? ParticipantStatus.PENDING
                : ParticipantStatus.APPROVED;

        ActivityParticipant participant = ActivityParticipant.builder()
                .id(UUID.randomUUID())
                .activity(activity)
                .user(user)
                .status(status)
                .createdAt(LocalDateTime.now())
                .build();

        activityParticipantRepository.save(participant);
        userService.addXp(user, 10);

        long participatedCount = activityParticipantRepository.countByUser(user);

        if (participatedCount >= 1) {
            achievementService.unlock(user, AchievementType.FIRST_SUBSCRIPTION);
        }

        if (participatedCount >= 5) {
            achievementService.unlock(user, AchievementType.FIVE_ACTIVITIES_PARTICIPATED);
        }

        if (participatedCount >= 10) {
            achievementService.unlock(user, AchievementType.TEN_ACTIVITIES_PARTICIPATED);
        }
    }

    public void unsubscribe(UUID activityId, String userEmail) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new BusinessException("E4: Atividade não encontrada."));

        User user = userService.getLoggedUser(userEmail);

        ActivityParticipant participant = activityParticipantRepository
                .findByActivityAndUser(activity, user)
                .orElseThrow(() -> new BusinessException("Você não está inscrito nesta atividade."));

        if (participant.getStatus() == ParticipantStatus.CHECKED_IN) {
            throw new BusinessException("E18: Não é possível cancelar sua inscrição, pois sua presença já foi confirmada.");
        }

        participant.setStatus(ParticipantStatus.CANCELED);
        activityParticipantRepository.save(participant);
    }

    public void approve(UUID activityId, UUID userId, String creatorEmail) {

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new BusinessException("E4: Atividade não encontrada."));

        User creator = userService.getLoggedUser(creatorEmail);

        if (!activity.getCreator().getId().equals(creator.getId())) {
            throw new BusinessException("E16: Apenas o criador da atividade pode aprovar participantes.");
        }

        if (activity.getVisibility() != ActivityVisibility.PRIVATE) {
            throw new BusinessException("A atividade não é privada.");
        }

        User participantUser = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("E4: Participante não encontrado."));

        ActivityParticipant participant = activityParticipantRepository
                .findByActivityAndUser(activity, participantUser)
                .orElseThrow(() -> new BusinessException("E4: Participante não encontrado."));

        if (participant.getStatus() != ParticipantStatus.PENDING) {
            throw new BusinessException("Participante não está pendente.");
        }

        participant.setStatus(ParticipantStatus.APPROVED);
        activityParticipantRepository.save(participant);
    }
    public void checkIn(UUID activityId, String code, String userEmail) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new BusinessException("E4: Atividade não encontrada."));

        if (activity.getStatus() == ActivityStatus.COMPLETED) {
            throw new BusinessException("E13: Não é possível confirmar presença em uma atividade concluída.");
        }

        User user = userService.getLoggedUser(userEmail);

        ActivityParticipant participant = activityParticipantRepository
                .findByActivityAndUser(activity, user)
                .orElseThrow(() -> new BusinessException("E9: Apenas participantes aprovados na atividade podem fazer check-in."));

        if (participant.getStatus() == ParticipantStatus.CHECKED_IN) {
            throw new BusinessException("E11: Você já confirmou sua participação nesta atividade.");
        }

        if (participant.getStatus() != ParticipantStatus.APPROVED) {
            throw new BusinessException("E9: Apenas participantes aprovados na atividade podem fazer check-in.");
        }

        if (!activity.getConfirmationCode().equals(code)) {
            throw new BusinessException("E10: Código de confirmação incorreto.");
        }

        participant.setStatus(ParticipantStatus.CHECKED_IN);
        participant.setCheckedInAt(LocalDateTime.now());

        activityParticipantRepository.save(participant);
        userService.addXp(user, 30);
        userService.addXp(activity.getCreator(), 30);

        long checkinCount = activityParticipantRepository
                .countByUserAndStatus(user, ParticipantStatus.CHECKED_IN);

        if (checkinCount >= 1) {
            achievementService.unlock(user, AchievementType.FIRST_CHECKIN);
        }

        if (checkinCount >= 5) {
            achievementService.unlock(user, AchievementType.FIVE_CHECKINS);
        }

        if (checkinCount >= 10) {
            achievementService.unlock(user, AchievementType.TEN_CHECKINS);
        }

        if (user.getLevel() > 1 || user.getXp() >= 100) {
            achievementService.unlock(user, AchievementType.ONE_HUNDRED_XP);
        }
    }
    public void complete(UUID activityId, String userEmail) {

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new BusinessException("E4: Atividade não encontrada."));

        User user = userService.getLoggedUser(userEmail);

        if (!activity.getCreator().getId().equals(user.getId())) {
            throw new BusinessException("E17: Apenas o criador da atividade pode concluí-la.");
        }

        if (activity.getStatus() == ActivityStatus.COMPLETED) {
            throw new BusinessException("A atividade já está concluída.");
        }

        activity.setStatus(ActivityStatus.COMPLETED);

        activityRepository.save(activity);
    }
    public ActivityResponse update(UUID activityId, UpdateActivityRequest request, String userEmail) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new BusinessException("E4: Atividade não encontrada."));

        User user = userService.getLoggedUser(userEmail);

        if (!activity.getCreator().getId().equals(user.getId())) {
            throw new BusinessException("E14: Apenas o criador da atividade pode editá-la.");
        }

        if (activity.getStatus() == ActivityStatus.DELETED) {
            throw new BusinessException("E4: Atividade não encontrada.");
        }

        if (request.title() != null && !request.title().isBlank()) {
            activity.setTitle(request.title());
        }

        if (request.description() != null && !request.description().isBlank()) {
            activity.setDescription(request.description());
        }

        if (request.type() != null) {
            activity.setType(request.type());
        }
        if (request.imageUrl() != null && !request.imageUrl().isBlank()) {

            String image = request.imageUrl().toLowerCase();

            if (!(image.endsWith(".png") || image.endsWith(".jpg"))) {
                throw new BusinessException("E2: A imagem deve ser um arquivo PNG ou JPG.");
            }
        }

        if (request.activityDate() != null) {
            activity.setActivityDate(request.activityDate());
        }

        if (request.location() != null && !request.location().isBlank()) {
            activity.setLocation(request.location());
        }

        if (request.visibility() != null) {
            activity.setVisibility(request.visibility());
        }

        Activity saved = activityRepository.save(activity);

        return toResponse(saved);
    }
    public List<ActivityResponse> findAllActivities(String email) {
        userService.getLoggedUser(email);

        return activityRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ActivityResponse> findCreatedByUser(String email) {
        User user = userService.getLoggedUser(email);

        return activityRepository.findByCreatorAndStatus(user, ActivityStatus.ACTIVE)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ActivityResponse> findAllCreatedByUser(String email) {
        User user = userService.getLoggedUser(email);

        return activityRepository.findByCreator(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ActivityResponse> findParticipating(String email) {
        User user = userService.getLoggedUser(email);

        return activityParticipantRepository.findByUserAndStatus(user, ParticipantStatus.APPROVED)
                .stream()
                .map(ActivityParticipant::getActivity)
                .filter(activity -> activity.getStatus() == ActivityStatus.ACTIVE)
                .map(this::toResponse)
                .toList();
    }

    public List<ActivityResponse> findAllParticipating(String email) {
        User user = userService.getLoggedUser(email);

        return activityParticipantRepository.findByUser(user)
                .stream()
                .map(ActivityParticipant::getActivity)
                .map(this::toResponse)
                .toList();
    }

    public List<ActivityParticipantResponse> findParticipants(UUID activityId, String userEmail) {
        userService.getLoggedUser(userEmail);

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new BusinessException("E4: Atividade não encontrada."));

        return activityParticipantRepository.findByActivity(activity)
                .stream()
                .map(participant -> new ActivityParticipantResponse(
                        participant.getUser().getId(),
                        participant.getUser().getName(),
                        participant.getUser().getEmail(),
                        participant.getStatus()
                ))
                .toList();
    }

    public void delete(UUID activityId, String userEmail) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new BusinessException("E4: Atividade não encontrada."));

        User user = userService.getLoggedUser(userEmail);

        if (!activity.getCreator().getId().equals(user.getId())) {
            throw new BusinessException("E15: Apenas o criador da atividade pode deletá-la.");
        }

        if (activity.getStatus() == ActivityStatus.DELETED) {
            throw new BusinessException("Atividade já deletada.");
        }

        activity.setStatus(ActivityStatus.DELETED);
        activityRepository.save(activity);
    }

    private InterestType toInterestType(ActivityType activityType) {
        return switch (activityType) {
            case SPORT -> InterestType.SPORT;
            case STUDY -> InterestType.STUDY;
            case CULTURE -> InterestType.CULTURE;
            case TECHNOLOGY -> InterestType.TECHNOLOGY;
            case SOCIAL -> InterestType.SOCIAL;
        };
    }
}
