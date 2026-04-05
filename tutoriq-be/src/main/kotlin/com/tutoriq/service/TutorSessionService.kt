package com.tutoriq.service

import com.tutoriq.exception.ResourceNotFoundException
import com.tutoriq.model.dto.*
import com.tutoriq.model.entity.MessageRole
import com.tutoriq.model.entity.TutorMessage
import com.tutoriq.model.entity.TutorSession
import com.tutoriq.repository.TutorMessageRepository
import com.tutoriq.repository.TutorSessionRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class TutorSessionService(
    private val tutorSessionRepository: TutorSessionRepository,
    private val tutorMessageRepository: TutorMessageRepository,
    private val trialGuardService: TrialGuardService,
    private val promptTemplateService: PromptTemplateService,
    private val claudeService: ClaudeService
) {

    fun startSession(userId: UUID, request: StartSessionRequest): StartSessionResponse {
        require(request.gradeLevel in 1..12) { "gradeLevel must be between 1 and 12" }

        val session = tutorSessionRepository.save(
            TutorSession(
                userId = userId,
                subject = request.subject,
                gradeLevel = request.gradeLevel
            )
        )

        return StartSessionResponse(
            sessionId = session.id,
            subject = session.subject,
            gradeLevel = session.gradeLevel,
            startedAt = session.startedAt
        )
    }

    fun sendMessage(userId: UUID, request: SendMessageRequest): TutorMessageResponse {
        val session = tutorSessionRepository.findByIdAndUserId(request.sessionId, userId)
            ?: throw ResourceNotFoundException("Session not found")

        trialGuardService.checkAndIncrementQuestion(userId)

        tutorMessageRepository.save(
            TutorMessage(
                sessionId = session.id,
                role = MessageRole.USER,
                content = request.message
            )
        )

        val recentMessages = tutorMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.id).takeLast(10)

        val systemPrompt = promptTemplateService.assembleSystemPrompt(
            session.subject, session.gradeLevel, recentMessages
        )

        val responseText = claudeService.sendTutorMessage(systemPrompt, request.message)

        val assistantMessage = tutorMessageRepository.save(
            TutorMessage(
                sessionId = session.id,
                role = MessageRole.ASSISTANT,
                content = responseText
            )
        )

        return TutorMessageResponse(
            messageId = assistantMessage.id,
            role = assistantMessage.role,
            content = assistantMessage.content,
            createdAt = assistantMessage.createdAt
        )
    }

    fun getSessionHistory(userId: UUID, sessionId: UUID): List<TutorMessageResponse> {
        tutorSessionRepository.findByIdAndUserId(sessionId, userId)
            ?: throw ResourceNotFoundException("Session not found")

        return tutorMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId).map {
            TutorMessageResponse(
                messageId = it.id,
                role = it.role,
                content = it.content,
                createdAt = it.createdAt
            )
        }
    }

    fun getUserSessions(userId: UUID): List<SessionSummaryResponse> {
        val sessions = tutorSessionRepository.findByUserId(userId)
        return sessions.map { session ->
            val messageCount = tutorMessageRepository.countBySessionId(session.id)
            SessionSummaryResponse(
                sessionId = session.id,
                subject = session.subject,
                gradeLevel = session.gradeLevel,
                startedAt = session.startedAt,
                messageCount = messageCount
            )
        }
    }
}
