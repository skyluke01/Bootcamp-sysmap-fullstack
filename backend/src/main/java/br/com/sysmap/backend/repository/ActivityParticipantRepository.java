package br.com.sysmap.backend.repository;

import br.com.sysmap.backend.model.Activity;
import br.com.sysmap.backend.model.ActivityParticipant;
import br.com.sysmap.backend.model.User;
import br.com.sysmap.backend.model.enums.ParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ActivityParticipantRepository extends JpaRepository<ActivityParticipant, UUID> {

    boolean existsByActivityAndUser(Activity activity, User user);

    Optional<ActivityParticipant> findByActivityAndUser(Activity activity, User user);

    long countByUser(User user);

    long countByUserAndStatus(User user, ParticipantStatus status);

    List<ActivityParticipant> findByActivity(Activity activity);

    List<ActivityParticipant> findByUserAndStatus(User user, ParticipantStatus status);

    List<ActivityParticipant> findByUser(User user);
}
