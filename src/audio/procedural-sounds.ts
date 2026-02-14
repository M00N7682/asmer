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

/** ASMR Storm: rain + wind + distant thunder combo */
function createAsmrStorm(ctx: AudioContext): ProceduralSound {
  const b = new SoundBuilder(ctx);

  // Heavy rain
  const rain = b.noise("pink");
  const f1 = b.bpf(1000, 0.3);
  const g1 = b.gain(0.4);
  b.toOutput(b.chain(rain, f1, g1));

  // Rain droplets
  const drops = b.noise("white");
  const f2 = b.hpf(4000);
  const g2 = b.gain(0.1);
  b.toOutput(b.chain(drops, f2, g2));

  // Wind
  const wind = b.noise("brown");
  const f3 = b.lpf(400);
  const g3 = b.gain(0.3);
  b.lfo(0.12, 200, f3.frequency);
  b.toOutput(b.chain(wind, f3, g3));

  // Distant thunder rumble
  const thunder = b.noise("brown", 8);
  const f4 = b.lpf(120);
  const g4 = b.gain(0.25);
  b.lfo(0.04, 0.15, g4.gain);
  b.toOutput(b.chain(thunder, f4, g4));

  return b.build();
}

// ── Registry ─────────────────────────────────────────────

type SoundFactory = (ctx: AudioContext) => ProceduralSound;

const factories: Record<string, SoundFactory> = {
  rain: createRain,
  wind: createWind,
  waves: createWaves,
  thunder: createThunder,
  birds: createBirds,
  campfire: createCampfire,
  forest: createForest,
  creek: createCreek,
  cafe: createCafe,
  keyboard: createKeyboard,
  train: createTrain,
  clock: createClock,
  city: createCity,
  "asmr-typing": createAsmrTyping,
  "asmr-whisper": createAsmrWhisper,
  "asmr-fabric": createAsmrFabric,
  "asmr-storm": createAsmrStorm,
};

export function createProceduralSound(ctx: AudioContext, id: string): ProceduralSound | null {
  const factory = factories[id];
  return factory ? factory(ctx) : null;
}

export function hasProceduralSound(id: string): boolean {
  return id in factories;
}
