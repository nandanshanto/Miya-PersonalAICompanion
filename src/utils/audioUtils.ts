let sharedAudioContext: AudioContext | null = null;

function getSharedAudioContext(): AudioContext | null {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    try {
      sharedAudioContext = new AudioContextClass({ sampleRate: 24000 });
    } catch {
      sharedAudioContext = new AudioContextClass();
    }
  }

  if (sharedAudioContext.state === "suspended") {
    sharedAudioContext.resume().catch(() => {});
  }

  return sharedAudioContext;
}

export async function playPCM(base64Data: string, volume: number = 1.0): Promise<void> {
  try {
    const audioCtx = getSharedAudioContext();
    if (!audioCtx) {
      console.warn("AudioContext not supported");
      return;
    }

    const binaryString = atob(base64Data);
    const len = binaryString.length;
    if (len === 0) return;

    // Ensure even number of bytes for 16-bit PCM
    const validLen = len % 2 === 0 ? len : len - 1;
    const bytes = new Uint8Array(validLen);
    for (let i = 0; i < validLen; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const numSamples = validLen / 2;
    if (numSamples === 0) return;

    const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const audioBuffer = audioCtx.createBuffer(1, numSamples, 24000);
    const channelData = audioBuffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      channelData[i] = dataView.getInt16(i * 2, true) / 32768.0;
    }

    // Smooth de-clicking micro window at head & tail to eliminate any pop/click/beep sound at end of speech
    const fadeSamples = Math.min(64, Math.floor(numSamples / 4));
    for (let i = 0; i < fadeSamples; i++) {
      const headFactor = i / fadeSamples;
      channelData[i] *= headFactor;

      const tailFactor = 1 - (i / fadeSamples);
      channelData[numSamples - 1 - i] *= tailFactor;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = audioCtx.createGain();
    const targetVol = Math.max(0, Math.min(1, volume));
    gainNode.gain.setValueAtTime(targetVol, audioCtx.currentTime);

    const duration = audioBuffer.duration;
    // Smooth ramp to 0 in last 12ms to guarantee zero audible pop/beep at speech finish
    if (duration > 0.03) {
      const fadeStart = audioCtx.currentTime + duration - 0.015;
      gainNode.gain.setValueAtTime(targetVol, fadeStart);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
    }

    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    source.start();

    return new Promise<void>((resolve) => {
      source.onended = () => {
        try {
          source.disconnect();
          gainNode.disconnect();
        } catch {}
        resolve();
      };
    });
  } catch (error) {
    console.error("Error playing audio:", error);
  }
}
