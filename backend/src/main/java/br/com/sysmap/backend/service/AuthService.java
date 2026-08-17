package br.com.sysmap.backend.service;

import br.com.sysmap.backend.dto.AuthResponse;
import br.com.sysmap.backend.dto.LoginRequest;
import br.com.sysmap.backend.dto.RegisterRequest;
import br.com.sysmap.backend.exception.BusinessException;
import br.com.sysmap.backend.model.User;
import br.com.sysmap.backend.repository.UserRepository;
import br.com.sysmap.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {

        // E1 - validação completa
        if (request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()
                || request.getCpf() == null || request.getCpf().isBlank()
                || request.getName() == null || request.getName().isBlank()) {

            throw new BusinessException("E1: Campos obrigatórios não informados");
        }

        // E3 - Email ou CPF já existentes
        if (userRepository.existsByEmail(request.getEmail()) ||
                userRepository.existsByCpf(request.getCpf())) {

            throw new BusinessException("E3: Email ou CPF já cadastrado");
        }

        // Criação do usuário
        User user = User.builder()
                .id(UUID.randomUUID())
                .name(request.getName())
                .email(request.getEmail())
                .cpf(request.getCpf())
                .password(passwordEncoder.encode(request.getPassword()))
                .active(true)
                .profileImageUrl("https://default-profile-image.com/default.png")
                .xp(0)
                .level(1)
                .build();


        userRepository.save(user);

        String token = jwtService.generateToken(user);

        return new AuthResponse(token);
    }

    //  Login
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("E4: Usuário não encontrado."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("E5: Senha incorreta.");
        }

        if (!user.isActive()) {
            throw new BusinessException("E6: Esta conta foi desativada e não pode ser utilizada.");
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(token);
    }
}


