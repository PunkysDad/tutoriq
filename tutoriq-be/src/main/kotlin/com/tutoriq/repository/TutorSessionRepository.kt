package com.tutoriq.repository

import com.tutoriq.model.entity.TutorSession
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface TutorSessionRepository : JpaRepository<TutorSession, UUID> {
    fun findByUserId(userId: UUID): List<TutorSession>
    fun findByIdAndUserId(id: UUID, userId: UUID): TutorSession?
}
