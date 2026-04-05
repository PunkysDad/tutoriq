package com.tutoriq.service

import com.tutoriq.exception.EmailAlreadyExistsException
import com.tutoriq.exception.InvalidCredentialsException
import com.tutoriq.exception.ResourceNotFoundException
import com.tutoriq.model.dto.AuthResponse
import com.tutoriq.model.dto.LoginRequest
import com.tutoriq.model.dto.RegisterRequest
import com.tutoriq.model.entity.User
import com.tutoriq.model.entity.UserRole
import com.tutoriq.repository.UserRepository
import com.tutoriq.security.JwtTokenProvider
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {

    fun register(request: RegisterRequest): AuthResponse {
        if (userRepository.findByEmail(request.email) != null) {
            throw EmailAlreadyExistsException("Email ${request.email} is already registered")
        }

        val resolvedParentId = if (request.parentId != null) {
            val parent = userRepository.findById(request.parentId).orElseThrow {
                ResourceNotFoundException("Parent user not found")
            }
            if (parent.role != UserRole.PARENT) {
                throw ResourceNotFoundException("Parent user not found")
            }
            request.parentId
        } else null

        val user = userRepository.save(
            User(
                email = request.email,
                passwordHash = passwordEncoder.encode(request.password),
                firstName = request.firstName,
                lastName = request.lastName,
                gradeLevel = request.gradeLevel,
                role = request.role,
                parentId = resolvedParentId
            )
        )

        return toAuthResponse(user)
    }

    fun login(request: LoginRequest): AuthResponse {
        val user = userRepository.findByEmail(request.email)
            ?: throw InvalidCredentialsException("Invalid email or password")

        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            throw InvalidCredentialsException("Invalid email or password")
        }

        return toAuthResponse(user)
    }

    fun getUserById(id: UUID): User =
        userRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("User not found with id $id") }

    private fun toAuthResponse(user: User): AuthResponse =
        AuthResponse(
            token = jwtTokenProvider.generateToken(user),
            userId = user.id,
            email = user.email,
            firstName = user.firstName ?: "",
            lastName = user.lastName ?: "",
            role = user.role
        )
}
