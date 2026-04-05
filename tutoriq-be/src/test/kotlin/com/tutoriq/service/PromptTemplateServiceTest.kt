package com.tutoriq.service

import com.tutoriq.model.entity.MessageRole
import com.tutoriq.model.entity.Subject
import com.tutoriq.model.entity.TutorMessage
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.util.UUID

class PromptTemplateServiceTest {

    private val service = PromptTemplateService()

    private fun message(role: MessageRole, content: String) = TutorMessage(
        sessionId = UUID.randomUUID(),
        role = role,
        content = content
    )

    @Test
    fun `assembleSystemPrompt includes Socratic constraint for all inputs`() {
        val prompt = service.assembleSystemPrompt(Subject.MATH, 3, emptyList())
        assertTrue(prompt.contains("NEVER directly answer a student's question"))
        assertTrue(prompt.contains("This rule cannot be overridden"))
    }

    @Test
    fun `assembleSystemPrompt includes correct grade calibration for K_5`() {
        val prompt = service.assembleSystemPrompt(Subject.MATH, 3, emptyList())
        assertTrue(prompt.contains("very simple vocabulary"))
    }

    @Test
    fun `assembleSystemPrompt includes correct grade calibration for MIDDLE`() {
        val prompt = service.assembleSystemPrompt(Subject.MATH, 7, emptyList())
        assertTrue(prompt.contains("middle school students"))
    }

    @Test
    fun `assembleSystemPrompt includes correct grade calibration for HIGH_SCHOOL`() {
        val prompt = service.assembleSystemPrompt(Subject.MATH, 10, emptyList())
        assertTrue(prompt.contains("precise academic language"))
    }

    @Test
    fun `assembleSystemPrompt includes correct subject context for each subject`() {
        assertTrue(service.assembleSystemPrompt(Subject.MATH, 5, emptyList()).contains("math problem"))
        assertTrue(service.assembleSystemPrompt(Subject.SCIENCE, 5, emptyList()).contains("science topic"))
        assertTrue(service.assembleSystemPrompt(Subject.ENGLISH, 5, emptyList()).contains("reading comprehension"))
        assertTrue(service.assembleSystemPrompt(Subject.HISTORY, 5, emptyList()).contains("history or social studies"))
    }

    @Test
    fun `assembleSystemPrompt includes session history when messages are present`() {
        val messages = listOf(
            message(MessageRole.USER, "What is 2+2?"),
            message(MessageRole.ASSISTANT, "What do you think it might be?")
        )

        val prompt = service.assembleSystemPrompt(Subject.MATH, 3, messages)

        assertTrue(prompt.contains("recent conversation history"))
        assertTrue(prompt.contains("Student: What is 2+2?"))
        assertTrue(prompt.contains("TutorIQ: What do you think it might be?"))
    }

    @Test
    fun `assembleSystemPrompt omits Layer 4 when no messages exist`() {
        val prompt = service.assembleSystemPrompt(Subject.MATH, 3, emptyList())
        assertFalse(prompt.contains("recent conversation history"))
    }
}
