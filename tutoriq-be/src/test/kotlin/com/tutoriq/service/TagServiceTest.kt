package com.tutoriq.service

import com.tutoriq.exception.PremiumFeatureException
import com.tutoriq.exception.ResourceNotFoundException
import com.tutoriq.model.dto.ApplyTagRequest
import com.tutoriq.model.dto.CreateTagRequest
import com.tutoriq.model.entity.*
import com.tutoriq.repository.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.*
import java.util.Optional
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class TagServiceTest {

    @Mock lateinit var chatTagRepository: ChatTagRepository
    @Mock lateinit var chatTagLinkRepository: ChatTagLinkRepository
    @Mock lateinit var tutorMessageRepository: TutorMessageRepository
    @Mock lateinit var tutorSessionRepository: TutorSessionRepository
    @Mock lateinit var subscriptionRepository: SubscriptionRepository

    @InjectMocks lateinit var tagService: TagService

    private val userId = UUID.randomUUID()
    private val tagId = UUID.randomUUID()
    private val messageId = UUID.randomUUID()
    private val sessionId = UUID.randomUUID()

    private fun premiumSubscription() = Subscription(
        userId = userId,
        tier = SubscriptionTier.PREMIUM,
        status = SubscriptionStatus.ACTIVE,
        exchangeLimit = 1000
    )

    private fun basicSubscription() = Subscription(
        userId = userId,
        tier = SubscriptionTier.BASIC,
        status = SubscriptionStatus.ACTIVE,
        exchangeLimit = 500
    )

    private fun testTag(name: String = "Important") = ChatTag(
        id = tagId,
        userId = userId,
        name = name
    )

    private fun testMessage() = TutorMessage(
        id = messageId,
        sessionId = sessionId,
        role = MessageRole.USER,
        content = "What is 2+2?"
    )

    private fun testSession() = TutorSession(
        id = sessionId,
        userId = userId,
        subject = Subject.MATH,
        gradeLevel = 5
    )

    @Test
    fun `createTag succeeds for Premium user`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(chatTagRepository.findByUserId(userId)).thenReturn(emptyList())
        whenever(chatTagRepository.save(any<ChatTag>())).thenAnswer { it.arguments[0] }

        val response = tagService.createTag(userId, CreateTagRequest("Important"))

        assertEquals("Important", response.name)
        verify(chatTagRepository).save(any())
    }

    @Test
    fun `createTag throws PremiumFeatureException for non-Premium user`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(basicSubscription())

        assertThrows<PremiumFeatureException> {
            tagService.createTag(userId, CreateTagRequest("Important"))
        }
    }

    @Test
    fun `createTag throws IllegalArgumentException for duplicate tag name case-insensitive`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(chatTagRepository.findByUserId(userId)).thenReturn(listOf(testTag("Important")))

        assertThrows<IllegalArgumentException> {
            tagService.createTag(userId, CreateTagRequest("important"))
        }
    }

    @Test
    fun `getUserTags returns all tags for Premium user`() {
        val tags = listOf(testTag("Beta"), testTag("Alpha"))
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(chatTagRepository.findByUserId(userId)).thenReturn(tags)

        val result = tagService.getUserTags(userId)

        assertEquals(2, result.size)
        assertEquals("Alpha", result[0].name)
        assertEquals("Beta", result[1].name)
    }

    @Test
    fun `getUserTags throws PremiumFeatureException for non-Premium user`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(basicSubscription())

        assertThrows<PremiumFeatureException> {
            tagService.getUserTags(userId)
        }
    }

    @Test
    fun `deleteTag deletes links before deleting tag`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(chatTagRepository.findByIdAndUserId(tagId, userId)).thenReturn(testTag())

        tagService.deleteTag(userId, tagId)

        val inOrder = inOrder(chatTagLinkRepository, chatTagRepository)
        inOrder.verify(chatTagLinkRepository).deleteByTagId(tagId)
        inOrder.verify(chatTagRepository).deleteById(tagId)
    }

    @Test
    fun `deleteTag throws ResourceNotFoundException for tag not owned by user`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(chatTagRepository.findByIdAndUserId(tagId, userId)).thenReturn(null)

        assertThrows<ResourceNotFoundException> {
            tagService.deleteTag(userId, tagId)
        }
    }

    @Test
    fun `applyTagToMessage saves new link and returns TaggedMessageResponse`() {
        val tag = testTag()
        val message = testMessage()
        val session = testSession()

        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(chatTagRepository.findByIdAndUserId(tagId, userId)).thenReturn(tag)
        whenever(tutorMessageRepository.findById(messageId)).thenReturn(Optional.of(message))
        whenever(tutorSessionRepository.findByIdAndUserId(sessionId, userId)).thenReturn(session)
        whenever(chatTagLinkRepository.findByMessageIdAndTagId(messageId, tagId)).thenReturn(null)
        whenever(chatTagLinkRepository.save(any<ChatTagLink>())).thenAnswer { it.arguments[0] }
        whenever(chatTagLinkRepository.findByMessageId(messageId)).thenReturn(
            listOf(ChatTagLink(messageId = messageId, tagId = tagId))
        )
        whenever(chatTagRepository.findById(tagId)).thenReturn(Optional.of(tag))

        val response = tagService.applyTagToMessage(userId, messageId, ApplyTagRequest(tagId))

        assertEquals(messageId, response.messageId)
        assertEquals(1, response.tags.size)
        assertEquals("Important", response.tags[0].name)
        verify(chatTagLinkRepository).save(any())
    }

    @Test
    fun `applyTagToMessage returns existing response without duplicate when tag already applied`() {
        val tag = testTag()
        val message = testMessage()
        val session = testSession()
        val existingLink = ChatTagLink(messageId = messageId, tagId = tagId)

        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(chatTagRepository.findByIdAndUserId(tagId, userId)).thenReturn(tag)
        whenever(tutorMessageRepository.findById(messageId)).thenReturn(Optional.of(message))
        whenever(tutorSessionRepository.findByIdAndUserId(sessionId, userId)).thenReturn(session)
        whenever(chatTagLinkRepository.findByMessageIdAndTagId(messageId, tagId)).thenReturn(existingLink)
        whenever(chatTagLinkRepository.findByMessageId(messageId)).thenReturn(listOf(existingLink))
        whenever(chatTagRepository.findById(tagId)).thenReturn(Optional.of(tag))

        val response = tagService.applyTagToMessage(userId, messageId, ApplyTagRequest(tagId))

        assertEquals(messageId, response.messageId)
        verify(chatTagLinkRepository, never()).save(any())
    }

    @Test
    fun `applyTagToMessage throws ResourceNotFoundException when message session not owned by user`() {
        val tag = testTag()
        val message = testMessage()

        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(chatTagRepository.findByIdAndUserId(tagId, userId)).thenReturn(tag)
        whenever(tutorMessageRepository.findById(messageId)).thenReturn(Optional.of(message))
        whenever(tutorSessionRepository.findByIdAndUserId(sessionId, userId)).thenReturn(null)

        assertThrows<ResourceNotFoundException> {
            tagService.applyTagToMessage(userId, messageId, ApplyTagRequest(tagId))
        }
    }

    @Test
    fun `getMessagesByTag returns messages with all their tags for valid Premium user`() {
        val tag = testTag()
        val message = testMessage()
        val link = ChatTagLink(messageId = messageId, tagId = tagId)

        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(chatTagRepository.findByIdAndUserId(tagId, userId)).thenReturn(tag)
        whenever(chatTagLinkRepository.findByTagId(tagId)).thenReturn(listOf(link))
        whenever(tutorMessageRepository.findById(messageId)).thenReturn(Optional.of(message))
        whenever(chatTagLinkRepository.findByMessageId(messageId)).thenReturn(listOf(link))
        whenever(chatTagRepository.findById(tagId)).thenReturn(Optional.of(tag))

        val result = tagService.getMessagesByTag(userId, tagId)

        assertEquals(1, result.size)
        assertEquals(messageId, result[0].messageId)
        assertEquals(1, result[0].tags.size)
    }

    @Test
    fun `removeTagFromMessage calls deleteByMessageIdAndTagId`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(chatTagRepository.findByIdAndUserId(tagId, userId)).thenReturn(testTag())

        tagService.removeTagFromMessage(userId, messageId, tagId)

        verify(chatTagLinkRepository).deleteByMessageIdAndTagId(messageId, tagId)
    }
}
