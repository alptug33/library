package com.alp2.library.config;


import com.alp2.library.entity.User;
import com.alp2.library.enums.Role;
import com.alp2.library.repository.UserRepository;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminUserInitializer {

    @Bean
    public ApplicationRunner initAdminUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            if (userRepository.findByEmail("admin@alp2.com").isEmpty()) {


                User admin = new User();
                admin.setFirstName("Super");
                admin.setLastName("Admin");
                admin.setEmail("admin@alp2.com");


                admin.setPassword(passwordEncoder.encode("admin_sifre"));


                admin.setRole(Role.ADMIN);

                userRepository.save(admin);
                System.out.println("ADMIN kullanıcısı başarıyla oluşturuldu: admin@alp2.com");
            } else {
                System.out.println("ADMIN kullanıcısı zaten mevcut.");
            }
        };
    }
}
