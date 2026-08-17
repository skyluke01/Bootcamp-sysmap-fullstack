package br.com.sysmap.backend.service;

import br.com.sysmap.backend.model.User;
import br.com.sysmap.backend.model.UserAchievement;
import br.com.sysmap.backend.model.enums.AchievementType;
import br.com.sysmap.backend.repository.UserAchievementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AchievementService {

    private final UserAchievementRepository userAchievementRepository;

    public void unlock(User user, AchievementType type) {
        if (userAchievementRepository.existsByUserAndType(user, type)) {
            return;
        }

        UserAchievement achievement = UserAchievement.builder()
                .id(UUID.randomUUID())
                .user(user)
                .type(type)
                .unlockedAt(LocalDateTime.now())
                .build();

        userAchievementRepository.save(achievement);
    }
}
