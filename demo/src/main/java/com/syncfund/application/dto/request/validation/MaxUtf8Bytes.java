package com.syncfund.application.dto.request.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * El texto no puede ocupar más de {@code value} bytes en UTF-8.
 *
 * Existe porque @Size cuenta caracteres y BCrypt cuenta bytes: solo usa los primeros 72, y con
 * más lanza una excepción. Una tilde o una ñ ocupan 2 bytes y un emoji 4, así que una contraseña
 * de 40 caracteres puede pasar de 72 bytes. El texto null es válido: de eso se ocupa @NotBlank.
 */
@Documented
@Constraint(validatedBy = MaxUtf8BytesValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface MaxUtf8Bytes {

    int value();

    String message();

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
