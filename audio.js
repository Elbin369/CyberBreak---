class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.volume = 0.7;
    this.isMuted = false;
  }
  init() {
    if (this.ctx) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.error("Web Audio API is not supported in this browser", e);
    }
  }

  async resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  setMute(muteState) {
    this.isMuted = muteState;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  playSound(type, freqStart, freqEnd, duration, gainStart = 0.3, waveType = 'sine') {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = waveType;
    osc.frequency.setValueAtTime(freqStart, t);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
    }

    gainNode.gain.setValueAtTime(gainStart, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  playPaddleBounce() {
    
    this.playSound('paddle', 180, 280, 0.08, 0.25, 'sine');
  }

  playWallBounce() {
    
    this.playSound('wall', 120, 100, 0.06, 0.2, 'triangle');
  }

  playBrickBreak() {
    
    this.playSound('brick', 600, 200, 0.08, 0.15, 'triangle');
  }

  playArmoredHit() {
    
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(440, t);
    osc2.type = 'sawtooth';
osc2.frequency.setValueAtTime(448, t);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.12);
    osc2.stop(t + 0.12);
  }

  playExplosion() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;
    const duration = 0.35;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + duration);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.35, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(100, t);
    subOsc.frequency.linearRampToValueAtTime(30, t + duration);
    
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.2, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);

    noiseNode.start(t);
    noiseNode.stop(t + duration);
    subOsc.start(t);
    subOsc.stop(t + duration);
  }

  playPowerupSpawn() {
    
    if (!this.ctx || this.isMuted) return;
    this.resume();
    
    const notes = [261.63, 329.63, 392.00];
    const t = this.ctx.currentTime;
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);
      
      gainNode.gain.setValueAtTime(0, t);
      gainNode.gain.setValueAtTime(0.12, t + idx * 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.12);
      
      osc.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.12);
    });
  }

  


  playPowerupCollect() {
    
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const notes = [523.25, 659.25, 783.99, 1046.50]; 
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gainNode.gain.setValueAtTime(0, t);
      gainNode.gain.setValueAtTime(0.1, t + idx * 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.15);

      osc.connect(gainNode);
      gainNode.connect(this.masterGain);

      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.15);
    });
  }

  


  playLaser() {
    
    this.playSound('laser', 900, 300, 0.08, 0.08, 'sawtooth');
  }

  


  playLifeLost() {
    
    this.playSound('life_lost_1', 300, 150, 0.15, 0.25, 'sine');
    setTimeout(() => {
      this.playSound('life_lost_2', 200, 100, 0.25, 0.25, 'sine');
    }, 150);
  }

  


  playLevelComplete() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gainNode.gain.setValueAtTime(0, t);
      gainNode.gain.setValueAtTime(0.12, t + idx * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.25);

      osc.connect(gainNode);
      gainNode.connect(this.masterGain);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.25);
    });
  }

  


  playGameOver() {
    
    this.playSound('gameover', 220, 55, 0.8, 0.3, 'sawtooth');
  }
}


const audio = new AudioManager();
window.gameAudio = audio;
