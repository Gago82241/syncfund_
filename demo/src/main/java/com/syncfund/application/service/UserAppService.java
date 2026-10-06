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
import com.syncfund.persistence.repository.UserRepository;
import com.syncfund.security.CurrentUserProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserAppService {

    private final UserRepository userRepository;
    private final PersonalWalletRepository personalWalletRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final CurrentUserProvider currentUserProvider;

    public UserAppService(UserRepository userRepository,
                           PersonalWalletRepository personalWalletRepository,
                           PasswordEncoder passwordEncoder,
                           UserMapper userMapper,
                           CurrentUserProvider currentUserProvider) {
        this.userRepository = userRepository;
        this.personalWalletRepository = personalWalletRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.currentUserProvider = currentUserProvider;
    }

    /** Registra el User y le crea automáticamente su PersonalWallet (relación "owns" 1:1 del MER). */
    @Transactional
    public UserResponse register(RegisterUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Ya existe un usuario registrado con ese email");
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
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Credenciales inválidas"));

        boolean valid = user.login(request.getEmail(), request.getPassword(), user.getPassword())
                && passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!valid) {
            throw new BusinessException("Credenciales inválidas");
        }
        return userMapper.toResponse(user);
    }

    public UserResponse findById(Long id) {
        return userMapper.toResponse(getUserOrThrow(id));
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
