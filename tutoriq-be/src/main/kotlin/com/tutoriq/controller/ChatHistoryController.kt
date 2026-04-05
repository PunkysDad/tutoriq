package com.tutoriq.controller

import com.tutoriq.model.dto.SavedSummaryResponse
import com.tutoriq.model.dto.SummarizeRequest
import com.tutoriq.model.dto.SummarizeResponse
import com.tutoriq.model.dto.TutorMessageResponse
import com.tutoriq.model.entity.User
import com.tutoriq.service.ChatHistoryService
import com.tutoriq.service.SummaryService
import jakarta.validation.Valid
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/v1/history")
class ChatHistoryController(
    private val chatHistoryService: ChatHistoryService,
    private val summaryService: SummaryService
) {

    @GetMapping("/messages")
    fun getAllUserMessages(@AuthenticationPrincipal user: User): List<TutorMessageResponse> =
        chatHistoryService.getAllUserMessages(user.id)

    @PostMapping("/summarize")
    fun summarizeMessages(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: SummarizeRequest
    ): SummarizeResponse = summaryService.summarizeMessages(user.id, request)

    @GetMapping("/summaries")
    fun getUserSummaries(@AuthenticationPrincipal user: User): List<SavedSummaryResponse> =
        summaryService.getUserSummaries(user.id)

    @GetMapping("/summaries/{summaryId}")
    fun getSummaryById(
        @AuthenticationPrincipal user: User,
        @PathVariable summaryId: UUID
    ): SavedSummaryResponse = summaryService.getSummaryById(user.id, summaryId)
}
