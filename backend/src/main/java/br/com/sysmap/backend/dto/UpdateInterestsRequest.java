package br.com.sysmap.backend.dto;

import br.com.sysmap.backend.model.enums.InterestType;

import java.util.Set;

public record UpdateInterestsRequest(
        Set<InterestType> interests
) {}
