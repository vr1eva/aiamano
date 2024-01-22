"use client";
import { useEffect, useState, useRef } from "react";
import { sendAudio } from "@/actions";
import { blobToBase64, createMediaStream } from "@/lib/utils";

export const useRecordVoice = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcript, setTranscript] = useState("")
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const chunks = useRef([]);

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
    }
  };

  const getText = async (base64Data) => {
    setProcessing(true)
    try {
      const { transcript, success: audioTranscribed } = await sendAudio({ base64Data });
      if (!audioTranscribed || !transcript) {
        setProcessing(false)
        return
      }
      setTranscript(transcript)
    } catch (error) {
      console.log(error);
    }
    setProcessing(false)
  };

  const initMediaRecorder = (stream) => {
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.onstart = () => {
      createMediaStream(stream);
      chunks.current = [];
    };

    mediaRecorder.ondataavailable = (evt) => {
      chunks.current.push(evt.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
      blobToBase64(audioBlob, getText);
    };

    setMediaRecorder(mediaRecorder);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(initMediaRecorder);
    }
  }, []);

  return { recording, startRecording, stopRecording, transcript, processing };
};
