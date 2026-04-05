package com.tutoriq.exception

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException::class)
    fun handleEmailAlreadyExists(ex: EmailAlreadyExistsException): ResponseEntity<Map<String, String>> =
        ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to ex.message!!))

    @ExceptionHandler(InvalidCredentialsException::class)
    fun handleInvalidCredentials(ex: InvalidCredentialsException): ResponseEntity<Map<String, String>> =
        ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to ex.message!!))

    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleResourceNotFound(ex: ResourceNotFoundException): ResponseEntity<Map<String, String>> =
        ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to ex.message!!))

    @ExceptionHandler(TrialLimitExceededException::class)
    fun handleTrialLimitExceeded(ex: TrialLimitExceededException): ResponseEntity<Map<String, String>> =
        ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(mapOf("error" to ex.message!!))

    @ExceptionHandler(ExchangeLimitExceededException::class)
    fun handleExchangeLimitExceeded(ex: ExchangeLimitExceededException): ResponseEntity<Map<String, String>> =
        ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(mapOf("error" to ex.message!!))

    @ExceptionHandler(FlashcardAccessDeniedException::class)
    fun handleFlashcardAccessDenied(ex: FlashcardAccessDeniedException): ResponseEntity<Map<String, String>> =
        ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to ex.message!!))

    @ExceptionHandler(PremiumFeatureException::class)
    fun handlePremiumFeature(ex: PremiumFeatureException): ResponseEntity<Map<String, String>> =
        ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to ex.message!!))

    @ExceptionHandler(UnauthorizedAccessException::class)
    fun handleUnauthorizedAccess(ex: UnauthorizedAccessException): ResponseEntity<Map<String, String>> =
        ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to ex.message!!))
}
