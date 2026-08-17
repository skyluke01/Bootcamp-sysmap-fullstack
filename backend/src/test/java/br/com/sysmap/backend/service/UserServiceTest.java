package br.com.sysmap.backend.service;

import br.com.sysmap.backend.dto.UpdateInterestsRequest;
import br.com.sysmap.backend.dto.UpdateUserRequest;
import br.com.sysmap.backend.exception.BusinessException;
import br.com.sysmap.backend.model.User;
import br.com.sysmap.backend.model.enums.InterestType;
import br.com.sysmap.backend.repository.UserAchievementRepository;
import br.com.sysmap.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private StorageService storageService;

    @Mock
    private UserAchievementRepository userAchievementRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void deveBuscarUsuarioLogadoComSucesso() {
        User user = activeUser();

        when(userRepository.findByEmail("lucas@email.com")).thenReturn(Optional.of(user));

        User result = userService.getLoggedUser("lucas@email.com");

        assertEquals(user.getEmail(), result.getEmail());
        assertTrue(result.isActive());
    }

    @Test
    void naoDeveBuscarUsuarioInexistente() {
        when(userRepository.findByEmail("inexistente@email.com")).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> userService.getLoggedUser("inexistente@email.com")
        );

        assertEquals("Usuário não encontrado.", exception.getMessage());
    }

    @Test
    void naoDevePermitirUsuarioDesativado() {
        User user = activeUser();
        user.setActive(false);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> userService.getLoggedUser(user.getEmail())
        );

        assertEquals("E6: Esta conta foi desativada e não pode ser utilizada.", exception.getMessage());
    }

    @Test
    void deveEditarUsuarioComSucesso() {
        User user = activeUser();

        UpdateUserRequest request = new UpdateUserRequest(
                "Lucas Mendes",
                "lucasnovo@email.com",
                "novaSenha"
        );

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("senhaCriptografada");
        when(userRepository.save(user)).thenReturn(user);

        User result = userService.updateLoggedUser(user.getEmail(), request);

        assertEquals("Lucas Mendes", result.getName());
        assertEquals("lucasnovo@email.com", result.getEmail());
        assertEquals("senhaCriptografada", result.getPassword());

        verify(userRepository).save(user);
    }

    @Test
    void naoDeveEditarEmailParaEmailJaCadastrado() {
        User user = activeUser();

        UpdateUserRequest request = new UpdateUserRequest(
                "Lucas",
                "emailusado@email.com",
                null
        );

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> userService.updateLoggedUser(user.getEmail(), request)
        );

        assertEquals("O e-mail informado já pertence a outro usuário.", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void deveAtualizarInteressesComSucesso() {
        User user = activeUser();

        UpdateInterestsRequest request = new UpdateInterestsRequest(
                Set.of(InterestType.SPORT, InterestType.TECHNOLOGY)
        );

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        User result = userService.updateInterests(user.getEmail(), request);

        assertTrue(result.getInterests().contains(InterestType.SPORT));
        assertTrue(result.getInterests().contains(InterestType.TECHNOLOGY));

        verify(userRepository).save(user);
    }

    @Test
    void naoDeveAtualizarInteressesVazios() {
        User user = activeUser();

        UpdateInterestsRequest request = new UpdateInterestsRequest(Set.of());

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> userService.updateInterests(user.getEmail(), request)
        );

        assertEquals("E1: Informe os campos obrigatórios corretamente.", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void deveDesativarContaComSucesso() {
        User user = activeUser();

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        userService.deactivateLoggedUser(user.getEmail());

        assertFalse(user.isActive());
        verify(userRepository).save(user);
    }

    @Test
    void deveAtualizarFotoDePerfilComSucesso() {
        User user = activeUser();
        user.setProfileImageUrl("https://default-profile-image.com/default.png");

        MultipartFile file = mock(MultipartFile.class);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(storageService.uploadProfileImage(file)).thenReturn("http://localhost:4566/profile-images/profiles/foto.png");
        when(userRepository.save(user)).thenReturn(user);

        User result = userService.updateProfileImage(user.getEmail(), file);

        assertEquals("http://localhost:4566/profile-images/profiles/foto.png", result.getProfileImageUrl());

        verify(storageService).uploadProfileImage(file);
        verify(userRepository).save(user);
    }

    private User activeUser() {
        return User.builder()
                .id(UUID.randomUUID())
                .name("Lucas")
                .email("lucas@email.com")
                .cpf("12345678900")
                .password("senha")
                .active(true)
                .xp(0)
                .level(1)
                .profileImageUrl("https://default-profile-image.com/default.png")
                .interests(new java.util.HashSet<>())
                .build();
    }
}
