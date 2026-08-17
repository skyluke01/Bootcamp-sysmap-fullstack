package br.com.sysmap.backend.repository;

import br.com.sysmap.backend.model.Activity;
import br.com.sysmap.backend.model.User;
import br.com.sysmap.backend.model.enums.ActivityStatus;
import br.com.sysmap.backend.model.enums.ActivityType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ActivityRepository extends JpaRepository<Activity, UUID> {

    List<Activity> findByStatus(ActivityStatus status);

    List<Activity> findByTypeAndStatus(ActivityType type, ActivityStatus status);

    List<Activity> findByCreatorAndStatus(User creator, ActivityStatus status);

    List<Activity> findByCreator(User creator);

    long countByCreator(User creator);
}