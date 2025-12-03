package com.alp2.library.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
