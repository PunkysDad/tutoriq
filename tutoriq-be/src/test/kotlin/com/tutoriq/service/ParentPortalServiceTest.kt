package com.tutoriq.service

import com.tutoriq.exception.ResourceNotFoundException
import com.tutoriq.exception.UnauthorizedAccessException
import com.tutoriq.model.entity.*
import com.tutoriq.repository.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever
import java.time.Instant
import java.util.Optional
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class ParentPortalServiceTest {

    @Mock lateinit var userRepository: UserRepository
    @Mock lateinit var tutorSessionRepository: TutorSessionRepository
    @Mock lateinit var tutorMessageRepository: TutorMessageRepository
    @Mock lateinit var subscriptionRepository: SubscriptionRepository
    @Mock lateinit var trialUsageRepository: TrialUsageRepository

    @InjectMocks lateinit var parentPortalService: ParentPortalService

    private val parentId = UUID.randomUUID()
    private val childId = UUID.randomUUID()

    private fun parentUser() = User(
        id = parentId,
        email = "parent@example.com",
        passwordHash = "hash",
        firstName = "Parent",
        lastName = "User",
        role = UserRole.PARENT
    )

    private fun childUser() = User(
        id = childId,
        email = "child@example.com",
        passwordHash = "hash",
        firstName = "Child",
        lastName = "User",
        gradeLevel = 5,
        role = UserRole.STUDENT,
        parentId = parentId
    )

    private fun studentUser() = User(
        id = parentId,
        email = "student@example.com",
        passwordHash = "hash",
        firstName = "Student",
        lastName = "User",
        role = UserRole.STUDENT
    )

    private fun testSession(subject: Subject = Subject.MATH) = TutorSession(
        id = UUID.randomUUID(),
        userId = childId,
        subject = subject,
        gradeLevel = 5
    )

    @Test
    fun `getChildren returns list of ChildSummaryResponse for valid parent`() {
        val child = childUser()
        val session = testSession()

        whenever(userRepository.findById(parentId)).thenReturn(Optional.of(parentUser()))
        whenever(userRepository.findByParentId(parentId)).thenReturn(listOf(child))
        whenever(subscriptionRepository.findByUserId(childId)).thenReturn(
            Subscription(userId = childId, tier = SubscriptionTier.FREE_TRIAL, status = SubscriptionStatus.ACTIVE, exchangeLimit = 0)
        )
        whenever(trialUsageRepository.findByUserId(childId)).thenReturn(
            TrialUsage(userId = childId, questionCount = 3)
        )
        whenever(tutorSessionRepository.findByUserId(childId)).thenReturn(listOf(session))
        whenever(tutorMessageRepository.countBySessionId(session.id)).thenReturn(4)

        val result = parentPortalService.getChildren(parentId)

        assertEquals(1, result.size)
        assertEquals(childId, result[0].childId)
        assertEquals("Child", result[0].firstName)
        assertEquals(1, result[0].totalSessions)
        assertEquals(4, result[0].totalMessages)
        assertEquals(3, result[0].questionCount)
    }

    @Test
    fun `getChildren throws UnauthorizedAccessException for non-PARENT user`() {
        whenever(userRepository.findById(parentId)).thenReturn(Optional.of(studentUser()))

        assertThrows<UnauthorizedAccessException> {
            parentPortalService.getChildren(parentId)
        }
    }

    @Test
    fun `getChildren returns correct subjectBreakdown map`() {
        val child = childUser()
        val mathSession = testSession(Subject.MATH)
        val scienceSession1 = testSession(Subject.SCIENCE)
        val scienceSession2 = testSession(Subject.SCIENCE)

        whenever(userRepository.findById(parentId)).thenReturn(Optional.of(parentUser()))
        whenever(userRepository.findByParentId(parentId)).thenReturn(listOf(child))
        whenever(subscriptionRepository.findByUserId(childId)).thenReturn(null)
        whenever(trialUsageRepository.findByUserId(childId)).thenReturn(null)
        whenever(tutorSessionRepository.findByUserId(childId)).thenReturn(listOf(mathSession, scienceSession1, scienceSession2))
        whenever(tutorMessageRepository.countBySessionId(mathSession.id)).thenReturn(2)
        whenever(tutorMessageRepository.countBySessionId(scienceSession1.id)).thenReturn(3)
        whenever(tutorMessageRepository.countBySessionId(scienceSession2.id)).thenReturn(1)

        val result = parentPortalService.getChildren(parentId)

        assertEquals(mapOf("MATH" to 1, "SCIENCE" to 2), result[0].subjectBreakdown)
    }

    @Test
    fun `getChildActivity returns ChildActivityResponse with summary and recent sessions`() {
        val child = childUser()
        val session = testSession()

        whenever(userRepository.findById(parentId)).thenReturn(Optional.of(parentUser()))
        whenever(userRepository.findById(childId)).thenReturn(Optional.of(child))
        whenever(subscriptionRepository.findByUserId(childId)).thenReturn(null)
        whenever(trialUsageRepository.findByUserId(childId)).thenReturn(null)
        whenever(tutorSessionRepository.findByUserId(childId)).thenReturn(listOf(session))
        whenever(tutorMessageRepository.countBySessionId(session.id)).thenReturn(2)

        val result = parentPortalService.getChildActivity(parentId, childId)

        assertEquals(childId, result.child.childId)
        assertEquals(1, result.recentSessions.size)
    }

    @Test
    fun `getChildActivity throws ResourceNotFoundException when childId does not belong to parent`() {
        val unlinkedChild = User(
            id = childId,
            email = "other@example.com",
            passwordHash = "hash",
            role = UserRole.STUDENT,
            parentId = UUID.randomUUID()
        )

        whenever(userRepository.findById(parentId)).thenReturn(Optional.of(parentUser()))
        whenever(userRepository.findById(childId)).thenReturn(Optional.of(unlinkedChild))

        assertThrows<ResourceNotFoundException> {
            parentPortalService.getChildActivity(parentId, childId)
        }
    }

    @Test
    fun `getChildActivity throws UnauthorizedAccessException for non-PARENT user`() {
        whenever(userRepository.findById(parentId)).thenReturn(Optional.of(studentUser()))

        assertThrows<UnauthorizedAccessException> {
            parentPortalService.getChildActivity(parentId, childId)
        }
    }

    @Test
    fun `getChildSessions returns all sessions for valid child`() {
        val child = childUser()
        val session1 = testSession(Subject.MATH)
        val session2 = testSession(Subject.SCIENCE)

        whenever(userRepository.findById(parentId)).thenReturn(Optional.of(parentUser()))
        whenever(userRepository.findById(childId)).thenReturn(Optional.of(child))
        whenever(tutorSessionRepository.findByUserId(childId)).thenReturn(listOf(session1, session2))
        whenever(tutorMessageRepository.countBySessionId(session1.id)).thenReturn(3)
        whenever(tutorMessageRepository.countBySessionId(session2.id)).thenReturn(5)

        val result = parentPortalService.getChildSessions(parentId, childId)

        assertEquals(2, result.size)
    }

    @Test
    fun `getChildSessions throws ResourceNotFoundException for child not belonging to parent`() {
        whenever(userRepository.findById(parentId)).thenReturn(Optional.of(parentUser()))
        whenever(userRepository.findById(childId)).thenReturn(Optional.empty())

        assertThrows<ResourceNotFoundException> {
            parentPortalService.getChildSessions(parentId, childId)
        }
    }
}
