"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scout9Webhooks = void 0;
const crypto_1 = require("crypto");
var Scout9Webhooks;
(function (Scout9Webhooks) {
    function constructEvent(rawBody, signatureKey, secretKey) {
        // Compute the HMAC
        const computedSignature = (0, crypto_1.createHmac)('sha256', secretKey)
            .update(rawBody)
            .digest('hex');
        // Verify signature
        if (computedSignature !== signatureKey) {
            throw new Error('Signature verification failed.');
        }
        return JSON.parse(rawBody.toString());
    }
    Scout9Webhooks.constructEvent = constructEvent;
})(Scout9Webhooks || (exports.Scout9Webhooks = Scout9Webhooks = {}));
