// Dapur Nusantara — every sound is synthesized with WebAudio: short oscillator blips
// and filtered noise, no audio files. The context is created on the first user gesture
// (browsers block sound before that), and every effect is a small function so the game
// can call `sfx.pop()` or `sfx.ding()` without knowing how sound works.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.sizzleNodes = null;
  }

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  }

  tone(freq, seconds, type, volume, when = 0, slideTo = null) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + seconds);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.05);
  }

  noise(seconds, volume, filterFreq, when = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const length = Math.max(1, Math.floor(this.ctx.sampleRate * seconds));
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.8;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start(t0);
    source.stop(t0 + seconds);
  }

  // A short click when an ingredient bin is pressed.
  click() {
    this.tone(660, 0.07, 'square', 0.12, 0, 440);
  }

  // A soft pop when an ingredient lands on the plate.
  pop() {
    this.tone(520, 0.09, 'sine', 0.22, 0, 880);
  }

  // A hiss when something starts cooking on the wok.
  sizzle() {
    this.noise(0.5, 0.16, 5200);
  }

  // A two-note chime when a dish is served.
  ding() {
    this.tone(880, 0.14, 'sine', 0.25);
    this.tone(1318, 0.22, 'sine', 0.22, 0.1);
  }

  // Coins: a quick rising arpeggio.
  coins() {
    this.tone(988, 0.08, 'triangle', 0.2);
    this.tone(1319, 0.08, 'triangle', 0.2, 0.07);
    this.tone(1568, 0.14, 'triangle', 0.22, 0.14);
  }

  // A low buzz when a serve is wrong or the counter is full.
  buzz() {
    this.tone(160, 0.22, 'sawtooth', 0.16, 0, 110);
  }

  // A sad two-note fall when a customer walks out.
  walkout() {
    this.tone(392, 0.18, 'triangle', 0.18, 0, 330);
    this.tone(262, 0.3, 'triangle', 0.18, 0.16, 196);
  }

  // The bell that opens a new day.
  bell() {
    this.tone(1047, 0.3, 'sine', 0.2);
    this.tone(1568, 0.4, 'sine', 0.14, 0.12);
  }
}
