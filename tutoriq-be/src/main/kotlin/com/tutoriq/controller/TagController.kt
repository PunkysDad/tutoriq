package com.tutoriq.controller

import com.tutoriq.model.dto.*
import com.tutoriq.model.entity.User
import com.tutoriq.service.TagService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/v1/tags")
class TagController(private val tagService: TagService) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createTag(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: CreateTagRequest
    ): TagResponse = tagService.createTag(user.id, request)

    @GetMapping
    fun getUserTags(@AuthenticationPrincipal user: User): List<TagResponse> =
        tagService.getUserTags(user.id)

    @DeleteMapping("/{tagId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteTag(
        @AuthenticationPrincipal user: User,
        @PathVariable tagId: UUID
    ) = tagService.deleteTag(user.id, tagId)

    @PostMapping("/messages/{messageId}/apply")
    fun applyTagToMessage(
        @AuthenticationPrincipal user: User,
        @PathVariable messageId: UUID,
        @Valid @RequestBody request: ApplyTagRequest
    ): TaggedMessageResponse = tagService.applyTagToMessage(user.id, messageId, request)

    @DeleteMapping("/messages/{messageId}/tags/{tagId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun removeTagFromMessage(
        @AuthenticationPrincipal user: User,
        @PathVariable messageId: UUID,
        @PathVariable tagId: UUID
    ) = tagService.removeTagFromMessage(user.id, messageId, tagId)

    @GetMapping("/{tagId}/messages")
    fun getMessagesByTag(
        @AuthenticationPrincipal user: User,
        @PathVariable tagId: UUID
    ): List<TaggedMessageResponse> = tagService.getMessagesByTag(user.id, tagId)
}
