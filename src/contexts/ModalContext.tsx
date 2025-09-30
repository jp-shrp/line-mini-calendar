'use client'

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
} from 'react'
import Modal from '../components/Modal'

interface ModalOptions {
    title: string
    content?: string
    type?: 'default' | 'confirm' | 'error'
    closeText?: string
    okText?: string
    onOk?: () => void
    onClose?: () => void
}

interface ModalContextType {
    openModal: (options: ModalOptions) => void
    closeModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

interface ModalProviderProps {
    children: ReactNode
}

export function ModalProvider({ children }: ModalProviderProps) {
    const [modalState, setModalState] = useState<{
        isOpen: boolean
        options: ModalOptions | null
    }>({
        isOpen: false,
        options: null,
    })

    const openModal = useCallback((options: ModalOptions) => {
        setModalState({
            isOpen: true,
            options,
        })
    }, [])

    const closeModal = useCallback(() => {
        setModalState({
            isOpen: false,
            options: null,
        })
    }, [])

    const handleClose = useCallback(() => {
        modalState.options?.onClose?.()
        closeModal()
    }, [modalState.options, closeModal])

    const handleOk = useCallback(() => {
        modalState.options?.onOk?.()
        // onOkの中でcloseModal()を呼ぶかもしれないので、ここでは自動的に閉じない
    }, [modalState.options])

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {children}
            {modalState.isOpen && modalState.options && (
                <Modal
                    isOpen={modalState.isOpen}
                    title={modalState.options.title}
                    content={modalState.options.content}
                    type={modalState.options.type}
                    closeText={modalState.options.closeText}
                    okText={modalState.options.okText}
                    onOk={
                        modalState.options.type === 'confirm'
                            ? handleOk
                            : undefined
                    }
                    onClose={handleClose}
                />
            )}
        </ModalContext.Provider>
    )
}

export function useModal() {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider')
    }
    return context
}
