package com.tutoriq.exception

class EmailAlreadyExistsException(message: String) : RuntimeException(message)

class InvalidCredentialsException(message: String) : RuntimeException(message)

class ResourceNotFoundException(message: String) : RuntimeException(message)
