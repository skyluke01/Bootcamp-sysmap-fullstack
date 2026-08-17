package br.com.sysmap.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, String>> handleBusiness(BusinessException ex) {

        String code = extractCode(ex.getMessage());
        String message = extractMessage(ex.getMessage());

        HttpStatus status = switch (code) {
            case "E4" -> HttpStatus.NOT_FOUND;
            case "E6" -> HttpStatus.FORBIDDEN;
            case "E7", "E11" -> HttpStatus.CONFLICT;
            case "E19" -> HttpStatus.UNAUTHORIZED;
            default -> HttpStatus.BAD_REQUEST;
        };

        return ResponseEntity
                .status(status)
                .body(Map.of("error", message));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation() {
        return ResponseEntity.badRequest()
                .body(Map.of("error", "Informe os campos corretamente."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric() {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erro interno no servidor."));
    }
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleInvalidJson(
            HttpMessageNotReadableException ex,
            HttpServletRequest request
    ) {
        if (request.getRequestURI().equals("/user/preferences/define")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Um ou mais IDs informados são inválidos."));
        }

        return ResponseEntity.badRequest()
                .body(Map.of("error", "Informe os campos corretamente."));
    }

    private String extractCode(String message) {
        if (message != null && message.matches("^E\\d+.*")) {
            return message.split(":", 2)[0].trim();
        }
        return "";
    }

    private String extractMessage(String message) {
        if (message != null && message.contains(":")) {
            return message.split(":", 2)[1].trim();
        }
        return message;
    }
}
