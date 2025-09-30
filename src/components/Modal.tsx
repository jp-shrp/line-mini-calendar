'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import BaseButton from './BaseButton'

export interface ModalProps {
    isOpen: boolean
    title: string
    content?: string
    type?: 'default' | 'confirm' | 'error'
    closeText?: string
    okText?: string
    onOk?: () => void
    onClose?: () => void
}

export default function Modal({
    isOpen,
    title,
    content,
    type = 'default',
    closeText = '閉じる',
    okText = 'はい',
    onOk,
    onClose,
}: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose?.()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const getModalStyles = () => {
        const baseStyles = 'rounded-lg p-6 w-full max-w-md mx-4 shadow-xl'

        switch (type) {
            case 'error':
                return `${baseStyles} bg-red-50 border-2 border-red-200`
            case 'confirm':
                return `${baseStyles} bg-blue-50 border-2 border-blue-200`
            default:
                return `${baseStyles} bg-white border border-gray-200`
        }
    }

    const getTitleStyles = () => {
        const baseStyles = 'text-lg font-medium mb-4'

        switch (type) {
            case 'error':
                return `${baseStyles} text-red-800`
            case 'confirm':
                return `${baseStyles} text-blue-800`
            default:
                return `${baseStyles} text-gray-900`
        }
    }

    const getContentStyles = () => {
        const baseStyles = 'mb-6 text-sm leading-relaxed'

        switch (type) {
            case 'error':
                return `${baseStyles} text-red-700`
            case 'confirm':
                return `${baseStyles} text-blue-700`
            default:
                return `${baseStyles} text-gray-600`
        }
    }

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`${getModalStyles()} relative z-10`}>
                <div
                    className={getTitleStyles()}
                    dangerouslySetInnerHTML={{ __html: title }}
                />

                {content && (
                    <div
                        className={getContentStyles()}
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                )}

                <div className="flex justify-end gap-3">
                    {type === 'confirm' && onOk && (
                        <BaseButton
                            label={okText}
                            onClick={onOk}
                            variant="primary"
                            fullWidth={false}
                            className="min-w-[80px] px-6 py-2"
                        />
                    )}

                    <BaseButton
                        label={closeText}
                        onClick={onClose}
                        variant={type === 'confirm' ? 'secondary' : 'primary'}
                        fullWidth={false}
                        className="min-w-[80px] px-6 py-2"
                    />
                </div>
            </div>
        </div>
    )

    return createPortal(modalContent, document.body)
}
