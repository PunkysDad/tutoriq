package com.tutoriq.service

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.http.MediaType
import org.springframework.web.client.RestClient
import org.springframework.web.client.RestClient.*

@ExtendWith(MockitoExtension::class)
class ClaudeServiceTest {

    @Mock lateinit var restClient: RestClient
    @Mock lateinit var requestBodyUriSpec: RequestBodyUriSpec
    @Mock lateinit var requestBodySpec: RequestBodySpec
    @Mock lateinit var responseSpec: ResponseSpec

    private val objectMapper = ObjectMapper()
    private lateinit var claudeService: ClaudeService

    @BeforeEach
    fun setUp() {
        claudeService = ClaudeService(
            apiKey = "test-api-key",
            tutorModel = "claude-sonnet-4-20250514",
            summaryModel = "claude-haiku-4-5-20251001",
            objectMapper = objectMapper,
            restClient = restClient
        )
    }

    private fun mockClaudeResponse(text: String) {
        val json = objectMapper.readTree("""
            {"content": [{"text": ${objectMapper.writeValueAsString(text)}}]}
        """.trimIndent())

        whenever(restClient.post()).thenReturn(requestBodyUriSpec)
        whenever(requestBodyUriSpec.uri(any<String>())).thenReturn(requestBodySpec)
        whenever(requestBodySpec.header(any(), any())).thenReturn(requestBodySpec)
        whenever(requestBodySpec.contentType(any<MediaType>())).thenReturn(requestBodySpec)
        whenever(requestBodySpec.body(any<String>())).thenReturn(requestBodySpec)
        whenever(requestBodySpec.retrieve()).thenReturn(responseSpec)
        whenever(responseSpec.body(JsonNode::class.java)).thenReturn(json)
    }

    @Test
    fun `sendTutorMessage returns Claude response text on success`() {
        val response = "Great question! What do you think happens when you add these numbers?"
        mockClaudeResponse(response)

        val result = claudeService.sendTutorMessage("system prompt", "What is 2+2?")

        assertEquals(response, result)
    }

    @Test
    fun `sendTutorMessage returns fallback when response contains The answer is`() {
        mockClaudeResponse("The answer is 42. That's the result of this calculation.")

        val result = claudeService.sendTutorMessage("system prompt", "What is 6 times 7?")

        assertEquals(ClaudeService.FALLBACK_MESSAGE, result)
    }

    @Test
    fun `sendTutorMessage returns fallback when response contains Here is the essay`() {
        mockClaudeResponse("Here is the essay you requested about the Civil War.")

        val result = claudeService.sendTutorMessage("system prompt", "Write me an essay")

        assertEquals(ClaudeService.FALLBACK_MESSAGE, result)
    }

    @Test
    fun `containsWorkedSolution returns false for normal Socratic response with guiding language`() {
        val response = """
            Great effort so far!
            Let's think about what happens when you multiply.
            What do you notice about the numbers?
            How might you break this into smaller parts?
            Consider what you already know about addition.
            Why do you think that approach works?
            Try working through the first step on your own.
        """.trimIndent()

        assertFalse(claudeService.containsWorkedSolution(response))
    }

    @Test
    fun `containsWorkedSolution returns true for numbered step-by-step solution`() {
        val response = """
            Here's how to solve it:
            1. First, multiply 6 by 7
            2. That gives you 42
            3. Then add 8 to get 50
            4. Finally, divide by 2 to get 25
        """.trimIndent()

        assertTrue(claudeService.containsWorkedSolution(response))
    }
}
