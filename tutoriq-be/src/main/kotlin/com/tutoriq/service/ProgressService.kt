package com.tutoriq.service

import com.tutoriq.model.dto.ProgressDashboardResponse
import com.tutoriq.model.dto.StreakResponse
import com.tutoriq.model.dto.SubjectProgressResponse
import com.tutoriq.model.entity.Subject
import com.tutoriq.model.entity.SubscriptionTier
import com.tutoriq.model.entity.TutorSession
import com.tutoriq.repository.SubscriptionRepository
import com.tutoriq.repository.TrialUsageRepository
import com.tutoriq.repository.TutorMessageRepository
import com.tutoriq.repository.TutorSessionRepository
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.UUID

@Service
class ProgressService(
    private val tutorSessionRepository: TutorSessionRepository,
    private val tutorMessageRepository: TutorMessageRepository,
    private val subscriptionRepository: SubscriptionRepository,
    private val trialUsageRepository: TrialUsageRepository
) {

    companion object {
        const val FREE_TRIAL_LIMIT = 4
    }

    fun getDashboard(userId: UUID): ProgressDashboardResponse {
        val sessions = tutorSessionRepository.findByUserId(userId)
        val totalSessions = sessions.size
        val totalMessages = sessions.sumOf { tutorMessageRepository.countBySessionId(it.id) }

        val subjectBreakdown = buildSubjectBreakdown(sessions)
        val streak = calculateStreak(userId)

        val subscription = subscriptionRepository.findByUserId(userId)
        val trialUsage = trialUsageRepository.findByUserId(userId)

        val exchangeCount: Int
        val exchangeLimit: Int

        when (subscription?.tier) {
            SubscriptionTier.FREE_TRIAL -> {
                exchangeCount = trialUsage?.questionCount ?: 0
                exchangeLimit = FREE_TRIAL_LIMIT
            }
            SubscriptionTier.BASIC, SubscriptionTier.PREMIUM -> {
                exchangeCount = subscription.exchangeCount
                exchangeLimit = subscription.exchangeLimit
            }
            null -> {
                exchangeCount = 0
                exchangeLimit = 0
            }
        }

        return ProgressDashboardResponse(
            userId = userId,
            totalSessions = totalSessions,
            totalMessages = totalMessages,
            subjectBreakdown = subjectBreakdown,
            streak = streak,
            exchangeCount = exchangeCount,
            exchangeLimit = exchangeLimit,
            subscriptionTier = subscription?.tier
        )
    }

    fun getSubjectProgress(userId: UUID, subject: Subject): SubjectProgressResponse {
        val sessions = tutorSessionRepository.findByUserIdAndSubject(userId, subject)

        if (sessions.isEmpty()) {
            return SubjectProgressResponse(
                subject = subject,
                sessionCount = 0,
                totalMessages = 0,
                lastActivityAt = null
            )
        }

        val totalMessages = sessions.sumOf { tutorMessageRepository.countBySessionId(it.id) }
        val lastActivityAt = sessions.maxOf { it.startedAt }

        return SubjectProgressResponse(
            subject = subject,
            sessionCount = sessions.size,
            totalMessages = totalMessages,
            lastActivityAt = lastActivityAt
        )
    }

    fun getStreak(userId: UUID): StreakResponse = calculateStreak(userId)

    internal fun calculateStreak(userId: UUID): StreakResponse {
        val sessions = tutorSessionRepository.findByUserId(userId)

        if (sessions.isEmpty()) {
            return StreakResponse(currentStreakDays = 0, longestStreakDays = 0, lastActiveDate = null)
        }

        val uniqueDates = sessions.map { it.startedAt.toLocalDate() }.distinct().sortedDescending()
        val lastActiveDate = uniqueDates.first()
        val today = LocalDate.now()

        // Current streak: must start from today or yesterday
        val currentStreakDays = if (lastActiveDate == today || lastActiveDate == today.minusDays(1)) {
            countConsecutiveDays(uniqueDates)
        } else {
            0
        }

        // Longest streak: find longest consecutive sequence
        val longestStreakDays = findLongestStreak(uniqueDates.sortedDescending())

        return StreakResponse(
            currentStreakDays = currentStreakDays,
            longestStreakDays = longestStreakDays,
            lastActiveDate = lastActiveDate
        )
    }

    private fun countConsecutiveDays(sortedDatesDesc: List<LocalDate>): Int {
        if (sortedDatesDesc.isEmpty()) return 0
        var count = 1
        for (i in 1 until sortedDatesDesc.size) {
            if (sortedDatesDesc[i] == sortedDatesDesc[i - 1].minusDays(1)) {
                count++
            } else {
                break
            }
        }
        return count
    }

    private fun findLongestStreak(sortedDatesDesc: List<LocalDate>): Int {
        if (sortedDatesDesc.isEmpty()) return 0
        var longest = 1
        var current = 1
        for (i in 1 until sortedDatesDesc.size) {
            if (sortedDatesDesc[i] == sortedDatesDesc[i - 1].minusDays(1)) {
                current++
                if (current > longest) longest = current
            } else {
                current = 1
            }
        }
        return longest
    }

    private fun buildSubjectBreakdown(sessions: List<TutorSession>): List<SubjectProgressResponse> =
        sessions.groupBy { it.subject }
            .map { (subject, subjectSessions) ->
                SubjectProgressResponse(
                    subject = subject,
                    sessionCount = subjectSessions.size,
                    totalMessages = subjectSessions.sumOf { tutorMessageRepository.countBySessionId(it.id) },
                    lastActivityAt = subjectSessions.maxOf { it.startedAt }
                )
            }
            .sortedByDescending { it.sessionCount }
}
