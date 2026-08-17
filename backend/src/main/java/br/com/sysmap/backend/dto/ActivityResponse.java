package br.com.sysmap.backend.dto;

import br.com.sysmap.backend.model.enums.ActivityStatus;
import br.com.sysmap.backend.model.enums.ActivityType;
import br.com.sysmap.backend.model.enums.ActivityVisibility;

import java.time.LocalDateTime;
import java.util.UUID;

public record ActivityResponse(
        UUID id,
        String title,
        String description,
        ActivityType type,
        String imageUrl,
        LocalDateTime activityDate,
        String location,
        ActivityVisibility visibility,
        ActivityStatus status,
        String creatorName
)
{ }
