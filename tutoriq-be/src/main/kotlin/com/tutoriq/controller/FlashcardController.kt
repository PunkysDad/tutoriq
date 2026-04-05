package com.tutoriq.controller

import com.tutoriq.model.dto.*
import com.tutoriq.model.entity.User
import com.tutoriq.service.FlashcardService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/v1/flashcards")
class FlashcardController(private val flashcardService: FlashcardService) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createDeck(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: CreateDeckRequest
    ): DeckResponse = flashcardService.createDeck(user.id, request)

    @GetMapping
    fun getUserDecks(@AuthenticationPrincipal user: User): List<DeckResponse> =
        flashcardService.getUserDecks(user.id)

    @GetMapping("/{deckId}")
    fun getDeckWithCards(
        @AuthenticationPrincipal user: User,
        @PathVariable deckId: UUID
    ): DeckWithCardsResponse = flashcardService.getDeckWithCards(user.id, deckId)

    @PutMapping("/{deckId}")
    fun updateDeck(
        @AuthenticationPrincipal user: User,
        @PathVariable deckId: UUID,
        @Valid @RequestBody request: UpdateDeckRequest
    ): DeckResponse = flashcardService.updateDeck(user.id, deckId, request)

    @DeleteMapping("/{deckId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteDeck(
        @AuthenticationPrincipal user: User,
        @PathVariable deckId: UUID
    ) = flashcardService.deleteDeck(user.id, deckId)

    @PostMapping("/{deckId}/cards")
    @ResponseStatus(HttpStatus.CREATED)
    fun addCard(
        @AuthenticationPrincipal user: User,
        @PathVariable deckId: UUID,
        @Valid @RequestBody request: CreateCardRequest
    ): CardResponse = flashcardService.addCard(user.id, deckId, request)

    @PutMapping("/{deckId}/cards/{cardId}")
    fun updateCard(
        @AuthenticationPrincipal user: User,
        @PathVariable deckId: UUID,
        @PathVariable cardId: UUID,
        @Valid @RequestBody request: UpdateCardRequest
    ): CardResponse = flashcardService.updateCard(user.id, deckId, cardId, request)

    @DeleteMapping("/{deckId}/cards/{cardId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteCard(
        @AuthenticationPrincipal user: User,
        @PathVariable deckId: UUID,
        @PathVariable cardId: UUID
    ) = flashcardService.deleteCard(user.id, deckId, cardId)

    @GetMapping("/{deckId}/game")
    fun getDeckForGame(
        @AuthenticationPrincipal user: User,
        @PathVariable deckId: UUID
    ): DeckWithCardsResponse = flashcardService.getDeckForGame(user.id, deckId)
}
