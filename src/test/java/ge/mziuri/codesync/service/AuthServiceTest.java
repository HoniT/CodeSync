package ge.mziuri.codesync.service;

import ge.mziuri.codesync.exception.HttpErrorException;
import ge.mziuri.codesync.model.dto.auth.LoginRequest;
import ge.mziuri.codesync.model.dto.auth.RegisterRequest;
import ge.mziuri.codesync.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private TokenService tokenService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerUser_UsernameTaken_ThrowsException() {
        RegisterRequest req = new RegisterRequest("existingUser", "password");
        when(userRepository.existsByUsername("existingUser")).thenReturn(true);

        assertThrows(HttpErrorException.class, () -> authService.registerUser(req));
    }

    @Test
    void registerUser_Success() {
        RegisterRequest req = new RegisterRequest("newUser", "password");
        when(userRepository.existsByUsername("newUser")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");

        assertDoesNotThrow(() -> authService.registerUser(req));
        verify(userRepository, times(1)).save(any());
    }

    @Test
    void authenticateAndGetToken_Success() {
        LoginRequest req = new LoginRequest("user", "pass");
        Authentication auth = mock(Authentication.class);

        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(auth.getName()).thenReturn("user");
        when(tokenService.generateToken("user")).thenReturn("jwt-token");

        String token = authService.authenticateAndGetToken(req);
        assertEquals("jwt-token", token);
    }
}