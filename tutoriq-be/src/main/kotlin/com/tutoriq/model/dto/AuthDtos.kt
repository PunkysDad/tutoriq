package com.tutoriq.model.dto

import com.tutoriq.model.entity.UserRole
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.util.UUID

data class RegisterRequest(
    @field:NotBlank @field:Email val email: String,
    @field:NotBlank val password: String,
    @field:NotBlank val firstName: String,
    @field:NotBlank val lastName: String,
    val gradeLevel: Int? = null,
    @field:NotNull val role: UserRole
)

data class LoginRequest(
    @field:NotBlank @field:Email val email: String,
    @field:NotBlank val password: String
)

data class AuthResponse(
    val token: String,
    val userId: UUID,
    val email: String,
    val firstName: String,
    val lastName: String,
    val role: UserRole
)
