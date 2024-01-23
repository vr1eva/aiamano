
import { useEffect, useState } from 'react';

const AudioPlayer = ({ audioBuffer }: { audioBuffer: Buffer }) => {

    const generateBase64String = (byteArray) => {
        const uint8Array = new Uint8Array(byteArray);
        const base64String = btoa(String.fromCharCode.apply(null, uint8Array));
        return `data:audio/mpeg;base64,${base64String}`;
    };

    return (
        <div>
            {audioBuffer && (
                <audio controls>
                    <source src={generateBase64String(audioBuffer)} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
            )}
        </div>
    );
};

export default AudioPlayer;