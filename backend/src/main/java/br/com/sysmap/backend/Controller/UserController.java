package br.com.sysmap.backend.Controller;

import br.com.sysmap.backend.dto.AchievementResponse;
import br.com.sysmap.backend.dto.UpdateInterestsRequest;
import br.com.sysmap.backend.dto.UpdateUserRequest;
import br.com.sysmap.backend.dto.UserResponse;
import br.com.sysmap.backend.exception.BusinessException;
import br.com.sysmap.backend.model.User;
import br.com.sysmap.backend.model.enums.InterestType;
import br.com.sysmap.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public UserResponse me(Authentication authentication) {

        String email = authentication.getName();

        User user = userService.getLoggedUser(email);

        return toUserResponse(user);
    }
    @PutMapping("/update")
    public UserResponse updateMe(
            @RequestBody UpdateUserRequest request,
            Authentication authentication
    ) {
        User user = userService.updateLoggedUser(authentication.getName(), request);

        return toUserResponse(user);

    }

    @PutMapping(value = "/avatar", consumes = "multipart/form-data")
    public ResponseEntity<String> uploadPhoto(
            @RequestParam("avatar") MultipartFile file,
            Authentication authentication
    ) {
        User user = userService.updateProfileImage(authentication.getName(), file);
        return ResponseEntity.ok(user.getProfileImageUrl());
    }

    @DeleteMapping("/deactivate")
    public ResponseEntity<String> deactivateMe(Authentication authentication) {
        userService.deactivateLoggedUser(authentication.getName());
        return ResponseEntity.ok("Conta desativada com sucesso");
    }
    @GetMapping("/achievements")
    public List<AchievementResponse> myAchievements(Authentication authentication) {
        return userService.getMyAchievements(authentication.getName());
    }
    @GetMapping("/preferences")
    public Set<InterestType> getPreferences(Authentication authentication) {
        User user = userService.getLoggedUser(authentication.getName());
        return user.getInterests();
    }
    @PostMapping("/preferences/define")
    public ResponseEntity<Map<String, String>> updateInterests(
            @RequestBody UpdateInterestsRequest request,
            Authentication authentication
    ) {
        try {
            userService.updateInterests(authentication.getName(), request);

            return ResponseEntity.ok(
                    Map.of("message", "Preferências atualizadas com sucesso")
            );

        } catch (BusinessException e) {
            if (e.getMessage() != null && e.getMessage().startsWith("E6:")) {
                throw e;
            }

            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Um ou mais IDs informados são inválidos."));
        }

    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId().toString(),
                user.getName(),
                user.getEmail(),
                user.getCpf(),
                user.isActive(),
                user.getProfileImageUrl(),
                user.getXp(),
                user.getLevel(),
                user.getInterests()
        );
    }
}

