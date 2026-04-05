package com.tutoriq.service

import com.tutoriq.exception.ResourceNotFoundException
import com.tutoriq.model.dto.TutorMessageResponse
import com.tutoriq.repository.TutorMessageRepository
import com.tutoriq.repository.TutorSessionRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ChatHistoryService(
    private val tutorSessionRepository: TutorSessionRepository,
    private val tutorMessageRepository: TutorMessageRepository
) {

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

    fun getAllUserMessages(userId: UUID): List<TutorMessageResponse> {
        val sessions = tutorSessionRepository.findByUserId(userId)
        if (sessions.isEmpty()) return emptyList()

        val sessionIds = sessions.map { it.id }
        return tutorMessageRepository.findBySessionIdInOrderByCreatedAtAsc(sessionIds).map {
            TutorMessageResponse(
                messageId = it.id,
                role = it.role,
                content = it.content,
                createdAt = it.createdAt
            )
        }
    }
}
