package com.tutoriq.repository

import com.tutoriq.model.entity.ChatSummary
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ChatSummaryRepository : JpaRepository<ChatSummary, UUID> {
    fun findByUserId(userId: UUID): List<ChatSummary>
    fun findByIdAndUserId(id: UUID, userId: UUID): ChatSummary?
}
