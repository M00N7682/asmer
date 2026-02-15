/**
 * Procedural ambient sound generators using Web Audio API.
 * Each sound is built from noise sources + filters + LFOs.
 * No audio files needed — everything is synthesized in real-time.
 */

import { createNoiseBuffer, type NoiseType } from "./noise-generator";

export interface ProceduralSound {
  output: GainNode;
  stop(): void;
}

// ── Helpers ──────────────────────────────────────────────

function loopNoise(ctx: AudioContext, type: NoiseType, dur = 4): AudioBufferSourceNode {
  const buffer = createNoiseBuffer(ctx, type, dur);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.start();
  return src;
}

function lfo(ctx: AudioContext, freq: number, amount: number, target: AudioParam) {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.value = amount;
  osc.connect(g).connect(target);
  osc.start();
  return osc;
}

function bpf(ctx: AudioContext, freq: number, q = 1): BiquadFilterNode {
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

function lpf(ctx: AudioContext, freq: number, q = 0.7): BiquadFilterNode {
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

function hpf(ctx: AudioContext, freq: number, q = 0.7): BiquadFilterNode {
  const f = ctx.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

function gain(ctx: AudioContext, val: number): GainNode {
  const g = ctx.createGain();
  g.gain.value = val;
  return g;
}

/** Generate a buffer with random short impulses baked in */
function createImpulseBuffer(
  ctx: AudioContext,
  dur: number,
  density: number,
  impulseLen: number,
  decayRate: number
): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = sr * dur;
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  const count = Math.floor(dur * density);
  for (let i = 0; i < count; i++) {
    const pos = Math.floor(Math.random() * len);
    const samples = Math.floor(sr * impulseLen);
    const amp = 0.3 + Math.random() * 0.7;
    for (let j = 0; j < samples && pos + j < len; j++) {
      data[pos + j] += (Math.random() * 2 - 1) * amp * Math.exp(-j * decayRate / samples);
    }
  }
  return buf;
}

/** Generate a buffer with periodic ticks */
function createTickBuffer(
  ctx: AudioContext,
  dur: number,
  interval: number,
  tickFreq: number,
  tickLen: number
): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = sr * dur;
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  const tickSamples = Math.floor(sr * tickLen);
  for (let t = 0; t < dur; t += interval) {
    const pos = Math.floor(t * sr);
    for (let j = 0; j < tickSamples && pos + j < len; j++) {
      const env = Math.exp(-j * 8 / tickSamples);
      data[pos + j] = Math.sin(2 * Math.PI * tickFreq * j / sr) * env * 0.6;
    }
  }
  return buf;
}

function loopBuffer(ctx: AudioContext, buf: AudioBuffer): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  src.start();
  return src;
}

type Stoppable = AudioBufferSourceNode | OscillatorNode;

class SoundBuilder {
  private ctx: AudioContext;
  private sources: Stoppable[] = [];
  private nodes: AudioNode[] = [];
  output: GainNode;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.output = ctx.createGain();
  }

  noise(type: NoiseType, dur = 4) {
    const src = loopNoise(this.ctx, type, dur);
    this.sources.push(src);
    return src;
  }

  buffer(buf: AudioBuffer) {
    const src = loopBuffer(this.ctx, buf);
    this.sources.push(src);
    return src;
  }

  lfo(freq: number, amount: number, target: AudioParam) {
    const osc = lfo(this.ctx, freq, amount, target);
    this.sources.push(osc);
    return osc;
  }

  lpf(freq: number, q = 0.7) { const n = lpf(this.ctx, freq, q); this.nodes.push(n); return n; }
  hpf(freq: number, q = 0.7) { const n = hpf(this.ctx, freq, q); this.nodes.push(n); return n; }
  bpf(freq: number, q = 1) { const n = bpf(this.ctx, freq, q); this.nodes.push(n); return n; }
  gain(val: number) { const n = gain(this.ctx, val); this.nodes.push(n); return n; }

  chain(...nodes: AudioNode[]): AudioNode {
    for (let i = 0; i < nodes.length - 1; i++) {
      nodes[i].connect(nodes[i + 1] as AudioNode);
    }
    return nodes[nodes.length - 1];
  }

  toOutput(node: AudioNode) {
    node.connect(this.output);
  }

  build(): ProceduralSound {
    const out = this.output;
    const sources = this.sources;
    const nodes = this.nodes;
    return {
      output: out,
      stop() {
        sources.forEach(s => { try { s.stop(); } catch {} s.disconnect(); });
        nodes.forEach(n => n.disconnect());
        out.disconnect();
      },
    };
  }
}

// ── Sound Generators ─────────────────────────────────────

/** Rain: pink noise base + white noise high-freq droplets */
function createRain(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);

  // Base layer: filtered pink noise
  const base = b.noise("pink");
  const f1 = b.bpf(1200, 0.4);
  const g1 = b.gain(0.55);
  b.toOutput(b.chain(base, f1, g1));

  // Droplets layer: white noise through highpass
  const drops = b.noise("white");
  const f2 = b.hpf(5000);
  const g2 = b.gain(0.12);
  b.toOutput(b.chain(drops, f2, g2));

  // Subtle low rumble
  const rumble = b.noise("brown");
  const f3 = b.lpf(250);
  const g3 = b.gain(0.15);
  b.toOutput(b.chain(rumble, f3, g3));

  return b.build();
}

/** Wind: brown noise with LFO-modulated lowpass */
function createWind(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);

  const noise = b.noise("brown");
  const f = b.lpf(500, 0.5);
  const g1 = b.gain(0.65);
  b.lfo(0.15, 300, f.frequency);
  b.toOutput(b.chain(noise, f, g1));

  // Gentle high whistle
  const whistle = b.noise("white");
  const f2 = b.bpf(3000, 2);
  const g2 = b.gain(0.04);
  b.lfo(0.2, 0.02, g2.gain);
  b.toOutput(b.chain(whistle, f2, g2));

  return b.build();
}

/** Waves: pink noise with slow amplitude oscillation */
function createWaves(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);

  const noise = b.noise("pink");
  const f = b.lpf(600);
  const g1 = b.gain(0.5);
  b.lfo(0.08, 0.25, g1.gain); // Slow ebb and flow
  b.toOutput(b.chain(noise, f, g1));

  // Foam/hiss at wave peaks
  const foam = b.noise("white");
  const f2 = b.hpf(3000);
  const g2 = b.gain(0.06);
  b.lfo(0.08, 0.04, g2.gain);
  b.toOutput(b.chain(foam, f2, g2));

  return b.build();
}

/** Thunder: deep rumble with random low-frequency bursts */
function createThunder(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);

  // Constant deep rumble
  const rumble = b.noise("brown");
  const f = b.lpf(150);
  const g1 = b.gain(0.5);
  b.lfo(0.03, 0.2, g1.gain);
  b.toOutput(b.chain(rumble, f, g1));

  // Distant roll layer
  const roll = b.noise("brown", 8);
  const f2 = b.bpf(80, 0.5);
  const g2 = b.gain(0.35);
  b.lfo(0.07, 0.2, g2.gain);
  b.toOutput(b.chain(roll, f2, g2));

  // Rain-like background
  const rain = b.noise("pink");
  const f3 = b.bpf(1000, 0.3);
  const g3 = b.gain(0.15);
  b.toOutput(b.chain(rain, f3, g3));

  return b.build();
}

/** Birds: chirp buffer + gentle white noise background */
function createBirds(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);

  // Generate chirp buffer
  const sr = ctx.sampleRate;
  const dur = 8;
  const len = sr * dur;
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);

  // Create random chirps
  const numChirps = 20;
  for (let c = 0; c < numChirps; c++) {
    const pos = Math.floor(Math.random() * len);
    const chirpDur = 0.03 + Math.random() * 0.08;
    const chirpSamples = Math.floor(sr * chirpDur);
    const startFreq = 2000 + Math.random() * 3000;
    const endFreq = startFreq + (Math.random() - 0.5) * 2000;
    const amp = 0.3 + Math.random() * 0.4;

    for (let j = 0; j < chirpSamples && pos + j < len; j++) {
      const t = j / chirpSamples;
      const freq = startFreq + (endFreq - startFreq) * t;
      const env = Math.sin(Math.PI * t); // Bell envelope
      data[pos + j] += Math.sin(2 * Math.PI * freq * j / sr) * env * amp;
    }

    // Sometimes add a second note (trill)
    if (Math.random() > 0.5) {
      const gap = Math.floor(sr * (0.05 + Math.random() * 0.05));
      const pos2 = pos + chirpSamples + gap;
      const chirpSamples2 = Math.floor(sr * (0.02 + Math.random() * 0.04));
      const freq2 = startFreq + (Math.random() - 0.3) * 1000;
      for (let j = 0; j < chirpSamples2 && pos2 + j < len; j++) {
        const t = j / chirpSamples2;
        const env = Math.sin(Math.PI * t);
        data[pos2 + j] += Math.sin(2 * Math.PI * freq2 * j / sr) * env * amp * 0.7;
      }
    }
  }

  const chirps = b.buffer(buf);
  const g1 = b.gain(0.25);
  b.toOutput(b.chain(chirps, g1));

  // Ambient air
  const air = b.noise("white");
  const f = b.bpf(5000, 0.3);
  const g2 = b.gain(0.02);
  b.toOutput(b.chain(air, f, g2));

  return b.build();
}

/** Campfire: crackle impulses + warm brown noise base */
function createCampfire(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);

  // Warm base
  const base = b.noise("brown");
  const f1 = b.bpf(400, 0.8);
  const g1 = b.gain(0.35);
  b.toOutput(b.chain(base, f1, g1));

  // Crackle layer: pre-generated impulse buffer
  const crackleBuf = createImpulseBuffer(ctx, 6, 25, 0.008, 6);
  const crackle = b.buffer(crackleBuf);
  const f2 = b.hpf(2000);
  const g2 = b.gain(0.4);
  b.toOutput(b.chain(crackle, f2, g2));

  // Pop layer: lower density, louder
  const popBuf = createImpulseBuffer(ctx, 8, 4, 0.015, 4);
  const pops = b.buffer(popBuf);
  const f3 = b.bpf(1200, 1.5);
  const g3 = b.gain(0.3);
  b.toOutput(b.chain(pops, f3, g3));

  return b.build();
}

/** Forest: gentle wind + distant birds + leaves rustling */
function createForest(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);

  // Wind through trees
  const wind = b.noise("brown");
  const f1 = b.lpf(400);
  const g1 = b.gain(0.3);
  b.lfo(0.1, 150, f1.frequency);
  b.toOutput(b.chain(wind, f1, g1));

  // Leaves rustling
  const leaves = b.noise("white");
  const f2 = b.hpf(4000);
  const g2 = b.gain(0.04);
  b.lfo(0.3, 0.02, g2.gain);
  b.toOutput(b.chain(leaves, f2, g2));

  // Distant bird chirps
  const sr = ctx.sampleRate;
  const dur = 8;
  const chirpBuf = ctx.createBuffer(1, sr * dur, sr);
  const data = chirpBuf.getChannelData(0);
  for (let c = 0; c < 8; c++) {
    const pos = Math.floor(Math.random() * sr * dur);
    const samples = Math.floor(sr * (0.04 + Math.random() * 0.06));
    const freq = 2500 + Math.random() * 2000;
    for (let j = 0; j < samples && pos + j < sr * dur; j++) {
      const t = j / samples;
      data[pos + j] = Math.sin(2 * Math.PI * freq * j / sr) * Math.sin(Math.PI * t) * 0.15;
    }
  }
  const chirps = b.buffer(chirpBuf);
  const g3 = b.gain(0.2);
  b.toOutput(b.chain(chirps, g3));

  return b.build();
}

/** Creek: high-filtered noise with gentle modulation */
function createCreek(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);

  // Water flow
  const flow = b.noise("white");
  const f1 = b.bpf(2500, 0.5);
  const g1 = b.gain(0.2);
  b.lfo(0.25, 0.08, g1.gain);
  b.toOutput(b.chain(flow, f1, g1));

  // Babble: pink noise midrange
  const babble = b.noise("pink");
  const f2 = b.bpf(1200, 0.8);
  const g2 = b.gain(0.15);
  b.lfo(0.4, 0.06, g2.gain);
  b.toOutput(b.chain(babble, f2, g2));

  // Low water body
  const body = b.noise("brown");
  const f3 = b.lpf(300);
  const g3 = b.gain(0.1);
  b.toOutput(b.chain(body, f3, g3));

  return b.build();
}

/** Cafe: murmur layers + subtle clinks */
function createCafe(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);

  // Murmur base
  const murmur = b.noise("pink");
  const f1 = b.bpf(600, 0.4);
  const g1 = b.gain(0.35);
  b.toOutput(b.chain(murmur, f1, g1));

  // Higher murmur layer
  const hi = b.noise("pink", 6);
  const f2 = b.bpf(1800, 0.6);
  const g2 = b.gain(0.1);
  b.lfo(0.15, 0.04, g2.gain);
  b.toOutput(b.chain(hi, f2, g2));

  // Low ambient hum
  const hum = b.noise("brown");
  const f3 = b.lpf(200);
  const g3 = b.gain(0.12);
  b.toOutput(b.chain(hum, f3, g3));

  // Subtle clinks
  const clinkBuf = createImpulseBuffer(ctx, 8, 2, 0.005, 10);
  const clinks = b.buffer(clinkBuf);
  const f4 = b.bpf(4000, 3);
  const g4 = b.gain(0.08);
  b.toOutput(b.chain(clinks, f4, g4));

  return b.build();
}

/** Keyboard: random key press clicks */
function createKeyboard(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);

  // Keypress buffer: short clicks at random intervals
  const sr = ctx.sampleRate;
  const dur = 6;
  const len = sr * dur;
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);

  // ~5-8 keys per second with clusters
  let t = 0;
  while (t < dur) {
    const pos = Math.floor(t * sr);
    const clickLen = Math.floor(sr * (0.003 + Math.random() * 0.006));
    const amp = 0.4 + Math.random() * 0.4;
    const freq = 3000 + Math.random() * 2000;

    for (let j = 0; j < clickLen && pos + j < len; j++) {
      const env = Math.exp(-j * 12 / clickLen);
      data[pos + j] = (Math.random() * 0.6 + Math.sin(2 * Math.PI * freq * j / sr) * 0.4) * env * amp;
    }

    // Variable timing: sometimes fast burst, sometimes pause
    if (Math.random() > 0.7) {
      t += 0.3 + Math.random() * 0.5; // Pause
    } else {
      t += 0.08 + Math.random() * 0.15; // Fast typing
    }
  }

  const keys = b.buffer(buf);
  const g1 = b.gain(0.3);
  b.toOutput(b.chain(keys, g1));

  // Subtle room tone
  const room = b.noise("pink");
  const f = b.lpf(500);
  const g2 = b.gain(0.03);
  b.toOutput(b.chain(room, f, g2));

  return b.build();
}

/** Train: rhythmic rumble + clickety-clack */
function createTrain(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);

  // Base rumble
  const rumble = b.noise("brown");
  const f1 = b.lpf(200);
  const g1 = b.gain(0.45);
  b.lfo(0.05, 0.15, g1.gain); // Slow sway
  b.toOutput(b.chain(rumble, f1, g1));

  // Rhythmic clickety-clack
  const sr = ctx.sampleRate;
  const dur = 4;
  const interval = 0.6; // Regular rail joints
  const buf = ctx.createBuffer(1, sr * dur, sr);
  const data = buf.getChannelData(0);

  for (let t = 0; t < dur; t += interval) {
    // Double click: click-clack
    for (let k = 0; k < 2; k++) {
      const offset = k * 0.12;
      const pos = Math.floor((t + offset) * sr);
      const clickSamples = Math.floor(sr * 0.015);
      const freq = k === 0 ? 800 : 600;
      for (let j = 0; j < clickSamples && pos + j < sr * dur; j++) {
        const env = Math.exp(-j * 6 / clickSamples);
        data[pos + j] = Math.sin(2 * Math.PI * freq * j / sr) * env * 0.5;
      }
    }
  }

  const clicks = b.buffer(buf);
  const g2 = b.gain(0.35);
  b.toOutput(b.chain(clicks, g2));

  // Wind whoosh through windows
  const wind = b.noise("white");
  const f2 = b.bpf(2000, 0.5);
  const g3 = b.gain(0.06);
  b.toOutput(b.chain(wind, f2, g3));

  return b.build();
}

/** Clock: regular tick-tock */
function createClock(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);

  // Tick-tock buffer
  const dur = 4;
  const tickBuf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = tickBuf.getChannelData(0);
  const sr = ctx.sampleRate;

  for (let t = 0; t < dur; t += 1) {
    const isTick = Math.floor(t) % 2 === 0;
    const freq = isTick ? 800 : 600;
    const pos = Math.floor(t * sr);
    const samples = Math.floor(sr * 0.01);

    for (let j = 0; j < samples && pos + j < sr * dur; j++) {
      const env = Math.exp(-j * 10 / samples);
      data[pos + j] = Math.sin(2 * Math.PI * freq * j / sr) * env * 0.8;
    }
  }

  const ticks = b.buffer(tickBuf);
  const g1 = b.gain(0.4);
  b.toOutput(b.chain(ticks, g1));

  // Very subtle room ambience
  const room = b.noise("brown");
  const f = b.lpf(150);
  const g2 = b.gain(0.03);
  b.toOutput(b.chain(room, f, g2));

  return b.build();
}

/** City: traffic noise + distant horns */
function createCity(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);

  // Traffic base
  const traffic = b.noise("pink");
  const f1 = b.bpf(800, 0.3);
  const g1 = b.gain(0.3);
  b.lfo(0.1, 0.1, g1.gain);
  b.toOutput(b.chain(traffic, f1, g1));

  // Low rumble (heavy vehicles)
  const heavy = b.noise("brown");
  const f2 = b.lpf(250);
  const g2 = b.gain(0.2);
  b.lfo(0.06, 0.08, g2.gain);
  b.toOutput(b.chain(heavy, f2, g2));

  // Higher city ambience
  const ambience = b.noise("white");
  const f3 = b.bpf(3000, 0.5);
  const g3 = b.gain(0.04);
  b.toOutput(b.chain(ambience, f3, g3));

  return b.build();
}

/** ASMR Typing: soft, delicate key sounds */
function createAsmrTyping(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);

  const sr = ctx.sampleRate;
  const dur = 8;
  const len = sr * dur;
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);

  let t = 0;
  while (t < dur) {
    const pos = Math.floor(t * sr);
    const clickLen = Math.floor(sr * (0.004 + Math.random() * 0.008));
    const amp = 0.15 + Math.random() * 0.2;
    const freq = 2000 + Math.random() * 2000;

    for (let j = 0; j < clickLen && pos + j < len; j++) {
      const env = Math.exp(-j * 8 / clickLen);
      data[pos + j] = Math.sin(2 * Math.PI * freq * j / sr) * env * amp;
    }

    if (Math.random() > 0.6) {
      t += 0.4 + Math.random() * 0.8;
    } else {
      t += 0.1 + Math.random() * 0.2;
    }
  }

  const keys = b.buffer(buf);
  const f1 = b.lpf(6000);
  const g1 = b.gain(0.25);
  b.toOutput(b.chain(keys, f1, g1));

  // Soft desk ambience
  const room = b.noise("pink");
  const f2 = b.lpf(400);
  const g2 = b.gain(0.02);
  b.toOutput(b.chain(room, f2, g2));

  return b.build();
}

/** ASMR Whisper: breathy filtered noise with breathing rhythm */
function createAsmrWhisper(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);

  // Breath layer
  const breath = b.noise("pink");
  const f1 = b.bpf(2000, 0.6);
  const g1 = b.gain(0.2);
  b.lfo(0.4, 0.12, g1.gain); // Breathing rhythm
  b.toOutput(b.chain(breath, f1, g1));

  // Sibilance
  const sib = b.noise("white");
  const f2 = b.bpf(5000, 1);
  const g2 = b.gain(0.06);
  b.lfo(0.4, 0.03, g2.gain);
  b.toOutput(b.chain(sib, f2, g2));

  // Warmth
  const warm = b.noise("brown");
  const f3 = b.lpf(300);
  const g3 = b.gain(0.08);
  b.toOutput(b.chain(warm, f3, g3));

  return b.build();
}

/** ASMR Fabric: soft rustling sounds */
function createAsmrFabric(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);

  // Rustle base
  const rustle = b.noise("white");
  const f1 = b.hpf(3000);
  const g1 = b.gain(0.1);
  b.lfo(2.5, 0.06, g1.gain); // Fast rustling modulation
  b.toOutput(b.chain(rustle, f1, g1));

  // Texture layer
  const tex = b.noise("pink");
  const f2 = b.bpf(4000, 1.2);
  const g2 = b.gain(0.08);
  b.lfo(1.8, 0.05, g2.gain);
  b.toOutput(b.chain(tex, f2, g2));

  // Slow movement rhythm
  const move = b.noise("white");
  const f3 = b.bpf(6000, 0.8);
  const g3 = b.gain(0.04);
  b.lfo(0.3, 0.03, g3.gain);
  b.toOutput(b.chain(move, f3, g3));

  return b.build();
}

// ── Nature (new) ────────────────────────────────────────

/** Heavy Rain: wall of rain — louder, wider, deeper than normal rain */
function createHeavyRain(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Wide, powerful rain body
  const base = b.noise("pink");
  const f1 = b.bpf(600, 0.3); // Very wide band
  const g1 = b.gain(0.7);
  b.toOutput(b.chain(base, f1, g1));
  // Dense droplets — full-spectrum
  const drops = b.noise("white");
  const g2 = b.gain(0.25);
  b.toOutput(b.chain(drops, g2));
  // Deep thunder-like rumble with slow swell
  const rumble = b.noise("brown");
  const f3 = b.lpf(180);
  const g3 = b.gain(0.4);
  b.lfo(0.06, 0.15, g3.gain);
  b.toOutput(b.chain(rumble, f3, g3));
  return b.build();
}

/** Drizzle: sparse individual drops on a quiet background */
function createDrizzle(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Very light background mist
  const mist = b.noise("pink");
  const f1 = b.bpf(3000, 2); // Narrow, high — airy
  const g1 = b.gain(0.12);
  b.toOutput(b.chain(mist, f1, g1));
  // Sparse individual drops — key signature
  const dropBuf = createImpulseBuffer(ctx, 8, 4, 0.008, 12);
  const drops = b.buffer(dropBuf);
  const f2 = b.bpf(5000, 3); // Resonant high drops
  const g2 = b.gain(0.2);
  b.toOutput(b.chain(drops, f2, g2));
  return b.build();
}

/** Rain on Tent: rapid pattering on fabric with hollow resonance */
function createRainOnTent(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Fabric resonance — the signature
  const base = b.noise("pink");
  const f1 = b.bpf(1200, 4); // High Q = hollow tent resonance
  const g1 = b.gain(0.35);
  b.toOutput(b.chain(base, f1, g1));
  // Dense rapid pattering — faster than normal rain
  const patterBuf = createImpulseBuffer(ctx, 4, 45, 0.004, 7);
  const patter = b.buffer(patterBuf);
  const f2 = b.bpf(2200, 3); // Resonant mid-high
  const g2 = b.gain(0.35);
  b.toOutput(b.chain(patter, f2, g2));
  // Enclosed bass — hollow body
  const body = b.noise("brown");
  const f3 = b.bpf(200, 2); // Bandpass, not lowpass — hollow
  const g3 = b.gain(0.2);
  b.toOutput(b.chain(body, f3, g3));
  return b.build();
}

/** Rain on Window: sharp taps on glass with room warmth */
function createRainOnWindow(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Glass taps — sharp, high, resonant
  const tapBuf = createImpulseBuffer(ctx, 6, 18, 0.002, 15);
  const taps = b.buffer(tapBuf);
  const f1 = b.bpf(4500, 5); // Very resonant — glassy ping
  const g1 = b.gain(0.3);
  b.toOutput(b.chain(taps, f1, g1));
  // Rain running down glass — smooth mid
  const run = b.noise("pink");
  const f2 = b.bpf(1600, 1.5);
  const g2 = b.gain(0.2);
  b.lfo(0.3, 0.08, g2.gain); // Irregular flow
  b.toOutput(b.chain(run, f2, g2));
  // Indoor warmth — cozy room tone
  const room = b.noise("brown");
  const f3 = b.lpf(150);
  const g3 = b.gain(0.15);
  b.toOutput(b.chain(room, f3, g3));
  return b.build();
}

/** River: strong continuous flow with turbulent variation */
function createRiver(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Heavy current — dominant
  const flow = b.noise("brown");
  const f1 = b.lpf(600);
  const g1 = b.gain(0.45);
  b.lfo(0.2, 0.12, g1.gain); // Turbulent surges
  b.toOutput(b.chain(flow, f1, g1));
  // Babbling mid — rocks and eddies
  const babble = b.noise("pink");
  const f2 = b.bpf(1800, 1.5);
  const g2 = b.gain(0.2);
  b.lfo(0.5, 0.1, g2.gain); // Faster than waves
  b.toOutput(b.chain(babble, f2, g2));
  // Splashing texture
  const splash = b.noise("white");
  const f3 = b.bpf(4000, 2);
  const g3 = b.gain(0.08);
  b.lfo(0.7, 0.04, g3.gain);
  b.toOutput(b.chain(splash, f3, g3));
  return b.build();
}

/** Waterfall: massive, immersive wall of water */
function createWaterfall(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Massive rush — wide, loud
  const rush = b.noise("white");
  const f1 = b.bpf(1000, 0.3); // Ultra-wide
  const g1 = b.gain(0.6);
  b.toOutput(b.chain(rush, f1, g1));
  // Deep, powerful bass — ground shaking
  const bass = b.noise("brown");
  const f2 = b.lpf(250);
  const g2 = b.gain(0.45);
  b.toOutput(b.chain(bass, f2, g2));
  // High mist spray
  const mist = b.noise("white");
  const f3 = b.hpf(6000);
  const g3 = b.gain(0.12);
  b.toOutput(b.chain(mist, f3, g3));
  return b.build();
}

/** Leaves: intermittent dry rustling — very different from water sounds */
function createLeaves(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Dry rustle bursts — signature
  const rustle = b.noise("white");
  const f1 = b.bpf(6000, 2); // High, dry texture
  const g1 = b.gain(0.1);
  b.lfo(0.4, 0.08, g1.gain); // Gusts
  b.toOutput(b.chain(rustle, f1, g1));
  // Crinkly mid texture
  const crinkle = b.noise("pink");
  const f2 = b.bpf(3500, 3); // Resonant crinkle
  const g2 = b.gain(0.07);
  b.lfo(0.6, 0.05, g2.gain);
  b.toOutput(b.chain(crinkle, f2, g2));
  // Gentle breeze undertone
  const breeze = b.noise("brown");
  const f3 = b.lpf(250);
  const g3 = b.gain(0.06);
  b.lfo(0.15, 0.03, g3.gain);
  b.toOutput(b.chain(breeze, f3, g3));
  return b.build();
}

/** Snow: ultra-soft crystalline shimmer */
function createSnow(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Deep quiet
  const deep = b.noise("brown");
  const f1 = b.lpf(120);
  const g1 = b.gain(0.08);
  b.toOutput(b.chain(deep, f1, g1));
  // Crystalline shimmer — signature
  const shimmer = b.noise("white");
  const f2 = b.bpf(8000, 4); // Very narrow high sparkle
  const g2 = b.gain(0.03);
  b.lfo(0.2, 0.015, g2.gain);
  b.toOutput(b.chain(shimmer, f2, g2));
  // Soft mid pad
  const pad = b.noise("pink");
  const f3 = b.bpf(500, 0.5);
  const g3 = b.gain(0.04);
  b.toOutput(b.chain(pad, f3, g3));
  return b.build();
}

/** Underwater: heavily muffled with resonant bubbles */
function createUnderwater(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Heavy pressure bass — dominant
  const pressure = b.noise("brown");
  const f1 = b.lpf(200, 2); // Resonant low — pressure feel
  const g1 = b.gain(0.5);
  b.lfo(0.08, 0.1, g1.gain);
  b.toOutput(b.chain(pressure, f1, g1));
  // Muffled mid — everything sounds distant
  const muffled = b.noise("pink");
  const f2 = b.bpf(350, 1.5);
  const g2 = b.gain(0.2);
  b.toOutput(b.chain(muffled, f2, g2));
  // Bubble bursts — signature
  const bubbleBuf = createImpulseBuffer(ctx, 6, 12, 0.015, 3);
  const bubbles = b.buffer(bubbleBuf);
  const f3 = b.bpf(1800, 4); // Resonant bubble pop
  const g3 = b.gain(0.18);
  b.toOutput(b.chain(bubbles, f3, g3));
  return b.build();
}

/** Crickets: rhythmic high-freq chirp patterns */
function createCrickets(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  const sr = ctx.sampleRate;
  const dur = 8;
  const len = sr * dur;
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  // Multiple cricket "voices" with different rhythms
  const voices = [
    { freq: 4800, interval: 0.15, chirpLen: 0.02, amp: 0.4 },
    { freq: 5500, interval: 0.22, chirpLen: 0.015, amp: 0.3 },
    { freq: 6200, interval: 0.18, chirpLen: 0.025, amp: 0.25 },
  ];
  for (const v of voices) {
    const offset = Math.random() * v.interval;
    for (let t = offset; t < dur; t += v.interval + Math.random() * 0.05) {
      const pos = Math.floor(t * sr);
      const samples = Math.floor(sr * v.chirpLen);
      for (let j = 0; j < samples && pos + j < len; j++) {
        const env = Math.sin(Math.PI * j / samples);
        data[pos + j] += Math.sin(2 * Math.PI * v.freq * j / sr) * env * v.amp;
      }
    }
  }
  const chirps = b.buffer(buf);
  const g1 = b.gain(0.3);
  b.toOutput(b.chain(chirps, g1));
  // Dark night ambience
  const night = b.noise("brown");
  const f1 = b.lpf(150);
  const g2 = b.gain(0.1);
  b.toOutput(b.chain(night, f1, g2));
  return b.build();
}

/** Frogs: deep croaking chorus with pond ambience */
function createFrogs(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  const sr = ctx.sampleRate;
  const dur = 8;
  const len = sr * dur;
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  // Multiple frog voices — different pitches and rhythms
  const frogs = [
    { baseFreq: 180, interval: 0.8, croakLen: 0.12, amp: 0.5 },
    { baseFreq: 280, interval: 1.2, croakLen: 0.08, amp: 0.4 },
    { baseFreq: 400, interval: 0.6, croakLen: 0.06, amp: 0.3 },
  ];
  for (const frog of frogs) {
    const offset = Math.random() * frog.interval;
    for (let t = offset; t < dur; t += frog.interval + Math.random() * 0.3) {
      const pos = Math.floor(t * sr);
      const samples = Math.floor(sr * frog.croakLen);
      const freq = frog.baseFreq + Math.random() * 60;
      // Rapid amplitude modulation — croaking texture
      for (let j = 0; j < samples && pos + j < len; j++) {
        const env = Math.sin(Math.PI * j / samples);
        const tremolo = 0.5 + 0.5 * Math.sin(2 * Math.PI * 30 * j / sr);
        data[pos + j] += Math.sin(2 * Math.PI * freq * j / sr) * env * tremolo * frog.amp;
      }
    }
  }
  const croaks = b.buffer(buf);
  const g1 = b.gain(0.35);
  b.toOutput(b.chain(croaks, g1));
  // Pond water
  const pond = b.noise("pink");
  const f1 = b.bpf(500, 1.5);
  const g2 = b.gain(0.1);
  b.lfo(0.3, 0.04, g2.gain);
  b.toOutput(b.chain(pond, f1, g2));
  return b.build();
}

/** Whale: long eerie sweeping calls in deep ocean */
function createWhale(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  const sr = ctx.sampleRate;
  const dur = 16;
  const len = sr * dur;
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  // Long, sweeping whale calls
  const calls = [
    { start: 0.5, dur: 4, freqStart: 80, freqEnd: 300 },
    { start: 5, dur: 3, freqStart: 250, freqEnd: 100 },
    { start: 9, dur: 5, freqStart: 120, freqEnd: 350 },
    { start: 14, dur: 2, freqStart: 200, freqEnd: 150 },
  ];
  for (const call of calls) {
    const pos = Math.floor(call.start * sr);
    const samples = Math.floor(call.dur * sr);
    for (let j = 0; j < samples && pos + j < len; j++) {
      const t = j / samples;
      const freq = call.freqStart + (call.freqEnd - call.freqStart) * t;
      const env = Math.sin(Math.PI * t) * 0.5;
      // Add harmonics for richness
      data[pos + j] += Math.sin(2 * Math.PI * freq * j / sr) * env;
      data[pos + j] += Math.sin(2 * Math.PI * freq * 1.5 * j / sr) * env * 0.3;
      data[pos + j] += Math.sin(2 * Math.PI * freq * 2 * j / sr) * env * 0.15;
    }
  }
  const song = b.buffer(buf);
  const f1 = b.lpf(500);
  const g1 = b.gain(0.35);
  b.toOutput(b.chain(song, f1, g1));
  // Deep ocean rumble
  const ocean = b.noise("brown");
  const f2 = b.lpf(100);
  const g2 = b.gain(0.25);
  b.lfo(0.05, 0.08, g2.gain);
  b.toOutput(b.chain(ocean, f2, g2));
  return b.build();
}

// ── Urban (new) ─────────────────────────────────────────

/** Library: near-silent room — clock tick + very sparse page turn */
function createLibrary(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Very quiet room hum
  const room = b.noise("brown");
  const f1 = b.lpf(100);
  const g1 = b.gain(0.05);
  b.toOutput(b.chain(room, f1, g1));
  // Subtle clock — signature
  const clockBuf = createTickBuffer(ctx, 8, 2, 600, 0.005);
  const clock = b.buffer(clockBuf);
  const g2 = b.gain(0.08);
  b.toOutput(b.chain(clock, g2));
  // Very sparse page turns
  const pageBuf = createImpulseBuffer(ctx, 12, 0.8, 0.04, 2);
  const pages = b.buffer(pageBuf);
  const f3 = b.bpf(3000, 2);
  const g3 = b.gain(0.06);
  b.toOutput(b.chain(pages, f3, g3));
  return b.build();
}

/** Airplane: constant drone with narrow cabin resonance */
function createAirplane(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Engine drone — dominant constant low
  const engine = b.noise("brown");
  const f1 = b.lpf(200);
  const g1 = b.gain(0.5);
  b.toOutput(b.chain(engine, f1, g1));
  // Cabin resonance — narrow band hum, the signature
  const cabin = b.noise("pink");
  const f2 = b.bpf(380, 4); // Very narrow — specific cabin frequency
  const g2 = b.gain(0.3);
  b.toOutput(b.chain(cabin, f2, g2));
  // AC hiss with slow wobble
  const ac = b.noise("white");
  const f3 = b.bpf(3500, 1);
  const g3 = b.gain(0.06);
  b.lfo(0.02, 0.02, g3.gain);
  b.toOutput(b.chain(ac, f3, g3));
  return b.build();
}

/** Vinyl: warm crackle with wow-and-flutter wobble */
function createVinyl(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Warm low hum — turntable motor
  const motor = b.noise("brown");
  const f1 = b.bpf(100, 3); // Narrow hum
  const g1 = b.gain(0.12);
  b.toOutput(b.chain(motor, f1, g1));
  // Warm vinyl tone with wow-and-flutter — signature
  const warm = b.noise("pink");
  const f2 = b.lpf(1500);
  const g2 = b.gain(0.2);
  b.lfo(0.55, 0.06, g2.gain); // 33rpm = ~0.55Hz rotation
  b.toOutput(b.chain(warm, f2, g2));
  // Dense surface crackle — signature
  const crackleBuf = createImpulseBuffer(ctx, 3, 60, 0.002, 14);
  const crackle = b.buffer(crackleBuf);
  const f3 = b.hpf(4000);
  const g3 = b.gain(0.25);
  b.toOutput(b.chain(crackle, f3, g3));
  return b.build();
}

/** Restaurant: lively chatter waves with glass/plate clinks */
function createRestaurant(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Conversation babble — undulating waves
  const chatter = b.noise("pink");
  const f1 = b.bpf(800, 0.6);
  const g1 = b.gain(0.4);
  b.lfo(0.25, 0.12, g1.gain); // Conversation waves
  b.toOutput(b.chain(chatter, f1, g1));
  // Higher vocal layer
  const voices = b.noise("pink", 6);
  const f2 = b.bpf(2000, 1);
  const g2 = b.gain(0.15);
  b.lfo(0.35, 0.06, g2.gain);
  b.toOutput(b.chain(voices, f2, g2));
  // Glass clinks — signature
  const clinkBuf = createImpulseBuffer(ctx, 8, 6, 0.006, 10);
  const clinks = b.buffer(clinkBuf);
  const f3 = b.bpf(5000, 6); // Very resonant — glassy ring
  const g3 = b.gain(0.15);
  b.toOutput(b.chain(clinks, f3, g3));
  // Low kitchen rumble
  const kitchen = b.noise("brown");
  const f4 = b.lpf(200);
  const g4 = b.gain(0.15);
  b.toOutput(b.chain(kitchen, f4, g4));
  return b.build();
}

/** Subway: rhythmic rail joints + resonant tunnel drone */
function createSubway(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Tunnel resonance — signature
  const tunnel = b.noise("brown");
  const f1 = b.bpf(160, 3); // Narrow resonance — tunnel boom
  const g1 = b.gain(0.45);
  b.lfo(0.04, 0.12, g1.gain); // Acceleration/deceleration
  b.toOutput(b.chain(tunnel, f1, g1));
  // Rhythmic rail joints — key signature
  const clickBuf = createTickBuffer(ctx, 4, 0.6, 400, 0.025);
  const clicks = b.buffer(clickBuf);
  const f2 = b.bpf(600, 2);
  const g2 = b.gain(0.3);
  b.toOutput(b.chain(clicks, f2, g2));
  // Squealing brakes/curves — occasional high
  const squeal = b.noise("white");
  const f3 = b.bpf(3000, 6); // Narrow, piercing
  const g3 = b.gain(0.04);
  b.lfo(0.07, 0.03, g3.gain);
  b.toOutput(b.chain(squeal, f3, g3));
  return b.build();
}

/** Car Ride: smooth engine + steady road hiss — no rhythmic clicks */
function createCarRide(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Smooth engine — lower than subway, no resonance
  const engine = b.noise("brown");
  const f1 = b.lpf(160);
  const g1 = b.gain(0.4);
  b.lfo(0.03, 0.04, g1.gain); // Very gentle RPM variation
  b.toOutput(b.chain(engine, f1, g1));
  // Road noise — steady, wide
  const road = b.noise("pink");
  const f2 = b.bpf(700, 0.4); // Wide band
  const g2 = b.gain(0.2);
  b.toOutput(b.chain(road, f2, g2));
  // Wind at windows — signature: higher than subway
  const wind = b.noise("white");
  const f3 = b.bpf(2500, 1);
  const g3 = b.gain(0.07);
  b.lfo(0.1, 0.03, g3.gain);
  b.toOutput(b.chain(wind, f3, g3));
  return b.build();
}

/** Playground: energetic, dynamic — shrieks and laughter */
function createPlayground(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Energetic mid chatter
  const voices = b.noise("pink");
  const f1 = b.bpf(1200, 0.5);
  const g1 = b.gain(0.3);
  b.lfo(0.3, 0.15, g1.gain); // Dynamic — bursts of activity
  b.toOutput(b.chain(voices, f1, g1));
  // High shrieks — signature
  const shrieks = b.noise("white");
  const f2 = b.bpf(4000, 2);
  const g2 = b.gain(0.1);
  b.lfo(0.5, 0.07, g2.gain); // Rapid fluctuation
  b.toOutput(b.chain(shrieks, f2, g2));
  // Outdoor ambience base
  const outdoor = b.noise("brown");
  const f3 = b.lpf(300);
  const g3 = b.gain(0.12);
  b.toOutput(b.chain(outdoor, f3, g3));
  // Metallic creaking (swing set) — signature
  const creakBuf = createImpulseBuffer(ctx, 8, 3, 0.02, 4);
  const creak = b.buffer(creakBuf);
  const f4 = b.bpf(2000, 5); // Resonant metallic
  const g4 = b.gain(0.08);
  b.toOutput(b.chain(creak, f4, g4));
  return b.build();
}

// ── Noise (new) ─────────────────────────────────────────

/** Fan: blade rotation whoosh — prominent LFO */
function createFan(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Base motor hum
  const motor = b.noise("brown");
  const f1 = b.lpf(300);
  const g1 = b.gain(0.35);
  b.toOutput(b.chain(motor, f1, g1));
  // Blade whoosh — THE signature: strong LFO
  const whoosh = b.noise("pink");
  const f2 = b.bpf(500, 1.5);
  const g2 = b.gain(0.25);
  b.lfo(0.08, 0.12, g2.gain); // Slow rotation whoosh
  b.toOutput(b.chain(whoosh, f2, g2));
  // Air movement
  const air = b.noise("white");
  const f3 = b.bpf(2000, 0.5);
  const g3 = b.gain(0.05);
  b.lfo(0.08, 0.03, g3.gain); // Same rotation freq
  b.toOutput(b.chain(air, f3, g3));
  return b.build();
}

/** Static: harsh, crackling TV/radio */
function createStatic(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Raw white noise — harsh, unfiltered = signature
  const raw = b.noise("white");
  const g1 = b.gain(0.2);
  b.toOutput(b.chain(raw, g1));
  // Crackle pops
  const popBuf = createImpulseBuffer(ctx, 4, 35, 0.003, 12);
  const pops = b.buffer(popBuf);
  const f2 = b.hpf(2000);
  const g2 = b.gain(0.15);
  b.toOutput(b.chain(pops, f2, g2));
  // Intermittent signal — LFO creates radio tuning feel
  const signal = b.noise("pink");
  const f3 = b.bpf(1500, 3);
  const g3 = b.gain(0.08);
  b.lfo(0.4, 0.06, g3.gain);
  b.toOutput(b.chain(signal, f3, g3));
  return b.build();
}

/** AC: smooth, constant, featureless hum — opposite of fan */
function createAc(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Smooth constant low — no LFO = signature (steady)
  const low = b.noise("brown");
  const f1 = b.lpf(280);
  const g1 = b.gain(0.4);
  b.toOutput(b.chain(low, f1, g1));
  // Wide smooth mid
  const mid = b.noise("pink");
  const f2 = b.bpf(400, 0.3); // Very wide, smooth
  const g2 = b.gain(0.2);
  b.toOutput(b.chain(mid, f2, g2));
  // Gentle vent hiss
  const vent = b.noise("white");
  const f3 = b.hpf(5000);
  const g3 = b.gain(0.04);
  b.toOutput(b.chain(vent, f3, g3));
  return b.build();
}

/** Dryer: fast tumbling rhythm with thunks */
function createDryer(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Motor rumble
  const motor = b.noise("brown");
  const f1 = b.lpf(250);
  const g1 = b.gain(0.35);
  b.toOutput(b.chain(motor, f1, g1));
  // Tumble rhythm — signature: fast LFO
  const tumble = b.noise("pink");
  const f2 = b.bpf(500, 1);
  const g2 = b.gain(0.25);
  b.lfo(1.2, 0.12, g2.gain); // 1.2Hz = tumbling speed
  b.toOutput(b.chain(tumble, f2, g2));
  // Thunking clothes/buttons
  const thunkBuf = createImpulseBuffer(ctx, 4, 8, 0.01, 5);
  const thunks = b.buffer(thunkBuf);
  const f3 = b.bpf(800, 2);
  const g3 = b.gain(0.15);
  b.toOutput(b.chain(thunks, f3, g3));
  // Zipper/button clicks
  const clickBuf = createImpulseBuffer(ctx, 4, 4, 0.003, 10);
  const clicks = b.buffer(clickBuf);
  const f4 = b.bpf(3500, 3);
  const g4 = b.gain(0.08);
  b.toOutput(b.chain(clicks, f4, g4));
  return b.build();
}

/** Binaural: 10Hz binaural beats — pure tones */
function createBinaural(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  const sr = ctx.sampleRate;
  const dur = 10;
  const len = sr * dur;
  const buf = ctx.createBuffer(2, len, sr);
  const left = buf.getChannelData(0);
  const right = buf.getChannelData(1);
  for (let i = 0; i < len; i++) {
    left[i] = Math.sin(2 * Math.PI * 200 * i / sr) * 0.3;
    right[i] = Math.sin(2 * Math.PI * 210 * i / sr) * 0.3;
  }
  const tones = b.buffer(buf);
  const g1 = b.gain(0.5);
  b.toOutput(b.chain(tones, g1));
  const sub = b.noise("brown");
  const f1 = b.lpf(100);
  const g2 = b.gain(0.08);
  b.toOutput(b.chain(sub, f1, g2));
  return b.build();
}

// ── ASMR (new) ──────────────────────────────────────────

/** ASMR Purring: rapid 25Hz vibration — cat-like */
function createAsmrPurring(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Core purr — fast LFO is the signature
  const base = b.noise("brown");
  const f1 = b.bpf(120, 2); // Low, resonant
  const g1 = b.gain(0.4);
  b.lfo(25, 0.2, g1.gain); // 25Hz = purring frequency
  b.toOutput(b.chain(base, f1, g1));
  // Body warmth
  const warm = b.noise("pink");
  const f2 = b.lpf(350);
  const g2 = b.gain(0.12);
  b.toOutput(b.chain(warm, f2, g2));
  return b.build();
}

/** ASMR Writing: continuous scratching texture */
function createAsmrWriting(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Dense pen scratch — signature
  const scratchBuf = createImpulseBuffer(ctx, 4, 70, 0.003, 7);
  const scratch = b.buffer(scratchBuf);
  const f1 = b.bpf(3500, 3); // Resonant scratch frequency
  const g1 = b.gain(0.25);
  b.lfo(2, 0.08, g1.gain); // Writing rhythm
  b.toOutput(b.chain(scratch, f1, g1));
  // Paper texture
  const paper = b.noise("white");
  const f2 = b.bpf(5000, 2);
  const g2 = b.gain(0.06);
  b.lfo(1.5, 0.03, g2.gain);
  b.toOutput(b.chain(paper, f2, g2));
  // Quiet desk
  const desk = b.noise("brown");
  const f3 = b.lpf(150);
  const g3 = b.gain(0.03);
  b.toOutput(b.chain(desk, f3, g3));
  return b.build();
}

/** ASMR Heartbeat: clear lub-dub rhythm */
function createAsmrHeartbeat(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  const sr = ctx.sampleRate;
  const dur = 8;
  const len = sr * dur;
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  for (let t = 0; t < dur; t += 1) {
    // LUB — louder, deeper
    const lubPos = Math.floor(t * sr);
    const lubLen = Math.floor(sr * 0.1);
    for (let j = 0; j < lubLen && lubPos + j < len; j++) {
      const env = Math.sin(Math.PI * j / lubLen);
      data[lubPos + j] += Math.sin(2 * Math.PI * 50 * j / sr) * env * 0.6;
      data[lubPos + j] += Math.sin(2 * Math.PI * 100 * j / sr) * env * 0.3;
    }
    // DUB — softer, higher
    const dubPos = Math.floor((t + 0.18) * sr);
    const dubLen = Math.floor(sr * 0.07);
    for (let j = 0; j < dubLen && dubPos + j < len; j++) {
      const env = Math.sin(Math.PI * j / dubLen);
      data[dubPos + j] += Math.sin(2 * Math.PI * 70 * j / sr) * env * 0.4;
      data[dubPos + j] += Math.sin(2 * Math.PI * 140 * j / sr) * env * 0.2;
    }
  }
  const beats = b.buffer(buf);
  const g1 = b.gain(0.6);
  b.toOutput(b.chain(beats, g1));
  // Body cavity resonance
  const body = b.noise("brown");
  const f1 = b.lpf(120);
  const g2 = b.gain(0.12);
  b.toOutput(b.chain(body, f1, g2));
  return b.build();
}

/** ASMR Piano: gentle arpeggiated chords */
function createAsmrPiano(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  const sr = ctx.sampleRate;
  const dur = 12;
  const len = sr * dur;
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  // Multiple chords arpeggiated
  const chords = [
    [261.6, 329.6, 392],   // C major
    [220, 277.2, 329.6],   // A minor
    [246.9, 311.1, 370],   // B minor (ish)
    [293.7, 370, 440],     // D major
  ];
  let t = 0;
  const noteGap = 0.4;
  for (let ci = 0; ci < chords.length; ci++) {
    const chord = chords[ci];
    for (let ni = 0; ni < chord.length; ni++) {
      const pos = Math.floor(t * sr);
      const noteDur = 2.5;
      const noteSamples = Math.floor(sr * noteDur);
      const freq = chord[ni];
      for (let j = 0; j < noteSamples && pos + j < len; j++) {
        const tn = j / noteSamples;
        const attack = Math.min(tn * 20, 1);
        const decay = Math.exp(-tn * 2);
        const env = attack * decay * 0.2;
        data[pos + j] += Math.sin(2 * Math.PI * freq * j / sr) * env;
        data[pos + j] += Math.sin(2 * Math.PI * freq * 2 * j / sr) * env * 0.1; // Harmonic
      }
      t += noteGap;
    }
    t += 0.8; // Gap between chords
  }
  const piano = b.buffer(buf);
  const g1 = b.gain(0.45);
  b.toOutput(b.chain(piano, g1));
  // Reverb tail
  const reverb = b.noise("pink");
  const f1 = b.lpf(1500);
  const g2 = b.gain(0.06);
  b.toOutput(b.chain(reverb, f1, g2));
  return b.build();
}

/** ASMR Singing Bowl: resonant sustained metallic tone */
function createAsmrSingingBowl(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  const sr = ctx.sampleRate;
  const dur = 12;
  const len = sr * dur;
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  // Rich harmonic series — metallic overtones
  const fundamental = 528;
  const harmonics = [1, 2.09, 3.43, 4.12, 5.68]; // Inharmonic — metallic
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const tNorm = i / len;
    // Repeating strike pattern: fade in, sustain, fade out
    const cycle = (tNorm * 2) % 1; // 2 strikes per loop
    const strike = cycle < 0.05 ? cycle * 20 : Math.exp(-(cycle - 0.05) * 3);
    const env = strike * 0.25;
    const vibrato = 1 + Math.sin(2 * Math.PI * 4.5 * t) * 0.004;
    let sample = 0;
    for (let h = 0; h < harmonics.length; h++) {
      const freq = fundamental * harmonics[h] * vibrato;
      const harmAmp = 1 / (h + 1);
      sample += Math.sin(2 * Math.PI * freq * t) * harmAmp;
    }
    data[i] = sample * env;
  }
  const bowl = b.buffer(buf);
  const g1 = b.gain(0.4);
  b.toOutput(b.chain(bowl, g1));
  return b.build();
}

/** ASMR Page Turn: slow, deliberate paper sounds */
function createAsmrPageTurn(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Long, slow page turns — signature
  const pageBuf = createImpulseBuffer(ctx, 12, 1.5, 0.06, 2);
  const pages = b.buffer(pageBuf);
  const f1 = b.bpf(2500, 2);
  const g1 = b.gain(0.2);
  b.toOutput(b.chain(pages, f1, g1));
  // Paper crinkle texture
  const crinkle = b.noise("white");
  const f2 = b.bpf(5000, 3);
  const g2 = b.gain(0.04);
  b.lfo(0.12, 0.03, g2.gain);
  b.toOutput(b.chain(crinkle, f2, g2));
  // Deep silence between turns
  const silence = b.noise("brown");
  const f3 = b.lpf(80);
  const g3 = b.gain(0.03);
  b.toOutput(b.chain(silence, f3, g3));
  return b.build();
}

/** ASMR Brushing: rhythmic stroking — clear 3Hz rhythm */
function createAsmrBrushing(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  // Strong stroke rhythm — signature
  const stroke = b.noise("white");
  const f1 = b.bpf(3000, 1.5);
  const g1 = b.gain(0.12);
  b.lfo(3, 0.09, g1.gain); // Clear 3Hz brush strokes
  b.toOutput(b.chain(stroke, f1, g1));
  // Soft bristle texture
  const bristle = b.noise("pink");
  const f2 = b.bpf(5000, 2);
  const g2 = b.gain(0.06);
  b.lfo(3, 0.04, g2.gain); // Synced
  b.toOutput(b.chain(bristle, f2, g2));
  // Warmth
  const warm = b.noise("brown");
  const f3 = b.lpf(200);
  const g3 = b.gain(0.04);
  b.toOutput(b.chain(warm, f3, g3));
  return b.build();
}

/** ASMR Chimes: random gentle bell tones with long decay */
function createAsmrChimes(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  const sr = ctx.sampleRate;
  const dur = 12;
  const len = sr * dur;
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  const chimeFreqs = [523, 659, 784, 1047, 1319, 1568]; // C5-G6 pentatonic
  const numChimes = 16;
  for (let c = 0; c < numChimes; c++) {
    const pos = Math.floor(Math.random() * len);
    const chimeDur = 1.5 + Math.random() * 2;
    const chimeSamples = Math.floor(sr * chimeDur);
    const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];
    const amp = 0.2 + Math.random() * 0.2;
    for (let j = 0; j < chimeSamples && pos + j < len; j++) {
      const env = Math.exp(-j * 1.5 / chimeSamples);
      data[pos + j] += Math.sin(2 * Math.PI * freq * j / sr) * env * amp;
      // Inharmonic overtone — metallic
      data[pos + j] += Math.sin(2 * Math.PI * freq * 2.76 * j / sr) * env * amp * 0.2;
      data[pos + j] += Math.sin(2 * Math.PI * freq * 5.4 * j / sr) * env * amp * 0.08;
    }
  }
  const chimes = b.buffer(buf);
  const g1 = b.gain(0.35);
  b.toOutput(b.chain(chimes, g1));
  // Gentle breeze
  const breeze = b.noise("white");
  const f1 = b.bpf(4000, 1);
  const g2 = b.gain(0.03);
  b.lfo(0.3, 0.02, g2.gain);
  b.toOutput(b.chain(breeze, f1, g2));
  return b.build();
}

/** ASMR Humming: warm vocal hum with breath rhythm */
function createAsmrHumming(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);
  const sr = ctx.sampleRate;
  const dur = 12;
  const len = sr * dur;
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  const fund = 185; // ~F#3, natural hum pitch
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    // Vibrato
    const vib = 1 + Math.sin(2 * Math.PI * 5.5 * t) * 0.006;
    // Formant-like harmonics — nasal hum character
    let sample = 0;
    sample += Math.sin(2 * Math.PI * fund * vib * t) * 1.0;
    sample += Math.sin(2 * Math.PI * fund * 2 * vib * t) * 0.6;
    sample += Math.sin(2 * Math.PI * fund * 3 * vib * t) * 0.4;
    sample += Math.sin(2 * Math.PI * fund * 4 * vib * t) * 0.15;
    sample += Math.sin(2 * Math.PI * fund * 5 * vib * t) * 0.08;
    // Breathing rhythm — inhale pauses
    const breathPhase = (t % 4) / 4; // 4-second breath cycle
    const breath = breathPhase < 0.85 ? 1 : Math.cos(Math.PI * (breathPhase - 0.85) / 0.15 * 0.5);
    const env = 0.12 * breath;
    data[i] = sample * env;
  }
  const hum = b.buffer(buf);
  const g1 = b.gain(0.4);
  b.toOutput(b.chain(hum, g1));
  // Nasal resonance layer
  const nasal = b.noise("pink");
  const f1 = b.bpf(400, 4); // Narrow — vocal resonance
  const g2 = b.gain(0.06);
  b.lfo(5.5, 0.02, g2.gain); // Matched vibrato
  b.toOutput(b.chain(nasal, f1, g2));
  return b.build();
}

// ── Registry ─────────────────────────────────────────────

type SoundFactory = (ctx: AudioContext) => ProceduralSound;

const factories: Record<string, SoundFactory> = {
  // Nature
  rain: createRain,
  "heavy-rain": createHeavyRain,
  drizzle: createDrizzle,
  "rain-on-tent": createRainOnTent,
  "rain-on-window": createRainOnWindow,
  wind: createWind,
  waves: createWaves,
  thunder: createThunder,
  birds: createBirds,
  campfire: createCampfire,
  forest: createForest,
  creek: createCreek,
  river: createRiver,
  waterfall: createWaterfall,
  leaves: createLeaves,
  snow: createSnow,
  underwater: createUnderwater,
  crickets: createCrickets,
  frogs: createFrogs,
  whale: createWhale,
  // Urban
  cafe: createCafe,
  keyboard: createKeyboard,
  train: createTrain,
  clock: createClock,
  city: createCity,
  library: createLibrary,
  airplane: createAirplane,
  vinyl: createVinyl,
  restaurant: createRestaurant,
  subway: createSubway,
  "car-ride": createCarRide,
  playground: createPlayground,
  // Noise
  fan: createFan,
  static: createStatic,
  ac: createAc,
  dryer: createDryer,
  binaural: createBinaural,
  // ASMR
  "asmr-typing": createAsmrTyping,
  "asmr-whisper": createAsmrWhisper,
  "asmr-fabric": createAsmrFabric,
  "asmr-purring": createAsmrPurring,
  "asmr-writing": createAsmrWriting,
  "asmr-heartbeat": createAsmrHeartbeat,
  "asmr-piano": createAsmrPiano,
  "asmr-singing-bowl": createAsmrSingingBowl,
  "asmr-page-turn": createAsmrPageTurn,
  "asmr-brushing": createAsmrBrushing,
  "asmr-chimes": createAsmrChimes,
  "asmr-humming": createAsmrHumming,
};

export function createProceduralSound(ctx: AudioContext, id: string): ProceduralSound | null {
  const factory = factories[id];
  if (!factory) return null;
  return factory(ctx);
}

export function hasProceduralSound(id: string): boolean {
  return id in factories;
}
