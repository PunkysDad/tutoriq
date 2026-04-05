package com.tutoriq.service

import com.tutoriq.exception.PremiumFeatureException
import com.tutoriq.exception.ResourceNotFoundException
import com.tutoriq.model.dto.*
import com.tutoriq.model.entity.ChatTag
import com.tutoriq.model.entity.ChatTagLink
import com.tutoriq.model.entity.SubscriptionStatus
import com.tutoriq.model.entity.SubscriptionTier
import com.tutoriq.model.entity.TutorMessage
import com.tutoriq.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class TagService(
    private val chatTagRepository: ChatTagRepository,
    private val chatTagLinkRepository: ChatTagLinkRepository,
    private val tutorMessageRepository: TutorMessageRepository,
    private val tutorSessionRepository: TutorSessionRepository,
    private val subscriptionRepository: SubscriptionRepository
) {

    fun createTag(userId: UUID, request: CreateTagRequest): TagResponse {
        verifyPremiumAccess(userId)

        val existingTags = chatTagRepository.findByUserId(userId)
        if (existingTags.any { it.name.equals(request.name, ignoreCase = true) }) {
            throw IllegalArgumentException("Tag name already exists")
        }

        val tag = chatTagRepository.save(ChatTag(userId = userId, name = request.name))
        return TagResponse(tagId = tag.id, name = tag.name, createdAt = tag.createdAt)
    }

    fun getUserTags(userId: UUID): List<TagResponse> {
        verifyPremiumAccess(userId)

        return chatTagRepository.findByUserId(userId)
            .sortedBy { it.name.lowercase() }
            .map { TagResponse(tagId = it.id, name = it.name, createdAt = it.createdAt) }
    }

    @Transactional
    fun deleteTag(userId: UUID, tagId: UUID) {
        verifyPremiumAccess(userId)

        chatTagRepository.findByIdAndUserId(tagId, userId)
            ?: throw ResourceNotFoundException("Tag not found")

        chatTagLinkRepository.deleteByTagId(tagId)
        chatTagRepository.deleteById(tagId)
    }

    fun applyTagToMessage(userId: UUID, messageId: UUID, request: ApplyTagRequest): TaggedMessageResponse {
        verifyPremiumAccess(userId)

        chatTagRepository.findByIdAndUserId(request.tagId, userId)
            ?: throw ResourceNotFoundException("Tag not found")

        val message = tutorMessageRepository.findById(messageId)
            .orElseThrow { ResourceNotFoundException("Message not found") }

        tutorSessionRepository.findByIdAndUserId(message.sessionId, userId)
            ?: throw ResourceNotFoundException("Message does not belong to user")

        val existingLink = chatTagLinkRepository.findByMessageIdAndTagId(messageId, request.tagId)
        if (existingLink == null) {
            chatTagLinkRepository.save(ChatTagLink(messageId = messageId, tagId = request.tagId))
        }

        return buildTaggedMessageResponse(message)
    }

    @Transactional
    fun removeTagFromMessage(userId: UUID, messageId: UUID, tagId: UUID) {
        verifyPremiumAccess(userId)

        chatTagRepository.findByIdAndUserId(tagId, userId)
            ?: throw ResourceNotFoundException("Tag not found")

        chatTagLinkRepository.deleteByMessageIdAndTagId(messageId, tagId)
    }

    fun getMessagesByTag(userId: UUID, tagId: UUID): List<TaggedMessageResponse> {
        verifyPremiumAccess(userId)

        chatTagRepository.findByIdAndUserId(tagId, userId)
            ?: throw ResourceNotFoundException("Tag not found")

        val links = chatTagLinkRepository.findByTagId(tagId)
        val messages = links.mapNotNull { link ->
            tutorMessageRepository.findById(link.messageId).orElse(null)
        }

        return messages
            .sortedBy { it.createdAt }
            .map { buildTaggedMessageResponse(it) }
    }

    private fun buildTaggedMessageResponse(message: TutorMessage): TaggedMessageResponse {
        val links = chatTagLinkRepository.findByMessageId(message.id)
        val tags = links.mapNotNull { link ->
            chatTagRepository.findById(link.tagId).orElse(null)
        }.map { TagResponse(tagId = it.id, name = it.name, createdAt = it.createdAt) }

        return TaggedMessageResponse(
            messageId = message.id,
            sessionId = message.sessionId,
            role = message.role,
            content = message.content,
            createdAt = message.createdAt,
            tags = tags
        )
    }

    private fun verifyPremiumAccess(userId: UUID) {
        val subscription = subscriptionRepository.findByUserId(userId)
        if (subscription == null || subscription.tier != SubscriptionTier.PREMIUM || subscription.status != SubscriptionStatus.ACTIVE) {
            throw PremiumFeatureException()
        }
    }
}
