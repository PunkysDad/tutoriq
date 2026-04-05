package com.tutoriq.service

import com.tutoriq.exception.PremiumFeatureException
import com.tutoriq.exception.ResourceNotFoundException
import com.tutoriq.model.dto.*
import com.tutoriq.model.entity.FlashcardCard
import com.tutoriq.model.entity.FlashcardDeck
import com.tutoriq.model.entity.SubscriptionStatus
import com.tutoriq.model.entity.SubscriptionTier
import com.tutoriq.repository.FlashcardCardRepository
import com.tutoriq.repository.FlashcardDeckRepository
import com.tutoriq.repository.SubscriptionRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class FlashcardService(
    private val flashcardDeckRepository: FlashcardDeckRepository,
    private val flashcardCardRepository: FlashcardCardRepository,
    private val subscriptionRepository: SubscriptionRepository,
    private val trialGuardService: TrialGuardService
) {

    fun createDeck(userId: UUID, request: CreateDeckRequest): DeckResponse {
        verifyPremiumAccess(userId)
        trialGuardService.checkAndIncrementFlashcardSet(userId)

        val deck = flashcardDeckRepository.save(
            FlashcardDeck(userId = userId, title = request.title, subject = request.subject)
        )
        return toDeckResponse(deck, 0)
    }

    fun getUserDecks(userId: UUID): List<DeckResponse> {
        verifyPremiumAccess(userId)

        return flashcardDeckRepository.findByUserId(userId)
            .sortedByDescending { it.createdAt }
            .map { toDeckResponse(it, flashcardCardRepository.countByDeckId(it.id)) }
    }

    fun getDeckWithCards(userId: UUID, deckId: UUID): DeckWithCardsResponse {
        verifyPremiumAccess(userId)

        val deck = flashcardDeckRepository.findByIdAndUserId(deckId, userId)
            ?: throw ResourceNotFoundException("Deck not found")
        val cards = flashcardCardRepository.findByDeckId(deckId)

        return DeckWithCardsResponse(
            deck = toDeckResponse(deck, cards.size),
            cards = cards.map { toCardResponse(it) }
        )
    }

    fun updateDeck(userId: UUID, deckId: UUID, request: UpdateDeckRequest): DeckResponse {
        verifyPremiumAccess(userId)

        val deck = flashcardDeckRepository.findByIdAndUserId(deckId, userId)
            ?: throw ResourceNotFoundException("Deck not found")

        deck.title = request.title
        val saved = flashcardDeckRepository.save(deck)
        return toDeckResponse(saved, flashcardCardRepository.countByDeckId(deckId))
    }

    @Transactional
    fun deleteDeck(userId: UUID, deckId: UUID) {
        verifyPremiumAccess(userId)

        flashcardDeckRepository.findByIdAndUserId(deckId, userId)
            ?: throw ResourceNotFoundException("Deck not found")

        flashcardCardRepository.deleteByDeckId(deckId)
        flashcardDeckRepository.deleteById(deckId)
    }

    fun addCard(userId: UUID, deckId: UUID, request: CreateCardRequest): CardResponse {
        verifyPremiumAccess(userId)

        flashcardDeckRepository.findByIdAndUserId(deckId, userId)
            ?: throw ResourceNotFoundException("Deck not found")

        val card = flashcardCardRepository.save(
            FlashcardCard(deckId = deckId, question = request.question, answer = request.answer)
        )
        return toCardResponse(card)
    }

    fun updateCard(userId: UUID, deckId: UUID, cardId: UUID, request: UpdateCardRequest): CardResponse {
        verifyPremiumAccess(userId)

        flashcardDeckRepository.findByIdAndUserId(deckId, userId)
            ?: throw ResourceNotFoundException("Deck not found")

        val card = flashcardCardRepository.findByIdAndDeckId(cardId, deckId)
            ?: throw ResourceNotFoundException("Card not found")

        card.question = request.question
        card.answer = request.answer
        val saved = flashcardCardRepository.save(card)
        return toCardResponse(saved)
    }

    fun deleteCard(userId: UUID, deckId: UUID, cardId: UUID) {
        verifyPremiumAccess(userId)

        flashcardDeckRepository.findByIdAndUserId(deckId, userId)
            ?: throw ResourceNotFoundException("Deck not found")

        flashcardCardRepository.findByIdAndDeckId(cardId, deckId)
            ?: throw ResourceNotFoundException("Card not found")

        flashcardCardRepository.deleteById(cardId)
    }

    fun getDeckForGame(userId: UUID, deckId: UUID): DeckWithCardsResponse {
        verifyPremiumAccess(userId)

        val deck = flashcardDeckRepository.findByIdAndUserId(deckId, userId)
            ?: throw ResourceNotFoundException("Deck not found")
        val cards = flashcardCardRepository.findByDeckId(deckId).shuffled()

        return DeckWithCardsResponse(
            deck = toDeckResponse(deck, cards.size),
            cards = cards.map { toCardResponse(it) }
        )
    }

    private fun toDeckResponse(deck: FlashcardDeck, cardCount: Int) = DeckResponse(
        deckId = deck.id,
        title = deck.title,
        subject = deck.subject,
        cardCount = cardCount,
        createdAt = deck.createdAt,
        updatedAt = deck.updatedAt
    )

    private fun toCardResponse(card: FlashcardCard) = CardResponse(
        cardId = card.id,
        deckId = card.deckId,
        question = card.question,
        answer = card.answer,
        createdAt = card.createdAt,
        updatedAt = card.updatedAt
    )

    private fun verifyPremiumAccess(userId: UUID) {
        val subscription = subscriptionRepository.findByUserId(userId)
        if (subscription == null || subscription.tier != SubscriptionTier.PREMIUM || subscription.status != SubscriptionStatus.ACTIVE) {
            throw PremiumFeatureException()
        }
    }
}
