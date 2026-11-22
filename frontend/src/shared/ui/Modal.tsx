
import type { ReactNode } from 'react'

interface ModalProps {
    isOpen: boolean
    title: string
    children: ReactNode
    onClose: () => void
}

export function Modal({
                          isOpen,
                          title,
                          children,
                          onClose,
                      }: ModalProps) {
    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="presentation"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 id="modal-title" className="text-lg font-semibold">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar ventana"
                        className="text-xl text-gray-500 hover:text-gray-800"
                    >
                        ×
                    </button>
                </div>

                {children}
            </div>
        </div>
    )
}
