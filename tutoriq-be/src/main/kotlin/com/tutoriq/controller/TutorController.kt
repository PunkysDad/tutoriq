package com.tutoriq.controller

import com.tutoriq.model.dto.*
import com.tutoriq.model.entity.User
import com.tutoriq.service.TutorSessionService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/v1/tutor")
class TutorController(private val tutorSessionService: TutorSessionService) {

    @PostMapping("/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    fun startSession(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: StartSessionRequest
    ): StartSessionResponse = tutorSessionService.startSession(user.id, request)

    @PostMapping("/message")
    fun sendMessage(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: SendMessageRequest
    ): TutorMessageResponse = tutorSessionService.sendMessage(user.id, request)

    @GetMapping("/sessions")
    fun getUserSessions(@AuthenticationPrincipal user: User): List<SessionSummaryResponse> =
        tutorSessionService.getUserSessions(user.id)

    @GetMapping("/sessions/{sessionId}/history")
    fun getSessionHistory(
        @AuthenticationPrincipal user: User,
        @PathVariable sessionId: UUID
    ): List<TutorMessageResponse> = tutorSessionService.getSessionHistory(user.id, sessionId)
}
