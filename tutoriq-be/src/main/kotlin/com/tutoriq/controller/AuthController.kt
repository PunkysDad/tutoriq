package com.tutoriq.controller

import com.tutoriq.model.dto.AuthResponse
import com.tutoriq.model.dto.LoginRequest
import com.tutoriq.model.dto.RegisterRequest
import com.tutoriq.service.UserService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(private val userService: UserService) {

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): AuthResponse =
        userService.register(request)

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): AuthResponse =
        userService.login(request)
}
