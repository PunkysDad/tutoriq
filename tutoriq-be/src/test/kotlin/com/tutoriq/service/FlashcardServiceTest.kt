package com.tutoriq.service

import com.tutoriq.exception.PremiumFeatureException
import com.tutoriq.exception.ResourceNotFoundException
import com.tutoriq.exception.TrialLimitExceededException
import com.tutoriq.model.dto.*
import com.tutoriq.model.entity.*
import com.tutoriq.repository.FlashcardCardRepository
import com.tutoriq.repository.FlashcardDeckRepository
import com.tutoriq.repository.SubscriptionRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.*
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class FlashcardServiceTest {

    @Mock lateinit var flashcardDeckRepository: FlashcardDeckRepository
    @Mock lateinit var flashcardCardRepository: FlashcardCardRepository
    @Mock lateinit var subscriptionRepository: SubscriptionRepository
    @Mock lateinit var trialGuardService: TrialGuardService

    @InjectMocks lateinit var flashcardService: FlashcardService

    private val userId = UUID.randomUUID()
    private val deckId = UUID.randomUUID()
    private val cardId = UUID.randomUUID()

    private fun premiumSubscription() = Subscription(
        userId = userId,
        tier = SubscriptionTier.PREMIUM,
        status = SubscriptionStatus.ACTIVE,
        exchangeLimit = 1000
    )

    private fun basicSubscription() = Subscription(
        userId = userId,
        tier = SubscriptionTier.BASIC,
        status = SubscriptionStatus.ACTIVE,
        exchangeLimit = 500
    )

    private fun testDeck() = FlashcardDeck(
        id = deckId,
        userId = userId,
        title = "Math Basics",
        subject = Subject.MATH
    )

    private fun testCard(id: UUID = cardId) = FlashcardCard(
        id = id,
        deckId = deckId,
        question = "What is 2+2?",
        answer = "4"
    )

    @Test
    fun `createDeck succeeds for Premium user and calls checkAndIncrementFlashcardSet`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(flashcardDeckRepository.save(any<FlashcardDeck>())).thenAnswer { it.arguments[0] }

        val response = flashcardService.createDeck(userId, CreateDeckRequest("Math Basics", Subject.MATH))

        assertEquals("Math Basics", response.title)
        assertEquals(Subject.MATH, response.subject)
        assertEquals(0, response.cardCount)
        verify(trialGuardService).checkAndIncrementFlashcardSet(userId)
    }

    @Test
    fun `createDeck throws PremiumFeatureException for non-Premium user`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(basicSubscription())

        assertThrows<PremiumFeatureException> {
            flashcardService.createDeck(userId, CreateDeckRequest("Math Basics", Subject.MATH))
        }
    }

    @Test
    fun `createDeck throws TrialLimitExceededException when flashcard limit reached`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(trialGuardService.checkAndIncrementFlashcardSet(userId))
            .thenThrow(TrialLimitExceededException("Free trial flashcard set limit of 1 reached"))

        assertThrows<TrialLimitExceededException> {
            flashcardService.createDeck(userId, CreateDeckRequest("Math Basics", Subject.MATH))
        }
    }

    @Test
    fun `getUserDecks returns decks with correct cardCount`() {
        val deck1 = testDeck()
        val deck2Id = UUID.randomUUID()
        val deck2 = FlashcardDeck(id = deck2Id, userId = userId, title = "Science", subject = Subject.SCIENCE)

        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(flashcardDeckRepository.findByUserId(userId)).thenReturn(listOf(deck1, deck2))
        whenever(flashcardCardRepository.countByDeckId(deckId)).thenReturn(5)
        whenever(flashcardCardRepository.countByDeckId(deck2Id)).thenReturn(3)

        val result = flashcardService.getUserDecks(userId)

        assertEquals(2, result.size)
        assertTrue(result.any { it.cardCount == 5 })
        assertTrue(result.any { it.cardCount == 3 })
    }

    @Test
    fun `getDeckWithCards returns deck and all cards for valid owner`() {
        val cards = listOf(testCard(), testCard(UUID.randomUUID()))

        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(flashcardDeckRepository.findByIdAndUserId(deckId, userId)).thenReturn(testDeck())
        whenever(flashcardCardRepository.findByDeckId(deckId)).thenReturn(cards)

        val result = flashcardService.getDeckWithCards(userId, deckId)

        assertEquals("Math Basics", result.deck.title)
        assertEquals(2, result.cards.size)
    }

    @Test
    fun `getDeckWithCards throws ResourceNotFoundException for wrong userId`() {
        val wrongUserId = UUID.randomUUID()
        whenever(subscriptionRepository.findByUserId(wrongUserId)).thenReturn(
            Subscription(userId = wrongUserId, tier = SubscriptionTier.PREMIUM, status = SubscriptionStatus.ACTIVE, exchangeLimit = 1000)
        )
        whenever(flashcardDeckRepository.findByIdAndUserId(deckId, wrongUserId)).thenReturn(null)

        assertThrows<ResourceNotFoundException> {
            flashcardService.getDeckWithCards(wrongUserId, deckId)
        }
    }

    @Test
    fun `updateDeck updates title and returns updated DeckResponse`() {
        val deck = testDeck()
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(flashcardDeckRepository.findByIdAndUserId(deckId, userId)).thenReturn(deck)
        whenever(flashcardDeckRepository.save(any<FlashcardDeck>())).thenAnswer { it.arguments[0] }
        whenever(flashcardCardRepository.countByDeckId(deckId)).thenReturn(3)

        val result = flashcardService.updateDeck(userId, deckId, UpdateDeckRequest("Advanced Math"))

        assertEquals("Advanced Math", result.title)
        assertEquals(3, result.cardCount)
    }

    @Test
    fun `deleteDeck deletes all cards before deleting deck`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(flashcardDeckRepository.findByIdAndUserId(deckId, userId)).thenReturn(testDeck())

        flashcardService.deleteDeck(userId, deckId)

        val inOrder = inOrder(flashcardCardRepository, flashcardDeckRepository)
        inOrder.verify(flashcardCardRepository).deleteByDeckId(deckId)
        inOrder.verify(flashcardDeckRepository).deleteById(deckId)
    }

    @Test
    fun `addCard saves card and returns CardResponse`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(flashcardDeckRepository.findByIdAndUserId(deckId, userId)).thenReturn(testDeck())
        whenever(flashcardCardRepository.save(any<FlashcardCard>())).thenAnswer { it.arguments[0] }

        val result = flashcardService.addCard(userId, deckId, CreateCardRequest("What is 3+3?", "6"))

        assertEquals("What is 3+3?", result.question)
        assertEquals("6", result.answer)
        assertEquals(deckId, result.deckId)
    }

    @Test
    fun `updateCard updates question and answer and returns CardResponse`() {
        val card = testCard()
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(flashcardDeckRepository.findByIdAndUserId(deckId, userId)).thenReturn(testDeck())
        whenever(flashcardCardRepository.findByIdAndDeckId(cardId, deckId)).thenReturn(card)
        whenever(flashcardCardRepository.save(any<FlashcardCard>())).thenAnswer { it.arguments[0] }

        val result = flashcardService.updateCard(userId, deckId, cardId, UpdateCardRequest("What is 5+5?", "10"))

        assertEquals("What is 5+5?", result.question)
        assertEquals("10", result.answer)
    }

    @Test
    fun `updateCard throws ResourceNotFoundException for card not in deck`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(flashcardDeckRepository.findByIdAndUserId(deckId, userId)).thenReturn(testDeck())
        whenever(flashcardCardRepository.findByIdAndDeckId(cardId, deckId)).thenReturn(null)

        assertThrows<ResourceNotFoundException> {
            flashcardService.updateCard(userId, deckId, cardId, UpdateCardRequest("Q", "A"))
        }
    }

    @Test
    fun `deleteCard deletes card successfully`() {
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(flashcardDeckRepository.findByIdAndUserId(deckId, userId)).thenReturn(testDeck())
        whenever(flashcardCardRepository.findByIdAndDeckId(cardId, deckId)).thenReturn(testCard())

        flashcardService.deleteCard(userId, deckId, cardId)

        verify(flashcardCardRepository).deleteById(cardId)
    }

    @Test
    fun `getDeckForGame returns all cards present`() {
        val cards = listOf(
            testCard(UUID.randomUUID()),
            testCard(UUID.randomUUID()),
            testCard(UUID.randomUUID())
        )

        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(premiumSubscription())
        whenever(flashcardDeckRepository.findByIdAndUserId(deckId, userId)).thenReturn(testDeck())
        whenever(flashcardCardRepository.findByDeckId(deckId)).thenReturn(cards)

        val result = flashcardService.getDeckForGame(userId, deckId)

        assertEquals(3, result.cards.size)
        assertEquals(cards.map { it.id }.toSet(), result.cards.map { it.cardId }.toSet())
    }
}
