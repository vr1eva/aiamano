"use client";
import { MouseEventHandler, startTransition, useEffect } from "react";
import Image from "next/image";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const Microphone = ({
  addOptimisticTranscript,
  occupied,
  processing,
  startRecording, stopRecording, recording, transcript
}: {
  addOptimisticTranscript: Function,
  occupied: boolean,
  startRecording: MouseEventHandler<HTMLButtonElement>, stopRecording: MouseEventHandler<HTMLButtonElement>, recording: boolean, transcript: string, processing: boolean
}) => {


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
    <div className="flex gap-2 items-center my-4 pl-1">
      {processing || occupied ? (
        <>
          <button>
            <LoadingSpinner />
          </button>
          <p>Waiting for a response...</p>
        </>
      ) : (
        <>
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            className="border-none bg-transparent"
          >
            <Image
              src={recording ? "/recording.svg" : "/record.svg"}
              alt="record voice note"
              height={recording ? 64 : 48}
              width={recording ? 64 : 48}
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
