package com.tutoriq.service

import com.tutoriq.model.entity.*
import com.tutoriq.repository.SubscriptionRepository
import com.tutoriq.repository.TrialUsageRepository
import com.tutoriq.repository.TutorMessageRepository
import com.tutoriq.repository.TutorSessionRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever
import java.time.LocalDateTime
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class ProgressServiceTest {

    @Mock lateinit var tutorSessionRepository: TutorSessionRepository
    @Mock lateinit var tutorMessageRepository: TutorMessageRepository
    @Mock lateinit var subscriptionRepository: SubscriptionRepository
    @Mock lateinit var trialUsageRepository: TrialUsageRepository

    @InjectMocks lateinit var progressService: ProgressService

    private val userId = UUID.randomUUID()

    private fun session(subject: Subject, startedAt: LocalDateTime = LocalDateTime.now()): TutorSession {
        val id = UUID.randomUUID()
        return TutorSession(
            id = id,
            userId = userId,
            subject = subject,
            gradeLevel = 5,
            startedAt = startedAt
        )
    }

    @Test
    fun `getDashboard returns correct totalSessions and totalMessages`() {
        val s1 = session(Subject.MATH)
        val s2 = session(Subject.SCIENCE)

        whenever(tutorSessionRepository.findByUserId(userId)).thenReturn(listOf(s1, s2))
        whenever(tutorMessageRepository.countBySessionId(s1.id)).thenReturn(4)
        whenever(tutorMessageRepository.countBySessionId(s2.id)).thenReturn(6)
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(null)
        whenever(trialUsageRepository.findByUserId(userId)).thenReturn(null)

        val dashboard = progressService.getDashboard(userId)

        assertEquals(2, dashboard.totalSessions)
        assertEquals(10, dashboard.totalMessages)
    }

    @Test
    fun `getDashboard builds correct subjectBreakdown with session counts per subject`() {
        val m1 = session(Subject.MATH)
        val m2 = session(Subject.MATH)
        val s1 = session(Subject.SCIENCE)

        whenever(tutorSessionRepository.findByUserId(userId)).thenReturn(listOf(m1, m2, s1))
        whenever(tutorMessageRepository.countBySessionId(m1.id)).thenReturn(2)
        whenever(tutorMessageRepository.countBySessionId(m2.id)).thenReturn(3)
        whenever(tutorMessageRepository.countBySessionId(s1.id)).thenReturn(1)
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(null)
        whenever(trialUsageRepository.findByUserId(userId)).thenReturn(null)

        val dashboard = progressService.getDashboard(userId)

        assertEquals(2, dashboard.subjectBreakdown.size)
        val math = dashboard.subjectBreakdown.find { it.subject == Subject.MATH }!!
        assertEquals(2, math.sessionCount)
        assertEquals(5, math.totalMessages)
        val science = dashboard.subjectBreakdown.find { it.subject == Subject.SCIENCE }!!
        assertEquals(1, science.sessionCount)
        // MATH should come first (more sessions)
        assertEquals(Subject.MATH, dashboard.subjectBreakdown[0].subject)
    }

    @Test
    fun `getDashboard sets exchangeCount from trial_usage for FREE_TRIAL user`() {
        whenever(tutorSessionRepository.findByUserId(userId)).thenReturn(emptyList())
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(
            Subscription(userId = userId, tier = SubscriptionTier.FREE_TRIAL, status = SubscriptionStatus.ACTIVE, exchangeLimit = 0)
        )
        whenever(trialUsageRepository.findByUserId(userId)).thenReturn(
            TrialUsage(userId = userId, questionCount = 3)
        )

        val dashboard = progressService.getDashboard(userId)

        assertEquals(3, dashboard.exchangeCount)
        assertEquals(4, dashboard.exchangeLimit)
        assertEquals(SubscriptionTier.FREE_TRIAL, dashboard.subscriptionTier)
    }

    @Test
    fun `getDashboard sets exchangeCount from subscription for BASIC user`() {
        whenever(tutorSessionRepository.findByUserId(userId)).thenReturn(emptyList())
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(
            Subscription(userId = userId, tier = SubscriptionTier.BASIC, status = SubscriptionStatus.ACTIVE, exchangeCount = 42, exchangeLimit = 500)
        )
        whenever(trialUsageRepository.findByUserId(userId)).thenReturn(null)

        val dashboard = progressService.getDashboard(userId)

        assertEquals(42, dashboard.exchangeCount)
        assertEquals(500, dashboard.exchangeLimit)
    }

    @Test
    fun `getDashboard returns zero exchangeCount and exchangeLimit when no subscription`() {
        whenever(tutorSessionRepository.findByUserId(userId)).thenReturn(emptyList())
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(null)
        whenever(trialUsageRepository.findByUserId(userId)).thenReturn(null)

        val dashboard = progressService.getDashboard(userId)

        assertEquals(0, dashboard.exchangeCount)
        assertEquals(0, dashboard.exchangeLimit)
        assertNull(dashboard.subscriptionTier)
    }

    @Test
    fun `getSubjectProgress returns correct data for subject with sessions`() {
        val s1 = session(Subject.MATH, LocalDateTime.of(2026, 3, 1, 10, 0))
        val s2 = session(Subject.MATH, LocalDateTime.of(2026, 4, 1, 10, 0))

        whenever(tutorSessionRepository.findByUserIdAndSubject(userId, Subject.MATH)).thenReturn(listOf(s1, s2))
        whenever(tutorMessageRepository.countBySessionId(s1.id)).thenReturn(3)
        whenever(tutorMessageRepository.countBySessionId(s2.id)).thenReturn(5)

        val result = progressService.getSubjectProgress(userId, Subject.MATH)

        assertEquals(Subject.MATH, result.subject)
        assertEquals(2, result.sessionCount)
        assertEquals(8, result.totalMessages)
        assertEquals(LocalDateTime.of(2026, 4, 1, 10, 0), result.lastActivityAt)
    }

    @Test
    fun `getSubjectProgress returns zeros and null when no sessions exist`() {
        whenever(tutorSessionRepository.findByUserIdAndSubject(userId, Subject.HISTORY)).thenReturn(emptyList())

        val result = progressService.getSubjectProgress(userId, Subject.HISTORY)

        assertEquals(0, result.sessionCount)
        assertEquals(0, result.totalMessages)
        assertNull(result.lastActivityAt)
    }

    @Test
    fun `calculateStreak returns currentStreakDays greater than 0 when user has session today`() {
        val today = LocalDateTime.now()
        val yesterday = today.minusDays(1)

        val s1 = session(Subject.MATH, today)
        val s2 = session(Subject.MATH, yesterday)

        whenever(tutorSessionRepository.findByUserId(userId)).thenReturn(listOf(s1, s2))

        val streak = progressService.calculateStreak(userId)

        assertEquals(2, streak.currentStreakDays)
    }

    @Test
    fun `calculateStreak returns currentStreakDays 0 when last session was more than 1 day ago`() {
        val threeDaysAgo = LocalDateTime.now().minusDays(3)

        val s1 = session(Subject.MATH, threeDaysAgo)

        whenever(tutorSessionRepository.findByUserId(userId)).thenReturn(listOf(s1))

        val streak = progressService.calculateStreak(userId)

        assertEquals(0, streak.currentStreakDays)
    }

    @Test
    fun `calculateStreak correctly calculates longestStreakDays across non-consecutive dates`() {
        val now = LocalDateTime.now()
        // Streak 1: 3 consecutive days (days 10, 9, 8 ago)
        val d1 = session(Subject.MATH, now.minusDays(10))
        val d2 = session(Subject.MATH, now.minusDays(9))
        val d3 = session(Subject.MATH, now.minusDays(8))
        // Gap
        // Streak 2: 2 consecutive days (days 5, 4 ago)
        val d4 = session(Subject.MATH, now.minusDays(5))
        val d5 = session(Subject.MATH, now.minusDays(4))

        whenever(tutorSessionRepository.findByUserId(userId)).thenReturn(listOf(d1, d2, d3, d4, d5))

        val streak = progressService.calculateStreak(userId)

        assertEquals(3, streak.longestStreakDays)
        assertEquals(0, streak.currentStreakDays) // last activity was 4 days ago
    }

    @Test
    fun `getStreak returns StreakResponse with null lastActiveDate when no sessions`() {
        whenever(tutorSessionRepository.findByUserId(userId)).thenReturn(emptyList())

        val streak = progressService.getStreak(userId)

        assertEquals(0, streak.currentStreakDays)
        assertEquals(0, streak.longestStreakDays)
        assertNull(streak.lastActiveDate)
    }
}
