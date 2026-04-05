package com.tutoriq.service

import com.tutoriq.exception.ResourceNotFoundException
import com.tutoriq.exception.UnauthorizedAccessException
import com.tutoriq.model.dto.ChildActivityResponse
import com.tutoriq.model.dto.ChildSessionResponse
import com.tutoriq.model.dto.ChildSummaryResponse
import com.tutoriq.model.entity.SubscriptionTier
import com.tutoriq.model.entity.TutorSession
import com.tutoriq.model.entity.User
import com.tutoriq.model.entity.UserRole
import com.tutoriq.repository.*
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ParentPortalService(
    private val userRepository: UserRepository,
    private val tutorSessionRepository: TutorSessionRepository,
    private val tutorMessageRepository: TutorMessageRepository,
    private val subscriptionRepository: SubscriptionRepository,
    private val trialUsageRepository: TrialUsageRepository
) {

    fun getChildren(parentId: UUID): List<ChildSummaryResponse> {
        verifyParentRole(parentId)

        val children = userRepository.findByParentId(parentId)
        return children.map { buildChildSummary(it) }
    }

    fun getChildActivity(parentId: UUID, childId: UUID): ChildActivityResponse {
        verifyParentRole(parentId)
        val child = verifyChildOwnership(parentId, childId)

        val summary = buildChildSummary(child)
        val sessions = tutorSessionRepository.findByUserId(childId)
            .sortedByDescending { it.startedAt }
            .take(10)
            .map { toChildSessionResponse(it) }

        return ChildActivityResponse(child = summary, recentSessions = sessions)
    }

    fun getChildSessions(parentId: UUID, childId: UUID): List<ChildSessionResponse> {
        verifyParentRole(parentId)
        verifyChildOwnership(parentId, childId)

        return tutorSessionRepository.findByUserId(childId)
            .sortedByDescending { it.startedAt }
            .map { toChildSessionResponse(it) }
    }

    private fun buildChildSummary(child: User): ChildSummaryResponse {
        val subscription = subscriptionRepository.findByUserId(child.id)
        val trialUsage = trialUsageRepository.findByUserId(child.id)
        val sessions = tutorSessionRepository.findByUserId(child.id)

        val totalMessages = sessions.sumOf { tutorMessageRepository.countBySessionId(it.id) }

        val subjectBreakdown = sessions
            .groupBy { it.subject.name }
            .mapValues { it.value.size }

        val questionCount = if (subscription?.tier == SubscriptionTier.FREE_TRIAL) {
            trialUsage?.questionCount ?: 0
        } else {
            subscription?.exchangeCount ?: 0
        }

        return ChildSummaryResponse(
            childId = child.id,
            firstName = child.firstName ?: "",
            lastName = child.lastName ?: "",
            gradeLevel = child.gradeLevel,
            subscriptionTier = subscription?.tier,
            subscriptionStatus = subscription?.status,
            totalSessions = sessions.size,
            totalMessages = totalMessages,
            questionCount = questionCount,
            subjectBreakdown = subjectBreakdown
        )
    }

    private fun toChildSessionResponse(session: TutorSession) = ChildSessionResponse(
        sessionId = session.id,
        subject = session.subject,
        gradeLevel = session.gradeLevel,
        startedAt = session.startedAt,
        messageCount = tutorMessageRepository.countBySessionId(session.id)
    )

    private fun verifyParentRole(parentId: UUID) {
        val user = userRepository.findById(parentId)
            .orElseThrow { UnauthorizedAccessException() }
        if (user.role != UserRole.PARENT) {
            throw UnauthorizedAccessException()
        }
    }

    private fun verifyChildOwnership(parentId: UUID, childId: UUID): User {
        val child = userRepository.findById(childId)
            .orElseThrow { ResourceNotFoundException("Child not found") }
        if (child.parentId != parentId) {
            throw ResourceNotFoundException("Child not found")
        }
        return child
    }
}
