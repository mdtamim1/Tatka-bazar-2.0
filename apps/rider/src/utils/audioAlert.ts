// =============================================================================
// TATKA BAZAR — Rider Audio Alert Synthesizer (Web Audio API)
// Authentic dual-tone bell chime for new delivery assignments & notifications
// =============================================================================

class RiderAudioSynthesizer {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Distinctive 3-tone Tatka Bazar Dispatch Bell (Ting-Tong-Chime)
   */
  public playOrderAssignedSound() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const tones = [
      { freq: 880, start: 0, duration: 0.15, gain: 0.4 }, // A5
      { freq: 1108.73, start: 0.12, duration: 0.18, gain: 0.45 }, // C#6
      { freq: 1318.51, start: 0.28, duration: 0.4, gain: 0.5 }, // E6
    ];

    tones.forEach(({ freq, start, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + start);

      gainNode.gain.setValueAtTime(0, now + start);
      gainNode.gain.linearRampToValueAtTime(gain, now + start + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration);
    });
  }

  /**
   * Soft affirmative click/chime on status update
   */
  public playSuccessChime() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15); // C6

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Urgent high-pitch double beep for SOS / critical alerts
   */
  public playEmergencyBeep() {
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.2].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(950, now + delay);

      gainNode.gain.setValueAtTime(0.6, now + delay);
      gainNode.gain.linearRampToValueAtTime(0.01, now + delay + 0.12);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.12);
    });
  }
}

export const audioAlert = new RiderAudioSynthesizer();
