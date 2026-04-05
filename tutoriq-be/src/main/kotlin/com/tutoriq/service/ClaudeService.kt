package com.tutoriq.service

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient

@Service
class ClaudeService(
    @Value("\${anthropic.api-key}") private val apiKey: String,
    @Value("\${anthropic.model.tutor}") private val tutorModel: String,
    private val objectMapper: ObjectMapper,
    private val restClient: RestClient
) {

    companion object {
        const val API_URL = "https://api.anthropic.com/v1/messages"
        const val ANTHROPIC_VERSION = "2023-06-01"
        const val MAX_TOKENS = 1024

        val DIRECT_ANSWER_PHRASES = listOf(
            "The answer is", "Therefore the answer", "In conclusion",
            "To summarize", "Here is the essay", "Here is the paragraph"
        )

        const val FALLBACK_MESSAGE = "I'd love to help you work through this! Let's think about it together. What do you already know about this topic?"
    }

    fun sendTutorMessage(systemPrompt: String, userMessage: String): String {
        val requestBody = mapOf(
            "model" to tutorModel,
            "max_tokens" to MAX_TOKENS,
            "system" to systemPrompt,
            "messages" to listOf(mapOf("role" to "user", "content" to userMessage))
        )

        val responseJson = restClient.post()
            .uri(API_URL)
            .header("x-api-key", apiKey)
            .header("anthropic-version", ANTHROPIC_VERSION)
            .contentType(MediaType.APPLICATION_JSON)
            .body(objectMapper.writeValueAsString(requestBody))
            .retrieve()
            .body(JsonNode::class.java)!!

        val responseText = responseJson["content"][0]["text"].asText()
        return validateResponse(responseText)
    }

    private fun validateResponse(response: String): String {
        for (phrase in DIRECT_ANSWER_PHRASES) {
            if (response.contains(phrase, ignoreCase = true)) {
                return FALLBACK_MESSAGE
            }
        }

        if (containsWorkedSolution(response)) {
            return FALLBACK_MESSAGE
        }

        return response
    }

    internal fun containsWorkedSolution(response: String): Boolean {
        val lines = response.lines()

        // Check for numbered step-by-step solution (4+ sequential numbered steps)
        var expectedStep = 1
        for (line in lines) {
            val trimmed = line.trim()
            if (trimmed.startsWith("$expectedStep.")) {
                expectedStep++
                if (expectedStep > 4) return true
            } else if (trimmed.isNotEmpty()) {
                expectedStep = 1
            }
        }

        // Check for repeated mathematical equality patterns (3+ lines with "= <number>")
        val equalityPattern = Regex("""=\s*\d""")
        val equalityCount = lines.count { equalityPattern.containsMatchIn(it) }
        if (equalityCount >= 3) return true

        // Check for essay-like block: 5+ consecutive non-empty lines with no questions
        // and no guiding/encouraging language
        val guidingWords = listOf("think", "consider", "what", "how", "why", "try")
        var consecutiveStatementLines = 0
        for (line in lines) {
            val trimmed = line.trim()
            val lower = trimmed.lowercase()
            if (trimmed.isNotEmpty() && !trimmed.contains("?") &&
                guidingWords.none { lower.contains(it) }
            ) {
                consecutiveStatementLines++
                if (consecutiveStatementLines > 5) return true
            } else {
                consecutiveStatementLines = 0
            }
        }

        return false
    }
}
