/**
 * Tatka Bazar — Company Configuration
 * Update these values before going live.
 */

export const COMPANY_CONFIG = {
  /** Company name shown across the app */
  name: "তাতকা বাজার",

  /** Support contact numbers — update with real numbers */
  support: {
    phone: "01XXXXXXXXX",     // ← আপনার support নম্বর বসান
    hotline: "01XXXXXXXXX",   // ← আপনার hotline নম্বর বসান
  },

  /** Company payment accounts — update with real merchant numbers */
  paymentAccounts: [
    {
      method: "bKash",
      icon: "💗",
      number: "01XXXXXXXXX",  // ← আপনার bKash merchant নম্বর বসান
      color: "#e91e8c",
      bgColor: "rgba(233,30,140,.12)",
      borderColor: "rgba(233,30,140,.3)",
    },
    {
      method: "Nagad",
      icon: "🟠",
      number: "01XXXXXXXXX",  // ← আপনার Nagad merchant নম্বর বসান
      color: "#f7941d",
      bgColor: "rgba(247,148,29,.12)",
      borderColor: "rgba(247,148,29,.3)",
    },
  ],
} as const;
