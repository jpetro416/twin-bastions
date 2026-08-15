// Lightweight Web Audio sound engine for Twin Bastions
// No external assets required — pure synthesized SFX

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

function tone(
  freq: number,
  type: OscillatorType,
  duration: number,
  volume = 0.15,
  ramp = true
) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(volume, c.currentTime);
    if (ramp) {
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    }
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  } catch {
    // silent fail if audio not allowed
  }
}

function noise(duration: number, volume = 0.08) {
  try {
    const c = getCtx();
    const bufferSize = c.sampleRate * duration;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
    }
    const src = c.createBufferSource();
    src.buffer = buffer;
    const gain = c.createGain();
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    src.connect(gain);
    gain.connect(c.destination);
    src.start();
  } catch {}
}

export const sounds = {
  // UI
  click: () => tone(420, "square", 0.06, 0.06),
  select: () => {
    tone(520, "sine", 0.08, 0.08);
    setTimeout(() => tone(680, "sine", 0.07, 0.06), 50);
  },

  // Actions
  repair: () => {
    tone(280, "triangle", 0.15, 0.1);
    setTimeout(() => tone(360, "triangle", 0.2, 0.08), 80);
  },
  fire: () => {
    noise(0.12, 0.12);
    tone(90, "sawtooth", 0.18, 0.14);
    setTimeout(() => tone(60, "sawtooth", 0.25, 0.08), 40);
  },
  transfer: () => {
    tone(300, "sine", 0.1, 0.07);
    setTimeout(() => tone(450, "sine", 0.12, 0.07), 70);
    setTimeout(() => tone(600, "sine", 0.1, 0.05), 140);
  },
  boost: () => {
    tone(200, "square", 0.1, 0.08);
    setTimeout(() => tone(400, "square", 0.12, 0.1), 60);
    setTimeout(() => tone(800, "sine", 0.2, 0.07), 130);
  },

  // Combat / feedback
  hit: () => {
    noise(0.08, 0.1);
    tone(120, "sawtooth", 0.1, 0.12);
  },
  destroyColossus: () => {
    noise(0.3, 0.15);
    tone(80, "sawtooth", 0.4, 0.18);
    setTimeout(() => tone(40, "triangle", 0.5, 0.1), 100);
  },
  layerLost: () => {
    tone(150, "sawtooth", 0.25, 0.12);
    setTimeout(() => tone(90, "sawtooth", 0.35, 0.1), 120);
  },

  // Phase
  assaultStart: () => {
    tone(110, "sawtooth", 0.3, 0.12);
    setTimeout(() => tone(80, "sawtooth", 0.4, 0.1), 150);
    noise(0.4, 0.06);
  },
  pauseStart: () => {
    tone(440, "sine", 0.2, 0.08);
    setTimeout(() => tone(554, "sine", 0.25, 0.07), 100);
    setTimeout(() => tone(659, "sine", 0.3, 0.06), 200);
  },

  // End states
  victory: () => {
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => tone(f, "sine", 0.35, 0.1), i * 120);
    });
  },
  defeat: () => {
    tone(200, "sawtooth", 0.4, 0.12);
    setTimeout(() => tone(140, "sawtooth", 0.5, 0.12), 200);
    setTimeout(() => tone(80, "triangle", 0.8, 0.1), 450);
  },

  // Ambient tick (very quiet)
  tick: () => tone(180, "sine", 0.03, 0.02),
};
