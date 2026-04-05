package com.tutoriq.controller

import com.tutoriq.model.dto.ChildActivityResponse
import com.tutoriq.model.dto.ChildSessionResponse
import com.tutoriq.model.dto.ChildSummaryResponse
import com.tutoriq.model.entity.User
import com.tutoriq.service.ParentPortalService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1/parent")
class ParentPortalController(private val parentPortalService: ParentPortalService) {

    @GetMapping("/children")
    fun getChildren(@AuthenticationPrincipal user: User): List<ChildSummaryResponse> =
        parentPortalService.getChildren(user.id)

    @GetMapping("/children/{childId}")
    fun getChildActivity(
        @AuthenticationPrincipal user: User,
        @PathVariable childId: UUID
    ): ChildActivityResponse = parentPortalService.getChildActivity(user.id, childId)

    @GetMapping("/children/{childId}/sessions")
    fun getChildSessions(
        @AuthenticationPrincipal user: User,
        @PathVariable childId: UUID
    ): List<ChildSessionResponse> = parentPortalService.getChildSessions(user.id, childId)
}
