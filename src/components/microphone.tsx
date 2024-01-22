"use client";
import { useEffect } from "react"
import { useRecordVoice } from "@/hooks/useRecordVoice";
import Image from "next/image";

export const Microphone = ({ addOptimisticMessage }: { addOptimisticMessage: Function }) => {
  const { startRecording, stopRecording, recording, transcript, processing } = useRecordVoice();

  useEffect(() => {
    if (transcript) {
      addOptimisticMessage({
        role: "user",
        content: transcript,
      })
    }
  }, [transcript, addOptimisticMessage])
  return (
    <div className="flex gap-2 items-center my-4">
      {processing ? <>
        <button>
          <Image src={"/processing.svg"} alt="processing icon" height={32} width={32} />
        </button>
        <p>Processing audio...</p>
      </> :
        <>
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className="border-none bg-transparent"
          >
            <Image src={recording ? "/recording.svg" : "/record.svg"} alt="record voice note" height={32} width={32} />
          </button>
          <p className="shrink-0">{recording ? "Listening..." : "Press and hold to record a message"}</p >
        </>
      }
    </div>
  )
};
