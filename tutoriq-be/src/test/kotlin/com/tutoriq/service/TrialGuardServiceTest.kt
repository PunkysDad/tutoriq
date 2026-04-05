package com.tutoriq.service

import com.tutoriq.exception.ExchangeLimitExceededException
import com.tutoriq.exception.FlashcardAccessDeniedException
import com.tutoriq.exception.TrialLimitExceededException
import com.tutoriq.model.entity.*
import com.tutoriq.repository.SubscriptionRepository
import com.tutoriq.repository.TrialUsageRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class TrialGuardServiceTest {

    @Mock lateinit var subscriptionRepository: SubscriptionRepository
    @Mock lateinit var trialUsageRepository: TrialUsageRepository

    @InjectMocks lateinit var trialGuardService: TrialGuardService

    private val userId = UUID.randomUUID()

    private fun freeTrialSubscription() = Subscription(
        userId = userId,
        tier = SubscriptionTier.FREE_TRIAL,
        status = SubscriptionStatus.ACTIVE,
        exchangeLimit = 0
    )

    private fun basicSubscription(exchangeCount: Int = 0, exchangeLimit: Int = 500) = Subscription(
        userId = userId,
        tier = SubscriptionTier.BASIC,
        status = SubscriptionStatus.ACTIVE,
        exchangeCount = exchangeCount,
        exchangeLimit = exchangeLimit
    )

    private fun premiumSubscription(exchangeCount: Int = 0, exchangeLimit: Int = 1000) = Subscription(
        userId = userId,
        tier = SubscriptionTier.PREMIUM,
        status = SubscriptionStatus.ACTIVE,
        exchangeCount = exchangeCount,
        exchangeLimit = exchangeLimit
    )

    private fun trialUsage(questionCount: Int = 0, flashcardSetsCreated: Int = 0) = TrialUsage(
        userId = userId,
        questionCount = questionCount,
        flashcardSetsCreated = flashcardSetsCreated
    )

    @Test
    fun `getTrialStatus returns correct status for FREE_TRIAL user under limit`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(freeTrialSubscription())
        whenever(trialUsageRepository.findByUserId(userId)).thenReturn(trialUsage(questionCount = 2))

        val status = trialGuardService.getTrialStatus(userId)

        assertEquals(SubscriptionTier.FREE_TRIAL, status.tier)
        assertEquals(2, status.questionCount)
        assertEquals(4, status.questionLimit)
        assertFalse(status.trialExhausted)
    }

    @Test
    fun `getTrialStatus returns trialExhausted true when questionCount at limit`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(freeTrialSubscription())
        whenever(trialUsageRepository.findByUserId(userId)).thenReturn(trialUsage(questionCount = 4))

        val status = trialGuardService.getTrialStatus(userId)

        assertTrue(status.trialExhausted)
    }

    @Test
    fun `checkAndIncrementQuestion succeeds for FREE_TRIAL user under limit`() {
        val usage = trialUsage(questionCount = 2)
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(freeTrialSubscription())
        whenever(trialUsageRepository.findByUserId(userId)).thenReturn(usage)
        whenever(trialUsageRepository.save(any<TrialUsage>())).thenReturn(usage)

        trialGuardService.checkAndIncrementQuestion(userId)

        assertEquals(3, usage.questionCount)
    }

    @Test
    fun `checkAndIncrementQuestion throws TrialLimitExceededException when FREE_TRIAL limit reached`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(freeTrialSubscription())
        whenever(trialUsageRepository.findByUserId(userId)).thenReturn(trialUsage(questionCount = 4))

        assertThrows<TrialLimitExceededException> {
            trialGuardService.checkAndIncrementQuestion(userId)
        }
    }

    @Test
    fun `checkAndIncrementQuestion throws ExchangeLimitExceededException when BASIC user hits exchange limit`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(basicSubscription(exchangeCount = 500, exchangeLimit = 500))

        assertThrows<ExchangeLimitExceededException> {
            trialGuardService.checkAndIncrementQuestion(userId)
        }
    }

    @Test
    fun `checkAndIncrementFlashcardSet succeeds for FREE_TRIAL user under limit`() {
        val usage = trialUsage(flashcardSetsCreated = 0)
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(freeTrialSubscription())
        whenever(trialUsageRepository.findByUserId(userId)).thenReturn(usage)
        whenever(trialUsageRepository.save(any<TrialUsage>())).thenReturn(usage)

        trialGuardService.checkAndIncrementFlashcardSet(userId)

        assertEquals(1, usage.flashcardSetsCreated)
    }

    @Test
    fun `checkAndIncrementFlashcardSet throws TrialLimitExceededException when FREE_TRIAL flashcard limit reached`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(freeTrialSubscription())
        whenever(trialUsageRepository.findByUserId(userId)).thenReturn(trialUsage(flashcardSetsCreated = 1))

        assertThrows<TrialLimitExceededException> {
            trialGuardService.checkAndIncrementFlashcardSet(userId)
        }
    }

    @Test
    fun `checkAndIncrementFlashcardSet throws FlashcardAccessDeniedException for BASIC tier`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(basicSubscription())

        assertThrows<FlashcardAccessDeniedException> {
            trialGuardService.checkAndIncrementFlashcardSet(userId)
        }
    }
}
