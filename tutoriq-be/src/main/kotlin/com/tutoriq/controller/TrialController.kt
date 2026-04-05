package com.tutoriq.controller

import com.tutoriq.model.dto.TrialStatusResponse
import com.tutoriq.model.entity.User
import com.tutoriq.service.TrialGuardService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/trial")
class TrialController(private val trialGuardService: TrialGuardService) {

    @GetMapping("/status")
    fun getTrialStatus(@AuthenticationPrincipal user: User): TrialStatusResponse =
        trialGuardService.getTrialStatus(user.id)
}
