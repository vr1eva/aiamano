"use client";
import { startTransition, useEffect } from "react";
import { useRecordVoice } from "@/hooks/useRecordVoice";
import Image from "next/image";

export const Microphone = ({
  addOptimisticTranscript,
  occupied,
  scrollToLastMessage,
}: {
  scrollToLastMessage: Function;
  addOptimisticTranscript: Function;
  occupied: boolean;
}) => {
  const { startRecording, stopRecording, recording, transcript, processing } =
    useRecordVoice();

  useEffect(() => {
    if (transcript) {
      startTransition(() => {
        addOptimisticTranscript({
          content: transcript,
          role: "user",
        });
      });
    }
  }, [transcript, addOptimisticTranscript]);
  return (
    <div className="flex gap-2 items-center my-4">
      {processing || occupied ? (
        <>
          <button>
            <Image
              src={"/processing.svg"}
              alt="processing icon"
              height={32}
              width={32}
            />
          </button>
          <p>Waiting...</p>
        </>
      ) : (
        <>
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className="border-none bg-transparent"
          >
            <Image
              src={recording ? "/recording.svg" : "/record.svg"}
              alt="record voice note"
              height={32}
              width={32}
            />
          </button>
          <p className="shrink-0">
            {recording ? "Listening..." : "Press and hold to record a message"}
          </p>
        </>
      )}
    </div>
  );
};
