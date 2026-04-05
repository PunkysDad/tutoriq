package com.tutoriq.service

import com.tutoriq.exception.ExchangeLimitExceededException
import com.tutoriq.exception.FlashcardAccessDeniedException
import com.tutoriq.exception.ResourceNotFoundException
import com.tutoriq.exception.TrialLimitExceededException
import com.tutoriq.model.dto.TrialStatusResponse
import com.tutoriq.model.entity.SubscriptionTier
import com.tutoriq.model.entity.TrialUsage
import com.tutoriq.repository.SubscriptionRepository
import com.tutoriq.repository.TrialUsageRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class TrialGuardService(
    private val subscriptionRepository: SubscriptionRepository,
    private val trialUsageRepository: TrialUsageRepository
) {

    companion object {
        const val FREE_TRIAL_QUESTION_LIMIT = 4
        const val FREE_TRIAL_FLASHCARD_SET_LIMIT = 1
    }

    fun getOrCreateTrialUsage(userId: UUID): TrialUsage =
        trialUsageRepository.findByUserId(userId)
            ?: trialUsageRepository.save(TrialUsage(userId = userId))

    fun getTrialStatus(userId: UUID): TrialStatusResponse {
        val subscription = subscriptionRepository.findByUserId(userId)
            ?: throw ResourceNotFoundException("Subscription not found for user $userId")
        val trialUsage = getOrCreateTrialUsage(userId)

        val questionLimit: Int
        val flashcardSetLimit: Int
        val trialExhausted: Boolean

        when (subscription.tier) {
            SubscriptionTier.FREE_TRIAL -> {
                questionLimit = FREE_TRIAL_QUESTION_LIMIT
                flashcardSetLimit = FREE_TRIAL_FLASHCARD_SET_LIMIT
                trialExhausted = trialUsage.questionCount >= questionLimit ||
                        trialUsage.flashcardSetsCreated >= flashcardSetLimit
            }
            SubscriptionTier.BASIC -> {
                questionLimit = subscription.exchangeLimit
                flashcardSetLimit = 0
                trialExhausted = subscription.exchangeCount >= subscription.exchangeLimit
            }
            SubscriptionTier.PREMIUM -> {
                questionLimit = subscription.exchangeLimit
                flashcardSetLimit = Int.MAX_VALUE
                trialExhausted = subscription.exchangeCount >= subscription.exchangeLimit
            }
        }

        return TrialStatusResponse(
            userId = userId,
            tier = subscription.tier,
            questionCount = if (subscription.tier == SubscriptionTier.FREE_TRIAL) trialUsage.questionCount else subscription.exchangeCount,
            questionLimit = questionLimit,
            flashcardSetsCreated = trialUsage.flashcardSetsCreated,
            flashcardSetLimit = flashcardSetLimit,
            trialExhausted = trialExhausted
        )
    }

    fun checkAndIncrementQuestion(userId: UUID) {
        val subscription = subscriptionRepository.findByUserId(userId)
            ?: throw ResourceNotFoundException("Subscription not found for user $userId")

        when (subscription.tier) {
            SubscriptionTier.FREE_TRIAL -> {
                val trialUsage = getOrCreateTrialUsage(userId)
                if (trialUsage.questionCount >= FREE_TRIAL_QUESTION_LIMIT) {
                    throw TrialLimitExceededException("Free trial question limit of $FREE_TRIAL_QUESTION_LIMIT reached")
                }
                trialUsage.questionCount++
                trialUsageRepository.save(trialUsage)
            }
            SubscriptionTier.BASIC, SubscriptionTier.PREMIUM -> {
                if (subscription.exchangeCount >= subscription.exchangeLimit) {
                    throw ExchangeLimitExceededException("Exchange limit of ${subscription.exchangeLimit} reached")
                }
                subscription.exchangeCount++
                subscriptionRepository.save(subscription)
            }
        }
    }

    fun checkAndIncrementFlashcardSet(userId: UUID) {
        val subscription = subscriptionRepository.findByUserId(userId)
            ?: throw ResourceNotFoundException("Subscription not found for user $userId")

        when (subscription.tier) {
            SubscriptionTier.FREE_TRIAL -> {
                val trialUsage = getOrCreateTrialUsage(userId)
                if (trialUsage.flashcardSetsCreated >= FREE_TRIAL_FLASHCARD_SET_LIMIT) {
                    throw TrialLimitExceededException("Free trial flashcard set limit of $FREE_TRIAL_FLASHCARD_SET_LIMIT reached")
                }
                trialUsage.flashcardSetsCreated++
                trialUsageRepository.save(trialUsage)
            }
            SubscriptionTier.BASIC -> {
                throw FlashcardAccessDeniedException("Flashcard access requires a Premium subscription")
            }
            SubscriptionTier.PREMIUM -> {
                if (subscription.exchangeCount >= subscription.exchangeLimit) {
                    throw ExchangeLimitExceededException("Exchange limit of ${subscription.exchangeLimit} reached")
                }
                subscription.exchangeCount++
                subscriptionRepository.save(subscription)
            }
        }
    }
}
