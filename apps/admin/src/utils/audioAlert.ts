// Audio alert utility for new order notifications
// Uses Web Audio API to generate tones without external files

export const audioAlert = {
  playOrderAssignedSound: () => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.setValueAtTime(0.25, ctx.currentTime);

      const notes = [880, 1100, 1320];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(masterGain);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        const t = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.8, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.28);
      });

      // Auto close ctx
      setTimeout(() => {
        try { ctx.close(); } catch {}
      }, 2000);
    } catch {
      // Silently fail if audio unavailable
    }
  },
};
