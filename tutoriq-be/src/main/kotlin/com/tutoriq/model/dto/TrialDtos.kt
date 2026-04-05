package com.tutoriq.model.dto

import com.tutoriq.model.entity.SubscriptionTier
import java.util.UUID

data class TrialStatusResponse(
    val userId: UUID,
    val tier: SubscriptionTier,
    val questionCount: Int,
    val questionLimit: Int,
    val flashcardSetsCreated: Int,
    val flashcardSetLimit: Int,
    val trialExhausted: Boolean
)
