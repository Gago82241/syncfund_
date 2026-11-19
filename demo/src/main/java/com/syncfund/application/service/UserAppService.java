package com.syncfund.application.service;

import com.syncfund.application.dto.request.LoginRequest;
import com.syncfund.application.dto.request.RegisterUserRequest;
import com.syncfund.application.dto.request.UpdateUserRequest;
import com.syncfund.application.dto.response.UserResponse;
import com.syncfund.application.exception.BusinessException;
import com.syncfund.application.exception.ForbiddenException;
import com.syncfund.application.exception.ResourceNotFoundException;
import com.syncfund.application.mapper.UserMapper;
import com.syncfund.domain.model.PersonalWallet;
import com.syncfund.domain.model.User;
import com.syncfund.persistence.repository.PersonalWalletRepository;
import com.syncfund.persistence.repository.SharedProjectRepository;
import com.syncfund.persistence.repository.UserRepository;
import com.syncfund.security.CurrentUserProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserAppService {

    private final UserRepository userRepository;
    private final PersonalWalletRepository personalWalletRepository;
    private final SharedProjectRepository sharedProjectRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final CurrentUserProvider currentUserProvider;
    private final String unknownUserHash;

    public UserAppService(UserRepository userRepository,
                           PersonalWalletRepository personalWalletRepository,
                           SharedProjectRepository sharedProjectRepository,
                           PasswordEncoder passwordEncoder,
                           UserMapper userMapper,
                           CurrentUserProvider currentUserProvider) {
        this.userRepository = userRepository;
        this.personalWalletRepository = personalWalletRepository;
        this.sharedProjectRepository = sharedProjectRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.currentUserProvider = currentUserProvider;
        // Hash de una clave aleatoria que nadie conoce; solo sirve para igualar el costo del login.
        this.unknownUserHash = passwordEncoder.encode(UUID.randomUUID().toString());
    }

    /** Registra el User y le crea automáticamente su PersonalWallet (relación "owns" 1:1 del MER). */
    @Transactional
    public UserResponse register(RegisterUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Ya existe un usuario registrado con ese correo");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user = userRepository.save(user);

        PersonalWallet wallet = new PersonalWallet();
        wallet.setName("Ahorros personales");
        wallet.setCurrentBalance(0.0);
        wallet.setMonthlySavingsGoal(0.0);
        wallet.setCushionBalance(0.0);
        wallet.setOwner(user);
        personalWalletRepository.save(wallet);

        return userMapper.toResponse(user);
    }

    /** User.login(email, password) delegado: busca el usuario y valida la contraseña encriptada. */
    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            // Se compara igual con BCrypt para que el tiempo de respuesta no revele si el correo existe.
            passwordEncoder.matches(request.getPassword(), unknownUserHash);
            throw new BusinessException("Credenciales inválidas");
        }

        boolean valid = user.login(request.getEmail(), request.getPassword(), user.getPassword())
                && passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!valid) {
            throw new BusinessException("Credenciales inválidas");
        }
        return userMapper.toResponse(user);
    }

    /** El propio usuario ve todos sus datos; un compañero de proyecto, todo menos el saldo; nadie más, nada. */
    public UserResponse findById(Long id) {
        User user = getUserOrThrow(id);

        if (currentUserProvider.getUserId().equals(id)) {
            return userMapper.toResponse(user);
        }
        if (!sharesProjectWithCurrentUser(id)) {
            throw new ForbiddenException("No puedes acceder a la información de otro usuario.");
        }
        return userMapper.toProjectMemberResponse(user);
    }

    /** User.updateData(newName, newEmail). Solo el propio usuario puede editar su perfil. */
    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        requireSelf(id);
        User user = getUserOrThrow(id);
        user.updateData(request.getName(), request.getEmail());
        return userMapper.toResponse(userRepository.save(user));
    }

    /** User.getGeneralSummary(). Solo el propio usuario puede ver su saldo total. */
    public double getGeneralSummary(Long id) {
        requireSelf(id);
        return getUserOrThrow(id).getGeneralSummary();
    }

    private boolean sharesProjectWithCurrentUser(Long userId) {
        return sharedProjectRepository.findByMembers_Id(currentUserProvider.getUserId()).stream()
                .flatMap(project -> project.getMembers().stream())
                .anyMatch(member -> member.getId().equals(userId));
    }

    private void requireSelf(Long id) {
        if (!currentUserProvider.getUserId().equals(id)) {
            throw new ForbiddenException("No puedes acceder a la información de otro usuario.");
        }
    }

    public User getUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + id));
    }
}
