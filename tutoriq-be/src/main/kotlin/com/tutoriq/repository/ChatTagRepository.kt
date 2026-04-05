package com.tutoriq.repository

import com.tutoriq.model.entity.ChatTag
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ChatTagRepository : JpaRepository<ChatTag, UUID> {
    fun findByUserId(userId: UUID): List<ChatTag>
    fun findByIdAndUserId(id: UUID, userId: UUID): ChatTag?
    fun existsByUserIdAndName(userId: UUID, name: String): Boolean
}
