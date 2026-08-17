package br.com.sysmap.backend.dto;

import br.com.sysmap.backend.model.enums.AchievementType;

import java.time.LocalDateTime;

public record AchievementResponse(
        AchievementType type,
        LocalDateTime unlockedAt
) {}
