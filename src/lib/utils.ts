import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const blobToBase64 = (blob: Blob, callback: (base64Data: string) => Promise<void>) => {
  const reader = new FileReader();
  reader.onload = function () {
    const base64Data = reader?.result?.toString().split(",")[1];
    if (!base64Data) {
      return
    }
    callback(base64Data);
  };
  reader.readAsDataURL(blob);
};

const getPeakLevel = (analyzer: AnalyserNode) => {
  const array = new Uint8Array(analyzer.fftSize);

  analyzer.getByteTimeDomainData(array);

  return (
    array.reduce((max, current) => Math.max(max, Math.abs(current - 127)), 0) /
    128
  );
};

export const createMediaStream = (stream: MediaStream) => {
  const context = new AudioContext();
  const source = context.createMediaStreamSource(stream);
  const analyzer = context.createAnalyser();
  source.connect(analyzer);

  const tick = () => {
    getPeakLevel(analyzer);

    requestAnimationFrame(tick);
  };
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

export async function scrollUntilElementIsVisible({ ref }: { ref: React.RefObject<HTMLElement | null> }) {
  if (ref && ref.current) {
    const element = ref.current
    const elementRect = element.getBoundingClientRect();
    const isVisible = (
      elementRect.top >= 0 &&
      elementRect.left >= 0 &&
      elementRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      elementRect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );

    if (!isVisible) {
      window.scrollTo({
        top: elementRect.top + window.scrollY,
        behavior: 'smooth'
      });
    }
  }
}

export function retrieveAssistant({ assistants, assistantId }: RetrieveAssistantArgs) {
  return
}