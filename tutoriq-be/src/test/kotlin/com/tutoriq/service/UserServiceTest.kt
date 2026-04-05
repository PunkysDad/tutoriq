package com.tutoriq.service

import com.tutoriq.exception.EmailAlreadyExistsException
import com.tutoriq.exception.InvalidCredentialsException
import com.tutoriq.exception.ResourceNotFoundException
import com.tutoriq.model.dto.LoginRequest
import com.tutoriq.model.dto.RegisterRequest
import com.tutoriq.model.entity.User
import com.tutoriq.model.entity.UserRole
import com.tutoriq.repository.UserRepository
import com.tutoriq.security.JwtTokenProvider
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import java.util.Optional
import java.util.UUID
import org.springframework.security.crypto.password.PasswordEncoder

@ExtendWith(MockitoExtension::class)
class UserServiceTest {

    @Mock lateinit var userRepository: UserRepository
    @Mock lateinit var passwordEncoder: PasswordEncoder
    @Mock lateinit var jwtTokenProvider: JwtTokenProvider

    @InjectMocks lateinit var userService: UserService

    private val testUser = User(
        email = "test@example.com",
        passwordHash = "hashed-password",
        firstName = "Test",
        lastName = "User",
        role = UserRole.STUDENT
    )

    @Test
    fun `register returns AuthResponse with token`() {
        val request = RegisterRequest(
            email = "test@example.com",
            password = "password123",
            firstName = "Test",
            lastName = "User",
            role = UserRole.STUDENT
        )

        whenever(userRepository.findByEmail(request.email)).thenReturn(null)
        whenever(passwordEncoder.encode(request.password)).thenReturn("hashed-password")
        whenever(userRepository.save(any<User>())).thenReturn(testUser)
        whenever(jwtTokenProvider.generateToken(any())).thenReturn("jwt-token")

        val response = userService.register(request)

        assertEquals("jwt-token", response.token)
        assertEquals("test@example.com", response.email)
        assertEquals("Test", response.firstName)
        assertEquals(UserRole.STUDENT, response.role)
    }

    @Test
    fun `register with duplicate email throws EmailAlreadyExistsException`() {
        val request = RegisterRequest(
            email = "test@example.com",
            password = "password123",
            firstName = "Test",
            lastName = "User",
            role = UserRole.STUDENT
        )

        whenever(userRepository.findByEmail(request.email)).thenReturn(testUser)

        assertThrows<EmailAlreadyExistsException> {
            userService.register(request)
        }
    }

    @Test
    fun `login with valid credentials returns AuthResponse with token`() {
        val request = LoginRequest(email = "test@example.com", password = "password123")

        whenever(userRepository.findByEmail(request.email)).thenReturn(testUser)
        whenever(passwordEncoder.matches(request.password, testUser.passwordHash)).thenReturn(true)
        whenever(jwtTokenProvider.generateToken(any())).thenReturn("jwt-token")

        val response = userService.login(request)

        assertEquals("jwt-token", response.token)
        assertEquals("test@example.com", response.email)
    }

    @Test
    fun `login with invalid password throws InvalidCredentialsException`() {
        val request = LoginRequest(email = "test@example.com", password = "wrong-password")

        whenever(userRepository.findByEmail(request.email)).thenReturn(testUser)
        whenever(passwordEncoder.matches(request.password, testUser.passwordHash)).thenReturn(false)

        assertThrows<InvalidCredentialsException> {
            userService.login(request)
        }
    }

    @Test
    fun `login with unknown email throws InvalidCredentialsException`() {
        val request = LoginRequest(email = "unknown@example.com", password = "password123")

        whenever(userRepository.findByEmail(request.email)).thenReturn(null)

        assertThrows<InvalidCredentialsException> {
            userService.login(request)
        }
    }

    @Test
    fun `register with valid parentId links child to parent`() {
        val parentId = UUID.randomUUID()
        val parentUser = User(
            id = parentId,
            email = "parent@example.com",
            passwordHash = "hash",
            firstName = "Parent",
            lastName = "User",
            role = UserRole.PARENT
        )

        val request = RegisterRequest(
            email = "child@example.com",
            password = "password123",
            firstName = "Child",
            lastName = "User",
            role = UserRole.STUDENT,
            parentId = parentId
        )

        val savedChild = User(
            email = "child@example.com",
            passwordHash = "hashed-password",
            firstName = "Child",
            lastName = "User",
            role = UserRole.STUDENT,
            parentId = parentId
        )

        whenever(userRepository.findByEmail(request.email)).thenReturn(null)
        whenever(userRepository.findById(parentId)).thenReturn(Optional.of(parentUser))
        whenever(passwordEncoder.encode(request.password)).thenReturn("hashed-password")
        whenever(userRepository.save(any<User>())).thenReturn(savedChild)
        whenever(jwtTokenProvider.generateToken(any())).thenReturn("jwt-token")

        val response = userService.register(request)

        assertEquals("jwt-token", response.token)
        assertEquals("child@example.com", response.email)
    }

    @Test
    fun `register with invalid parentId throws ResourceNotFoundException`() {
        val fakeParentId = UUID.randomUUID()

        val request = RegisterRequest(
            email = "child@example.com",
            password = "password123",
            firstName = "Child",
            lastName = "User",
            role = UserRole.STUDENT,
            parentId = fakeParentId
        )

        whenever(userRepository.findByEmail(request.email)).thenReturn(null)
        whenever(userRepository.findById(fakeParentId)).thenReturn(Optional.empty())

        assertThrows<ResourceNotFoundException> {
            userService.register(request)
        }
    }
}
