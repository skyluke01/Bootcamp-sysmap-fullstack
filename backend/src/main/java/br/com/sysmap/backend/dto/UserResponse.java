package br.com.sysmap.backend.dto;

import br.com.sysmap.backend.model.enums.InterestType;

import java.util.Set;

public record UserResponse(
        String id,
        String name,
        String email,
        String cpf,
        boolean active,
        String profileImageUrl,
        int xp,
        int level,
        Set<InterestType>interests
) {}
