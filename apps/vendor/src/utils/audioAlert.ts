// =============================================================================
// Tatka Bazar — Web Audio API Live Order Sound Notification Engine
// Generates crystal-clear "Ting-Tong" Delivery Chime without external MP3 dependencies
// =============================================================================

class AudioAlertEngine {
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Play sweet Foodpanda/Pathao-style "Ting-Tong" order chime
   */
  playOrderAssignedSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [
        { freq: 523.25, time: 0.0,  duration: 0.12 },
        { freq: 659.25, time: 0.12, duration: 0.12 },
        { freq: 783.99, time: 0.24, duration: 0.14 },
        { freq: 1046.50, time: 0.38, duration: 0.35 },
      ];

      notes.forEach(({ freq, time, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

        gain.gain.setValueAtTime(0, ctx.currentTime + time);
        gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + duration);
      });
    } catch (e) {
      console.warn("[AudioAlertEngine] Could not play chime:", e);
    }
  }
}

export const audioAlert = new AudioAlertEngine();
