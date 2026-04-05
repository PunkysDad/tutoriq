package com.tutoriq.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.tutoriq.exception.InvalidCredentialsException
import com.tutoriq.model.dto.AuthResponse
import com.tutoriq.model.dto.LoginRequest
import com.tutoriq.model.dto.RegisterRequest
import com.tutoriq.model.entity.UserRole
import com.tutoriq.repository.UserRepository
import com.tutoriq.security.JwtTokenProvider
import com.tutoriq.service.UserService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

@WebMvcTest(AuthController::class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired private lateinit var mockMvc: MockMvc
    @Autowired private lateinit var objectMapper: ObjectMapper
    @MockitoBean private lateinit var userService: UserService
    @MockitoBean private lateinit var jwtTokenProvider: JwtTokenProvider
    @MockitoBean private lateinit var userRepository: UserRepository

    private val authResponse = AuthResponse(
        token = "jwt-token",
        userId = UUID.randomUUID(),
        email = "test@example.com",
        firstName = "Test",
        lastName = "User",
        role = UserRole.STUDENT
    )

    @Test
    fun `POST register returns 200 with AuthResponse`() {
        val request = RegisterRequest(
            email = "test@example.com",
            password = "password123",
            firstName = "Test",
            lastName = "User",
            role = UserRole.STUDENT
        )

        whenever(userService.register(any())).thenReturn(authResponse)

        mockMvc.perform(
            post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.token").value("jwt-token"))
            .andExpect(jsonPath("$.email").value("test@example.com"))
    }

    @Test
    fun `POST login returns 200 with AuthResponse`() {
        val request = LoginRequest(email = "test@example.com", password = "password123")

        whenever(userService.login(any())).thenReturn(authResponse)

        mockMvc.perform(
            post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.token").value("jwt-token"))
            .andExpect(jsonPath("$.email").value("test@example.com"))
    }

    @Test
    fun `POST login with bad credentials returns 401`() {
        val request = LoginRequest(email = "test@example.com", password = "wrong")

        whenever(userService.login(any())).thenThrow(InvalidCredentialsException("Invalid email or password"))

        mockMvc.perform(
            post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isUnauthorized)
            .andExpect(jsonPath("$.error").value("Invalid email or password"))
    }
}
