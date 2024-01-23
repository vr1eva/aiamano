import Modal from '@/components/modal';
import React from "react"

export default function AudioModal({
    params: { id: audioId },
}: {
    params: { id: string };
}) {
    return (
        <Modal>
            <p>{audioId}</p>
        </Modal>
    )
}