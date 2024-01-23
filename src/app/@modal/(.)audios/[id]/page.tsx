import Modal from '@/components/modal';
import React from "react"
import { prisma } from "@/prisma"

export default async function AudioModal({
    params: { id: audioId },
}: {
    params: { id: string };
}) {
    const audio = await prisma.audio.findFirst({
        where: {
            id: parseInt(audioId)
        }
    })

    if (!audio) {
        return <span>A problem occurred fetching the audio message. Please try again.</span>
    }

    const base64String = audio.content.toString("base64")
    const audioSource = `data:audio/mpeg;base64,${base64String}`;
    return (
        <Modal>
            <audio controls>
                <source src={audioSource} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
        </Modal>
    )
}