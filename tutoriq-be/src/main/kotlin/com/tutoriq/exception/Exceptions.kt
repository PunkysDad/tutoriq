package com.tutoriq.exception

class EmailAlreadyExistsException(message: String) : RuntimeException(message)

class InvalidCredentialsException(message: String) : RuntimeException(message)

class ResourceNotFoundException(message: String) : RuntimeException(message)

class TrialLimitExceededException(message: String) : RuntimeException(message)

class ExchangeLimitExceededException(message: String) : RuntimeException(message)

class FlashcardAccessDeniedException(message: String) : RuntimeException(message)

class PremiumFeatureException(message: String = "This feature requires a Premium subscription") : RuntimeException(message)

class UnauthorizedAccessException(message: String = "You do not have permission to access this resource") : RuntimeException(message)
