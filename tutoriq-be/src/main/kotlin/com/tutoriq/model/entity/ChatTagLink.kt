package com.tutoriq.model.entity

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "chat_tag_links")
class ChatTagLink(

    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(name = "message_id", nullable = false)
    val messageId: UUID,

    @Column(name = "tag_id", nullable = false)
    val tagId: UUID
)
