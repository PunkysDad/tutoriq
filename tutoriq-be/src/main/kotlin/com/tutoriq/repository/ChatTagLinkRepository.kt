package com.tutoriq.repository

import com.tutoriq.model.entity.ChatTagLink
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ChatTagLinkRepository : JpaRepository<ChatTagLink, UUID> {
    fun findByTagId(tagId: UUID): List<ChatTagLink>
    fun findByMessageId(messageId: UUID): List<ChatTagLink>
    fun findByMessageIdAndTagId(messageId: UUID, tagId: UUID): ChatTagLink?
    fun deleteByTagId(tagId: UUID)
    fun deleteByMessageIdAndTagId(messageId: UUID, tagId: UUID)
}
