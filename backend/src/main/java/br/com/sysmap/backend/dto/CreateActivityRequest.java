package br.com.sysmap.backend.dto;

import br.com.sysmap.backend.model.enums.ActivityType;
import br.com.sysmap.backend.model.enums.ActivityVisibility;

import java.time.LocalDateTime;

public record CreateActivityRequest(
        String title,
        String description,
        ActivityType type,
        String imageUrl,
        LocalDateTime activityDate,
        String location,
        ActivityVisibility visibility
) {}

