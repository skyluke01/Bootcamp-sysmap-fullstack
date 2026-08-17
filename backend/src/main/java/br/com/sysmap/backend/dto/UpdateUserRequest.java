package br.com.sysmap.backend.dto;

public record UpdateUserRequest(
        String name,
        String email,
        String password
) {}
