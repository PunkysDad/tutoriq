package com.tutoriq.service

import com.tutoriq.exception.ResourceNotFoundException
import com.tutoriq.model.dto.SendMessageRequest
import com.tutoriq.model.dto.StartSessionRequest
import com.tutoriq.model.dto.TutorMessageResponse
import com.tutoriq.model.entity.*
import com.tutoriq.repository.TutorMessageRepository
import com.tutoriq.repository.TutorSessionRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.*
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class TutorSessionServiceTest {

    @Mock lateinit var tutorSessionRepository: TutorSessionRepository
    @Mock lateinit var tutorMessageRepository: TutorMessageRepository
    @Mock lateinit var trialGuardService: TrialGuardService
    @Mock lateinit var promptTemplateService: PromptTemplateService
    @Mock lateinit var claudeService: ClaudeService
    @Mock lateinit var chatHistoryService: ChatHistoryService

    @InjectMocks lateinit var tutorSessionService: TutorSessionService

    private val userId = UUID.randomUUID()
    private val sessionId = UUID.randomUUID()

    private fun testSession() = TutorSession(
        id = sessionId,
        userId = userId,
        subject = Subject.MATH,
        gradeLevel = 5
    )

    @Test
    fun `startSession creates and returns a new session`() {
        val request = StartSessionRequest(subject = Subject.MATH, gradeLevel = 5)
        whenever(tutorSessionRepository.save(any<TutorSession>())).thenAnswer { it.arguments[0] }

        val response = tutorSessionService.startSession(userId, request)

        assertEquals(Subject.MATH, response.subject)
        assertEquals(5, response.gradeLevel)
        verify(tutorSessionRepository).save(any())
    }

    @Test
    fun `startSession throws IllegalArgumentException for gradeLevel 0`() {
        val request = StartSessionRequest(subject = Subject.MATH, gradeLevel = 0)

        assertThrows<IllegalArgumentException> {
            tutorSessionService.startSession(userId, request)
        }
    }

    @Test
    fun `startSession throws IllegalArgumentException for gradeLevel 13`() {
        val request = StartSessionRequest(subject = Subject.MATH, gradeLevel = 13)

        assertThrows<IllegalArgumentException> {
            tutorSessionService.startSession(userId, request)
        }
    }

    @Test
    fun `sendMessage saves USER and ASSISTANT messages and returns assistant response`() {
        val session = testSession()
        val request = SendMessageRequest(sessionId = sessionId, message = "What is 2+2?")

        whenever(tutorSessionRepository.findByIdAndUserId(sessionId, userId)).thenReturn(session)
        whenever(tutorMessageRepository.save(any<TutorMessage>())).thenAnswer { it.arguments[0] }
        whenever(tutorMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)).thenReturn(emptyList())
        whenever(promptTemplateService.assembleSystemPrompt(any(), any(), any())).thenReturn("system prompt")
        whenever(claudeService.sendTutorMessage(any(), any())).thenReturn("What do you think?")

        val response = tutorSessionService.sendMessage(userId, request)

        assertEquals(MessageRole.ASSISTANT, response.role)
        assertEquals("What do you think?", response.content)
        verify(tutorMessageRepository, times(2)).save(any())
    }

    @Test
    fun `sendMessage throws ResourceNotFoundException when session not found`() {
        val request = SendMessageRequest(sessionId = sessionId, message = "Hello")

        whenever(tutorSessionRepository.findByIdAndUserId(sessionId, userId)).thenReturn(null)

        assertThrows<ResourceNotFoundException> {
            tutorSessionService.sendMessage(userId, request)
        }
    }

    @Test
    fun `sendMessage calls checkAndIncrementQuestion before calling ClaudeService`() {
        val session = testSession()
        val request = SendMessageRequest(sessionId = sessionId, message = "Help me")

        whenever(tutorSessionRepository.findByIdAndUserId(sessionId, userId)).thenReturn(session)
        whenever(tutorMessageRepository.save(any<TutorMessage>())).thenAnswer { it.arguments[0] }
        whenever(tutorMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)).thenReturn(emptyList())
        whenever(promptTemplateService.assembleSystemPrompt(any(), any(), any())).thenReturn("prompt")
        whenever(claudeService.sendTutorMessage(any(), any())).thenReturn("Let's think about it?")

        tutorSessionService.sendMessage(userId, request)

        val inOrder = inOrder(trialGuardService, claudeService)
        inOrder.verify(trialGuardService).checkAndIncrementQuestion(userId)
        inOrder.verify(claudeService).sendTutorMessage(any(), any())
    }

    @Test
    fun `getSessionHistory delegates to chatHistoryService`() {
        val expected = listOf(
            TutorMessageResponse(
                messageId = UUID.randomUUID(),
                role = MessageRole.USER,
                content = "Hi",
                createdAt = java.time.LocalDateTime.now()
            )
        )
        whenever(chatHistoryService.getSessionHistory(userId, sessionId)).thenReturn(expected)

        val result = tutorSessionService.getSessionHistory(userId, sessionId)

        assertEquals(expected, result)
        verify(chatHistoryService).getSessionHistory(userId, sessionId)
    }

    @Test
    fun `getUserSessions uses countBySessionId instead of loading all messages`() {
        val session = testSession()
        whenever(tutorSessionRepository.findByUserId(userId)).thenReturn(listOf(session))
        whenever(tutorMessageRepository.countBySessionId(session.id)).thenReturn(5)

        val result = tutorSessionService.getUserSessions(userId)

        assertEquals(1, result.size)
        assertEquals(5, result[0].messageCount)
        verify(tutorMessageRepository).countBySessionId(session.id)
        verify(tutorMessageRepository, never()).findBySessionIdOrderByCreatedAtAsc(any())
    }
}
