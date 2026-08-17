package br.com.sysmap.backend.Controller;

import br.com.sysmap.backend.dto.*;
import br.com.sysmap.backend.model.enums.ActivityType;
import br.com.sysmap.backend.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping("/types")
    public ActivityType[] getTypes() {
        return ActivityType.values();
    }

    @PostMapping("/new")
    public ResponseEntity<ActivityResponse> create(
            @RequestBody CreateActivityRequest request,
            Authentication authentication
    ) {
        ActivityResponse response = activityService.create(request, authentication.getName());

        return ResponseEntity.status(201).body(response);
    }

    @GetMapping
    public List<ActivityResponse> findAll(
            @RequestParam(required = false) ActivityType type,
            Authentication authentication
    ) {
        return activityService.findAll(type, authentication.getName());
    }

    @PostMapping("/{id}/subscribe")
    public ResponseEntity<String> subscribe(
            @PathVariable("id") UUID id,
            Authentication authentication
    ) {
        activityService.subscribe(id, authentication.getName());
        return ResponseEntity.ok("Inscrito com sucesso");
    }
    @DeleteMapping("/{id}/unsubscribe")
    public ResponseEntity<String> unsubscribe(
            @PathVariable("id") UUID id,
            Authentication authentication
    ) {
        activityService.unsubscribe(id, authentication.getName());
        return ResponseEntity.ok("Inscrição cancelada com sucesso");
    }
    @PostMapping("/{id}/approve")
    public ResponseEntity<String> approve(
            @PathVariable("id") UUID activityId,
            @RequestParam UUID userId,
            Authentication authentication
    ) {
        activityService.approve(activityId, userId, authentication.getName());
        return ResponseEntity.ok("Participante aprovado com sucesso");
    }
    @PostMapping("/{id}/checkin")
    public ResponseEntity<String> checkIn(
            @PathVariable("id") UUID id,
            @RequestBody CheckInRequest request,
            Authentication authentication
    ) {
        activityService.checkIn(id, request.code(), authentication.getName());
        return ResponseEntity.ok("Check-in realizado com sucesso");
    }
    @PostMapping("/{id}/conclude")
    public ResponseEntity<String> complete(
            @PathVariable("id") UUID id,
            Authentication authentication
    ) {
        activityService.complete(id, authentication.getName());
        return ResponseEntity.ok("Atividade concluída com sucesso");
    }
    @PutMapping("/{id}/update")
    public ActivityResponse update(
            @PathVariable("id") UUID id,
            @RequestBody UpdateActivityRequest request,
            Authentication authentication
    ) {
        return activityService.update(id, request, authentication.getName());
    }
    @GetMapping("/all")
    public List<ActivityResponse> findAllActivities(Authentication authentication) {
        return activityService.findAllActivities(authentication.getName());
    }

    @GetMapping("/user/creator")
    public List<ActivityResponse> findCreatedByUser(Authentication authentication) {
        return activityService.findCreatedByUser(authentication.getName());
    }

    @GetMapping("/user/creator/all")
    public List<ActivityResponse> findAllCreatedByUser(Authentication authentication) {
        return activityService.findAllCreatedByUser(authentication.getName());
    }

    @GetMapping("/user/participant")
    public List<ActivityResponse> findParticipating(Authentication authentication) {
        return activityService.findParticipating(authentication.getName());
    }

    @GetMapping("/user/participant/all")
    public List<ActivityResponse> findAllParticipating(Authentication authentication) {
        return activityService.findAllParticipating(authentication.getName());
    }

    @GetMapping("/{id}/participants")
    public List<ActivityParticipantResponse> findParticipants(
            @PathVariable("id") UUID id,
            Authentication authentication
    ) {
        return activityService.findParticipants(id, authentication.getName());
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<String> delete(
            @PathVariable("id") UUID id,
            Authentication authentication
    ) {
        activityService.delete(id, authentication.getName());
        return ResponseEntity.ok("Atividade deletada com sucesso");
    }
}