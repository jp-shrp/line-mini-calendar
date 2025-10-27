/**
 * LINE Signature Verification Tests
 *
 * @description
 * LINE署名検証ユーティリティのテスト
 */

import { describe, it, expect } from '@jest/globals'
import {
    verifyLineSignature,
    validateLineSignature,
} from '_shared/utils/line-signature'

describe('LINE Signature Verification Tests', () => {
    const testChannelSecret = 'test_channel_secret'
    const testBody = JSON.stringify({
        destination: 'test',
        events: [],
    })

    describe('verifyLineSignature', () => {
        it('正しい署名の場合、trueを返す', async () => {
            // Arrange
            const encoder = new TextEncoder()
            const key = await crypto.subtle.importKey(
                'raw',
                encoder.encode(testChannelSecret),
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            )
            const signed = await crypto.subtle.sign(
                'HMAC',
                key,
                encoder.encode(testBody)
            )
            const validSignature = btoa(
                String.fromCharCode(...new Uint8Array(signed))
            )

            // Act
            const result = await verifyLineSignature(
                testBody,
                validSignature,
                testChannelSecret
            )

            // Assert
            expect(result).toBe(true)
        })

        it('間違った署名の場合、falseを返す', async () => {
            // Arrange
            const invalidSignature = 'invalid_signature'

            // Act
            const result = await verifyLineSignature(
                testBody,
                invalidSignature,
                testChannelSecret
            )

            // Assert
            expect(result).toBe(false)
        })

        it('署名がnullの場合、falseを返す', async () => {
            // Act
            const result = await verifyLineSignature(
                testBody,
                null,
                testChannelSecret
            )

            // Assert
            expect(result).toBe(false)
        })

        it('署名が空文字の場合、falseを返す', async () => {
            // Act
            const result = await verifyLineSignature(
                testBody,
                '',
                testChannelSecret
            )

            // Assert
            expect(result).toBe(false)
        })

        it('異なるbodyの場合、falseを返す', async () => {
            // Arrange
            const encoder = new TextEncoder()
            const key = await crypto.subtle.importKey(
                'raw',
                encoder.encode(testChannelSecret),
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            )
            const signed = await crypto.subtle.sign(
                'HMAC',
                key,
                encoder.encode(testBody)
            )
            const validSignature = btoa(
                String.fromCharCode(...new Uint8Array(signed))
            )

            const differentBody = JSON.stringify({
                destination: 'different',
                events: [],
            })

            // Act
            const result = await verifyLineSignature(
                differentBody,
                validSignature,
                testChannelSecret
            )

            // Assert
            expect(result).toBe(false)
        })

        it('異なるChannel Secretの場合、falseを返す', async () => {
            // Arrange
            const encoder = new TextEncoder()
            const key = await crypto.subtle.importKey(
                'raw',
                encoder.encode(testChannelSecret),
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            )
            const signed = await crypto.subtle.sign(
                'HMAC',
                key,
                encoder.encode(testBody)
            )
            const validSignature = btoa(
                String.fromCharCode(...new Uint8Array(signed))
            )

            const differentChannelSecret = 'different_secret'

            // Act
            const result = await verifyLineSignature(
                testBody,
                validSignature,
                differentChannelSecret
            )

            // Assert
            expect(result).toBe(false)
        })
    })

    describe('validateLineSignature', () => {
        it('正しい署名の場合、エラーをthrowしない', async () => {
            // Arrange
            const encoder = new TextEncoder()
            const key = await crypto.subtle.importKey(
                'raw',
                encoder.encode(testChannelSecret),
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            )
            const signed = await crypto.subtle.sign(
                'HMAC',
                key,
                encoder.encode(testBody)
            )
            const validSignature = btoa(
                String.fromCharCode(...new Uint8Array(signed))
            )

            // Act & Assert
            await expect(
                validateLineSignature(
                    testBody,
                    validSignature,
                    testChannelSecret
                )
            ).resolves.not.toThrow()
        })

        it('間違った署名の場合、エラーをthrowする', async () => {
            // Arrange
            const invalidSignature = 'invalid_signature'

            // Act & Assert
            await expect(
                validateLineSignature(
                    testBody,
                    invalidSignature,
                    testChannelSecret
                )
            ).rejects.toThrow('Invalid LINE signature')
        })

        it('署名がnullの場合、エラーをthrowする', async () => {
            // Act & Assert
            await expect(
                validateLineSignature(testBody, null, testChannelSecret)
            ).rejects.toThrow('Invalid LINE signature')
        })

        it('署名が空文字の場合、エラーをthrowする', async () => {
            // Act & Assert
            await expect(
                validateLineSignature(testBody, '', testChannelSecret)
            ).rejects.toThrow('Invalid LINE signature')
        })
    })
})
