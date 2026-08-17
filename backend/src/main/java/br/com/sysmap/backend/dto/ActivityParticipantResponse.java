package br.com.sysmap.backend.dto;

import br.com.sysmap.backend.model.enums.ParticipantStatus;

import java.util.UUID;

public record ActivityParticipantResponse(
        UUID userId,
        String name,
        String email,
        ParticipantStatus status
) {}
