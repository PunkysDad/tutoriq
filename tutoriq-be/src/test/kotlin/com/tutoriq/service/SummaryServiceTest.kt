package com.tutoriq.service

import com.tutoriq.model.dto.SummarizeRequest
import com.tutoriq.model.entity.ChatSummary
import com.tutoriq.model.entity.MessageRole
import com.tutoriq.model.entity.TutorMessage
import com.tutoriq.model.entity.TutorSession
import com.tutoriq.model.entity.Subject
import com.tutoriq.repository.ChatSummaryRepository
import com.tutoriq.repository.TutorMessageRepository
import com.tutoriq.repository.TutorSessionRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.Optional
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class SummaryServiceTest {

    @Mock lateinit var chatSummaryRepository: ChatSummaryRepository
    @Mock lateinit var tutorMessageRepository: TutorMessageRepository
    @Mock lateinit var tutorSessionRepository: TutorSessionRepository
    @Mock lateinit var claudeService: ClaudeService

    @InjectMocks lateinit var summaryService: SummaryService

    private val userId = UUID.randomUUID()
    private val sessionId = UUID.randomUUID()
    private val msgId1 = UUID.randomUUID()
    private val msgId2 = UUID.randomUUID()

    private fun testSession() = TutorSession(
        id = sessionId,
        userId = userId,
        subject = Subject.MATH,
        gradeLevel = 5
    )

    private fun testMessage(id: UUID, role: MessageRole, content: String) = TutorMessage(
        id = id,
        sessionId = sessionId,
        role = role,
        content = content
    )

    @Test
    fun `summarizeMessages returns cached summary when one exists for same messageIds`() {
        val sortedIds = listOf(msgId1, msgId2).sorted().joinToString(",")
        val cached = ChatSummary(
            userId = userId,
            summaryText = "Cached summary of math concepts",
            messageIds = sortedIds
        )

        whenever(tutorMessageRepository.findById(msgId1))
            .thenReturn(Optional.of(testMessage(msgId1, MessageRole.USER, "What is 2+2?")))
        whenever(tutorMessageRepository.findById(msgId2))
            .thenReturn(Optional.of(testMessage(msgId2, MessageRole.ASSISTANT, "What do you think?")))
        whenever(tutorSessionRepository.findByIdAndUserId(sessionId, userId)).thenReturn(testSession())
        whenever(chatSummaryRepository.findByUserId(userId)).thenReturn(listOf(cached))

        val request = SummarizeRequest(messageIds = listOf(msgId1, msgId2))
        val response = summaryService.summarizeMessages(userId, request)

        assertEquals("Cached summary of math concepts", response.summaryText)
        assertEquals(2, response.messageCount)
        verify(claudeService, never()).sendSummaryMessage(any(), any())
    }
}
