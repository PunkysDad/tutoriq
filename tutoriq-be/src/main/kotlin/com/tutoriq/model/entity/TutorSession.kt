package com.tutoriq.model.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "tutor_sessions")
class TutorSession(

    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val subject: Subject,

    @Column(name = "grade_level")
    val gradeLevel: Int,

    @Column(name = "started_at", nullable = false)
    var startedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "ended_at")
    var endedAt: LocalDateTime? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
) {

    @PrePersist
    fun onPrePersist() {
        val now = LocalDateTime.now()
        createdAt = now
        startedAt = now
    }
}
