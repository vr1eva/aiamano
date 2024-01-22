import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const blobToBase64 = (blob, callback) => {
  const reader = new FileReader();
  reader.onload = function () {
    const base64Data = reader?.result?.toString().split(",")[1];
    callback(base64Data);
  };
  reader.readAsDataURL(blob);
};

// Function to calculate the peak level from the analyzer data
const getPeakLevel = (analyzer) => {
  // Create a Uint8Array to store the audio data
  const array = new Uint8Array(analyzer.fftSize);

  // Get the time domain data from the analyzer and store it in the array
  analyzer.getByteTimeDomainData(array);

  // Calculate the peak level by finding the maximum absolute deviation from 127
  return (
    array.reduce((max, current) => Math.max(max, Math.abs(current - 127)), 0) /
    128
  );
};

export const createMediaStream = (stream, isRecording, callback) => {
  // Create a new AudioContext
  const context = new AudioContext();

  // Create a media stream source node from the input stream
  const source = context.createMediaStreamSource(stream);

  // Create an analyzer node for audio analysis
  const analyzer = context.createAnalyser();

  // Connect the source node to the analyzer node
  source.connect(analyzer);

  // Function to continuously analyze audio data and invoke the callback
  const tick = () => {
    // Calculate the peak level using the getPeakLevel function
    const peak = getPeakLevel(analyzer);

    if (isRecording) {
      callback(peak);

      // Request the next animation frame for continuous analysis
      requestAnimationFrame(tick);
    }
  };

  // Start the continuous analysis loop
  tick();
};
export async function streamToBuffer(
  stream: NodeJS.ReadableStream
): Promise<Buffer> {
  const chunks: Uint8Array[] = [];

  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: Uint8Array) => {
      chunks.push(chunk);
    });

    stream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
}