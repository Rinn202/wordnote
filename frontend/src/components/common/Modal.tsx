import React, { useEffect } from 'react';

interface Props {
    open: boolean;
    title?: string;
    onClose: () => void;
    children: React.ReactNode;
    width?: number;
}

export default function Modal({ open, title, onClose, children, width = 400 }: Props) {
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-box"
                style={{ width: `${width}px`, maxWidth: '90vw', overflow: 'hidden' }}
                onClick={e => e.stopPropagation()}
            >
                {title && (
                    <div className="modal-header">
                        <span className="modal-title">{title}</span>
                        <button className="icon-btn" onClick={onClose} aria-label="닫기">
                            <i className="ti ti-x" aria-hidden="true" />
                        </button>
                    </div>
                )}
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}