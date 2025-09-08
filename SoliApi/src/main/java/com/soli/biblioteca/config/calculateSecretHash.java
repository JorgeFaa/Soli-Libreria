package com.soli.biblioteca.config;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class calculateSecretHash {

    private static final String HMAC_SHA256_ALGORITHM = "HmacSHA256";

    public static String calculateSecretHash(String username, String clientId, String clientSecret) {
        try {
            // Crear clave secreta para HMAC
            SecretKeySpec signingKey = new SecretKeySpec(clientSecret.getBytes("UTF-8"), HMAC_SHA256_ALGORITHM);

            // Crear instancia de Mac
            Mac mac = Mac.getInstance(HMAC_SHA256_ALGORITHM);
            mac.init(signingKey);

            // Calcular HMAC SHA256 de username + clientId
            String message = username + clientId;
            byte[] rawHmac = mac.doFinal(message.getBytes("UTF-8"));

            // Convertir a Base64
            return Base64.getEncoder().encodeToString(rawHmac);

        } catch (Exception e) {
            throw new RuntimeException("Error calculando SECRET_HASH", e);
        }
    }
}
