// Web Audio API helper for Rider alerts (Zero external audio file dependency)

class SoundManager {
  private ctx: AudioContext | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private isPlayingAlert = false;
  private alertInterval: any = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Plays a delivery dispatch chime sequence (reminiscent of Pathao / Foodpanda)
   */
  public playOrderChimeCycle() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 587.33, duration: 0.12, time: 0 },      // D5
      { freq: 880.00, duration: 0.14, time: 0.14 },   // A5
      { freq: 1046.50, duration: 0.18, time: 0.30 },  // C6
      { freq: 1174.66, duration: 0.35, time: 0.50 },  // D6 (accent)
    ];

    notes.forEach(note => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.freq, now + note.time);

        gain.gain.setValueAtTime(0, now + note.time);
        gain.gain.linearRampToValueAtTime(0.35, now + note.time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.time);
        osc.stop(now + note.time + note.duration + 0.05);

        this.activeOscillators.push(osc);
      } catch {}
    });
  }

  /**
   * Starts repeating alert sound for incoming order countdown
   */
  public startIncomingOrderAlert() {
    if (this.isPlayingAlert) return;
    this.isPlayingAlert = true;

    // Play immediately
    this.playOrderChimeCycle();

    // Repeat every 1.5 seconds
    this.alertInterval = setInterval(() => {
      if (this.isPlayingAlert) {
        this.playOrderChimeCycle();
      }
    }, 1600);
  }

  /**
   * Stops incoming order alert sound
   */
  public stopIncomingOrderAlert() {
    this.isPlayingAlert = false;
    if (this.alertInterval) {
      clearInterval(this.alertInterval);
      this.alertInterval = null;
    }
    this.activeOscillators.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    this.activeOscillators = [];
  }

  /**
   * Plays celebratory completion chime
   */
  public playSuccessChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chords = [
      { freq: 523.25, time: 0, dur: 0.15 },    // C5
      { freq: 659.25, time: 0.12, dur: 0.15 },  // E5
      { freq: 783.99, time: 0.24, dur: 0.18 },  // G5
      { freq: 1046.50, time: 0.38, dur: 0.5 },  // C6
    ];

    chords.forEach(c => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(c.freq, now + c.time);

        gain.gain.setValueAtTime(0, now + c.time);
        gain.gain.linearRampToValueAtTime(0.3, now + c.time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + c.time + c.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + c.time);
        osc.stop(now + c.time + c.dur + 0.05);
      } catch {}
    });
  }
}

export const sound = new SoundManager();
