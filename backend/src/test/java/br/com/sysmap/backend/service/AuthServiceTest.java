package br.com.sysmap.backend.service;

import br.com.sysmap.backend.dto.AuthResponse;
import br.com.sysmap.backend.dto.LoginRequest;
import br.com.sysmap.backend.dto.RegisterRequest;
import br.com.sysmap.backend.exception.BusinessException;
import br.com.sysmap.backend.model.User;
import br.com.sysmap.backend.repository.UserRepository;
import br.com.sysmap.backend.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void deveRegistrarUsuarioComSucesso() {
        RegisterRequest request = new RegisterRequest(
                "Lucas",
                "lucas@email.com",
                "12345678900",
                "123456"
        );

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userRepository.existsByCpf(request.getCpf())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("senhaCriptografada");
        when(jwtService.generateToken(any(User.class))).thenReturn("token");

        AuthResponse response = authService.register(request);

        assertEquals("token", response.getToken());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void naoDeveRegistrarQuandoEmailOuCpfJaExiste() {
        RegisterRequest request = new RegisterRequest(
                "Lucas",
                "lucas@email.com",
                "12345678900",
                "123456"
        );

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> authService.register(request)
        );

        assertEquals("E3: Email ou CPF já cadastrado", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void deveFazerLoginComSucesso() {
        LoginRequest request = new LoginRequest();
        request.setEmail("lucas@email.com");
        request.setPassword("123456");

        User user = User.builder()
                .id(UUID.randomUUID())
                .email("lucas@email.com")
                .password("senhaCriptografada")
                .active(true)
                .build();

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("token");

        AuthResponse response = authService.login(request);

        assertEquals("token", response.getToken());
    }

    @Test
    void naoDeveFazerLoginQuandoUsuarioNaoExiste() {
        LoginRequest request = new LoginRequest();
        request.setEmail("teste@email.com");
        request.setPassword("123456");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> authService.login(request)
        );

        assertEquals("E4: Usuário não encontrado.", exception.getMessage());
    }

    @Test
    void naoDeveFazerLoginQuandoSenhaIncorreta() {
        LoginRequest request = new LoginRequest();
        request.setEmail("lucas@email.com");
        request.setPassword("errada");

        User user = User.builder()
                .id(UUID.randomUUID())
                .email("lucas@email.com")
                .password("senhaCriptografada")
                .active(true)
                .build();

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(false);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> authService.login(request)
        );

        assertEquals("E5: Senha incorreta.", exception.getMessage());
    }

    @Test
    void naoDeveFazerLoginQuandoContaDesativada() {
        LoginRequest request = new LoginRequest();
        request.setEmail("lucas@email.com");
        request.setPassword("123456");

        User user = User.builder()
                .id(UUID.randomUUID())
                .email("lucas@email.com")
                .password("senhaCriptografada")
                .active(false)
                .build();

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(true);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> authService.login(request)
        );

        assertEquals("E6: Esta conta foi desativada e não pode ser utilizada.", exception.getMessage());
    }
}