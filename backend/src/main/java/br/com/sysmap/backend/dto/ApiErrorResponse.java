package br.com.sysmap.backend.dto;

public record ApiErrorResponse(
        int status,
        String error,
        String message
) {}
