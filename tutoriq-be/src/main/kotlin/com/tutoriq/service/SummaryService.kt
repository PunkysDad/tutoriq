package com.tutoriq.service

import com.tutoriq.exception.ResourceNotFoundException
import com.tutoriq.model.dto.SavedSummaryResponse
import com.tutoriq.model.dto.SummarizeRequest
import com.tutoriq.model.dto.SummarizeResponse
import com.tutoriq.model.entity.ChatSummary
import com.tutoriq.model.entity.MessageRole
import com.tutoriq.repository.ChatSummaryRepository
import com.tutoriq.repository.TutorMessageRepository
import com.tutoriq.repository.TutorSessionRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class SummaryService(
    private val chatSummaryRepository: ChatSummaryRepository,
    private val tutorMessageRepository: TutorMessageRepository,
    private val tutorSessionRepository: TutorSessionRepository,
    private val claudeService: ClaudeService
) {

    companion object {
        const val SUMMARY_SYSTEM_PROMPT = "You are a helpful study assistant. Your job is to review a student's tutoring session exchanges and produce a concise, clear summary of the key concepts, topics, and ideas covered. The summary should help the student review and retain what they worked on. Write in plain, student-friendly language. Be direct and informative — this is a study aid, not a tutoring session."
    }

    fun summarizeMessages(userId: UUID, request: SummarizeRequest): SummarizeResponse {
        val messages = request.messageIds.map { messageId ->
            tutorMessageRepository.findById(messageId)
                .orElseThrow { ResourceNotFoundException("Message not found: $messageId") }
        }

        // Verify all messages belong to sessions owned by this user
        val sessionIds = messages.map { it.sessionId }.distinct()
        for (sessionId in sessionIds) {
            tutorSessionRepository.findByIdAndUserId(sessionId, userId)
                ?: throw ResourceNotFoundException("Session not found or does not belong to user")
        }

        val sortedMessageIdString = request.messageIds.sorted().joinToString(",")

        // Check for cached summary
        val existingSummaries = chatSummaryRepository.findByUserId(userId)
        val cached = existingSummaries.find { it.messageIds == sortedMessageIdString }
        if (cached != null) {
            return SummarizeResponse(
                summaryId = cached.id,
                summaryText = cached.summaryText,
                messageCount = request.messageIds.size,
                createdAt = cached.createdAt
            )
        }

        // Assemble user message for summarization
        val userMessage = buildString {
            append("Please summarize the key concepts and topics from the following tutoring exchanges:\n\n")
            for (msg in messages) {
                val speaker = if (msg.role == MessageRole.USER) "Student" else "TutorIQ"
                appendLine("$speaker: ${msg.content}")
            }
        }

        val summaryText = claudeService.sendSummaryMessage(SUMMARY_SYSTEM_PROMPT, userMessage)

        val chatSummary = chatSummaryRepository.save(
            ChatSummary(
                userId = userId,
                summaryText = summaryText,
                messageIds = sortedMessageIdString
            )
        )

        return SummarizeResponse(
            summaryId = chatSummary.id,
            summaryText = chatSummary.summaryText,
            messageCount = request.messageIds.size,
            createdAt = chatSummary.createdAt
        )
    }

    fun getUserSummaries(userId: UUID): List<SavedSummaryResponse> =
        chatSummaryRepository.findByUserId(userId)
            .sortedByDescending { it.createdAt }
            .map { toSavedSummaryResponse(it) }

    fun getSummaryById(userId: UUID, summaryId: UUID): SavedSummaryResponse {
        val summary = chatSummaryRepository.findByIdAndUserId(summaryId, userId)
            ?: throw ResourceNotFoundException("Summary not found")
        return toSavedSummaryResponse(summary)
    }

    private fun toSavedSummaryResponse(summary: ChatSummary) = SavedSummaryResponse(
        summaryId = summary.id,
        summaryText = summary.summaryText,
        messageCount = summary.messageIds.split(",").filter { it.isNotBlank() }.size,
        createdAt = summary.createdAt
    )
}
