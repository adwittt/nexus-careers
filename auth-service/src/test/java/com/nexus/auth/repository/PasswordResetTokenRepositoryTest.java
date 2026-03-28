package com.nexus.auth.repository;

import com.nexus.auth.entity.PasswordResetToken;
import com.nexus.auth.entity.User;
import com.nexus.auth.entity.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class PasswordResetTokenRepositoryTest {

    @Autowired private PasswordResetTokenRepository repository;
    @Autowired private UserRepository userRepository;

    @Test
    void testSaveAndFind() {
        User user = User.builder().email("test@test.com").name("Test").role(Role.JOB_SEEKER).build();
        userRepository.save(user);

        PasswordResetToken token = new PasswordResetToken();
        token.setToken("abcd");
        token.setUser(user);
        token.setExpiryDate(LocalDateTime.now().plusDays(1));
        repository.save(token);

        Optional<PasswordResetToken> found = repository.findByToken("abcd");
        assertTrue(found.isPresent());
        assertEquals("test@test.com", found.get().getUser().getEmail());
    }
}
