package com.tutoriq.controller

import com.tutoriq.model.dto.ProgressDashboardResponse
import com.tutoriq.model.dto.StreakResponse
import com.tutoriq.model.dto.SubjectProgressResponse
import com.tutoriq.model.entity.Subject
import com.tutoriq.model.entity.User
import com.tutoriq.service.ProgressService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/progress")
class ProgressController(private val progressService: ProgressService) {

    @GetMapping("/dashboard")
    fun getDashboard(@AuthenticationPrincipal user: User): ProgressDashboardResponse =
        progressService.getDashboard(user.id)

    @GetMapping("/subjects/{subject}")
    fun getSubjectProgress(
        @AuthenticationPrincipal user: User,
        @PathVariable subject: Subject
    ): SubjectProgressResponse = progressService.getSubjectProgress(user.id, subject)

    @GetMapping("/streak")
    fun getStreak(@AuthenticationPrincipal user: User): StreakResponse =
        progressService.getStreak(user.id)
}
