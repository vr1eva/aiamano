"use client";
import { MouseEventHandler, TouchEventHandler, startTransition, useEffect } from "react";
import Image from "next/image";

export const Microphone = ({
  addOptimisticTranscript,
  occupied,
  scrollToLastMessage,
  startRecording, stopRecording, recording, transcript, processing
}: {
  scrollToLastMessage: Function,
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
    <div className="flex gap-2 items-center my-4">
      {processing || occupied ? (
        <>
          <button>
            <Image
              src={"/processing.svg"}
              alt="processing icon"
              height={10}
              width={48}
            />
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
