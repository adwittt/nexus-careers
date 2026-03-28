package com.nexus.auth.repository;

import com.nexus.auth.entity.Role;
import com.nexus.auth.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class UserRepositoryTest {

    @Autowired private UserRepository userRepository;

    @Test
    void testSaveAndFind() {
        User user = User.builder()
                .name("Test")
                .email("test@test.com")
                .password("pass")
                .role(Role.JOB_SEEKER)
                .build();
        userRepository.save(user);

        Optional<User> found = userRepository.findByEmail("test@test.com");
        assertTrue(found.isPresent());
        assertEquals("Test", found.get().getName());
        assertTrue(userRepository.existsByEmail("test@test.com"));
    }

    @Test
    void testNotExists() {
        assertFalse(userRepository.existsByEmail("notfound@test.com"));
        assertTrue(userRepository.findByEmail("notfound@test.com").isEmpty());
    }
}
