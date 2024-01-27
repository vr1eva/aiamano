import { useEffect, useState, useRef, useCallback } from "react";
import { sendAudio } from "@/actions";
import { blobToBase64, createMediaStream } from "@/lib/utils";

export const useRecordVoice = () => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [transcript, setTranscript] = useState<string>("");
  const [recording, setRecording] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const chunks = useRef<Blob[]>([]);

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      setProcessing(true);
    }
  };

  const getText = async (base64Data: string) => {
    if (!base64Data) {
      return;
    }
    try {
      const { transcript, success: audioTranscribed } = await sendAudio({
        base64Data,
      });
      if (!audioTranscribed || !transcript) {
        return;
      }
      setProcessing(false);
      setTranscript(transcript);
    } catch (error) {
      console.log(error);
    }
  };

  const initMediaRecorder = useCallback((stream: MediaStream) => {
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.onstart = () => {
      createMediaStream(stream);
      chunks.current = [];
    };

    mediaRecorder.ondataavailable = (evt) => {
      if (evt.data) {
        chunks.current.push(evt.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
      blobToBase64(audioBlob, getText);
    };

    setMediaRecorder(mediaRecorder);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(initMediaRecorder)
        .catch((error) => {
          console.error("Error accessing microphone:", error);
        });
    }
  }, [initMediaRecorder]);

  return { recording, startRecording, stopRecording, transcript, processing };
};
