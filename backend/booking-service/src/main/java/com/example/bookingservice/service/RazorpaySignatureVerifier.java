package com.example.bookingservice.service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

final class RazorpaySignatureVerifier {
    private RazorpaySignatureVerifier() {}

    static boolean isValid(String secret, String orderId, String paymentId, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String expectedSignature = HexFormat.of().formatHex(
                    mac.doFinal((orderId + "|" + paymentId).getBytes(StandardCharsets.UTF_8)));
            return MessageDigest.isEqual(
                    expectedSignature.getBytes(StandardCharsets.US_ASCII),
                    signature.getBytes(StandardCharsets.US_ASCII));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to verify Razorpay payment signature", exception);
        }
    }
}
