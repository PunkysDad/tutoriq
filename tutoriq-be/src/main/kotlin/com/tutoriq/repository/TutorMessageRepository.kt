package com.tutoriq.repository

import com.tutoriq.model.entity.TutorMessage
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface TutorMessageRepository : JpaRepository<TutorMessage, UUID> {
    fun findBySessionIdOrderByCreatedAtAsc(sessionId: UUID): List<TutorMessage>
    fun countBySessionId(sessionId: UUID): Int
    fun findBySessionIdInOrderByCreatedAtAsc(sessionIds: List<UUID>): List<TutorMessage>
}
