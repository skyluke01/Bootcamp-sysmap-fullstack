package br.com.sysmap.backend.repository;

import br.com.sysmap.backend.model.User;
import br.com.sysmap.backend.model.UserAchievement;
import br.com.sysmap.backend.model.enums.AchievementType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, UUID> {

    boolean existsByUserAndType(User user, AchievementType type);

    List<UserAchievement> findByUser(User user);
}
