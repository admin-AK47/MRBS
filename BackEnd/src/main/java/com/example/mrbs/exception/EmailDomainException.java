package com.example.mrbs.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.io.Serial;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class EmailDomainException extends RuntimeException {

    @Serial
    private static final long serialVersionUID = 1L;

    public EmailDomainException(String message) {
        super(message);
    }
}