package br.com.sysmap.backend.service;

import br.com.sysmap.backend.dto.AchievementResponse;
import br.com.sysmap.backend.dto.UpdateInterestsRequest;
import br.com.sysmap.backend.dto.UpdateUserRequest;
import br.com.sysmap.backend.exception.BusinessException;
import br.com.sysmap.backend.model.User;
import br.com.sysmap.backend.repository.UserAchievementRepository;
import br.com.sysmap.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final PasswordEncoder passwordEncoder;
    private final StorageService storageService;
    private final UserRepository userRepository;
    private final UserAchievementRepository userAchievementRepository;

    public User getLoggedUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado."));

        if (!user.isActive()) {
            throw new BusinessException("E6: Esta conta foi desativada e não pode ser utilizada.");
        }

        return user;
    }
    public User updateLoggedUser(String email, UpdateUserRequest request) {
        User user = getLoggedUser(email);

        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name());
        }

        if (request.email() != null && !request.email().isBlank()) {
            if (!request.email().equals(user.getEmail())
                    && userRepository.existsByEmail(request.email())) {
                throw new BusinessException("O e-mail informado já pertence a outro usuário.");
            }

            user.setEmail(request.email());
        }

        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        return userRepository.save(user);
    }

    public User updateProfileImage(String email, MultipartFile file) {
        User user = getLoggedUser(email);

        String oldImageUrl = user.getProfileImageUrl();

        String newImageUrl = storageService.uploadProfileImage(file);

        user.setProfileImageUrl(newImageUrl);

        User savedUser = userRepository.save(user);

        storageService.deleteFileByUrl(oldImageUrl);

        return savedUser;
    }

    public void deactivateLoggedUser(String email) {
        User user = getLoggedUser(email);

        if (!user.isActive()) {
            throw new BusinessException("E6: Esta conta foi desativada e não pode ser utilizada.");
        }

        user.setActive(false);
        userRepository.save(user);
    }
    public void addXp(User user, int xpToAdd) {

        int currentXp = user.getXp() + xpToAdd;
        int currentLevel = user.getLevel();

        while (currentXp >= getXpRequiredForNextLevel(currentLevel)) {
            currentXp -= getXpRequiredForNextLevel(currentLevel);
            currentLevel++;
        }

        user.setXp(currentXp);
        user.setLevel(currentLevel);

        userRepository.save(user);
    }
    public User updateInterests(String email, UpdateInterestsRequest request) {
        User user = getLoggedUser(email);

        if (request.interests() == null || request.interests().isEmpty()) {
            throw new BusinessException("E1: Informe os campos obrigatórios corretamente.");
        }

        user.setInterests(request.interests());

        return userRepository.save(user);
    }

    private int getXpRequiredForNextLevel(int level) {
        return 100 + ((level - 1) * 10);
    }
    public List<AchievementResponse> getMyAchievements(String email) {
        User user = getLoggedUser(email);

        return userAchievementRepository.findByUser(user)
                .stream()
                .map(achievement -> new AchievementResponse(
                        achievement.getType(),
                        achievement.getUnlockedAt()
                ))
                .toList();
    }



}
