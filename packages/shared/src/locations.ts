// =============================================================================
// Bangladesh Location Tree — District → Thana → Bazar
// =============================================================================
// Structure: Each district contains thanas, each thana contains bazars.
// Admin team will populate this file with actual location data.
// All dropdowns (Hub approval, Admin dispatch) use this as the single source of truth.
// =============================================================================

export interface BazarInfo {
  name: string;
  // future: coordinates, delivery fee override, etc.
}

export interface ThanaInfo {
  bazars: string[];
}

export interface DistrictInfo {
  thanas: Record<string, ThanaInfo>;
}

export type LocationTree = Record<string, DistrictInfo>;

// =============================================================================
// LOCATION DATA — Add your districts/thanas/bazars here
// =============================================================================
export const BD_LOCATIONS: LocationTree = {
  "Dhaka": {
    thanas: {
      "Mirpur": {
        bazars: [
          "Mirpur-1 Bazar",
          "Mirpur-10 Bazar",
          "Mirpur-11 Bazar",
          "Mirpur-12 Bazar",
          "Pallabi Bazar",
          "Kazipara Bazar",
        ],
      },
      "Mohammadpur": {
        bazars: [
          "Mohammadpur Krishi Market",
          "Mohammadpur Town Hall Bazar",
          "Shyamoli Bazar",
          "Adabor Bazar",
        ],
      },
      "Dhanmondi": {
        bazars: [
          "Dhanmondi Road 27 Bazar",
          "Jigatola Bazar",
          "Hazaribagh Bazar",
        ],
      },
      "Gulshan": {
        bazars: [
          "Gulshan-1 Bazar",
          "Gulshan-2 Bazar",
          "Banani Bazar",
          "DOHS Bazar",
        ],
      },
      "Uttara": {
        bazars: [
          "Uttara Sector-3 Bazar",
          "Uttara Sector-7 Bazar",
          "Uttara Sector-10 Bazar",
          "Abdullahpur Bazar",
        ],
      },
      "Motijheel": {
        bazars: [
          "Motijheel Bazar",
          "Arambagh Bazar",
          "Fakirapool Bazar",
        ],
      },
      "Demra": {
        bazars: [
          "Demra Bazar",
          "Jurain Bazar",
          "Shyampur Bazar",
        ],
      },
      "Badda": {
        bazars: [
          "Badda Bazar",
          "Boro Beraid Bazar",
          "Satarkul Bazar",
        ],
      },
      "Khilgaon": {
        bazars: [
          "Khilgaon Bazar",
          "Taltola Bazar",
          "Chowdhury Para Bazar",
        ],
      },
      "Lalbagh": {
        bazars: [
          "Lalbagh Bazar",
          "Azimpur Bazar",
          "Newmarket Bazar",
        ],
      },
    },
  },

  "Chattogram": {
    thanas: {
      "Kotwali": {
        bazars: [
          "Reazuddin Bazar",
          "Khatunganj Bazar",
          "Chaktai Bazar",
        ],
      },
      "Pahartali": {
        bazars: [
          "Pahartali Bazar",
          "Oxygen Bazar",
          "Baizid Bazar",
        ],
      },
      "Hathazari": {
        bazars: [
          "Hathazari Bazar",
          "Fatehabad Bazar",
        ],
      },
      "Chandgaon": {
        bazars: [
          "Chandgaon Bazar",
          "Momin Road Bazar",
        ],
      },
    },
  },

  "Sylhet": {
    thanas: {
      "Kotwali": {
        bazars: [
          "Sylhet Bazar",
          "Bondor Bazar",
          "Ambarkhana Bazar",
        ],
      },
      "Shah Poran": {
        bazars: [
          "Shah Poran Bazar",
          "Tilaghar Bazar",
        ],
      },
    },
  },

  "Rajshahi": {
    thanas: {
      "Boalia": {
        bazars: [
          "Saheb Bazar",
          "New Market Rajshahi",
          "Kazla Bazar",
        ],
      },
      "Rajpara": {
        bazars: [
          "Rajpara Bazar",
          "Talaimari Bazar",
        ],
      },
    },
  },

  "Khulna": {
    thanas: {
      "Sonadanga": {
        bazars: [
          "Sonadanga Bazar",
          "Boyra Bazar",
        ],
      },
      "Khalishpur": {
        bazars: [
          "Khalishpur Bazar",
          "Daulatpur Bazar",
        ],
      },
    },
  },

  "Barishal": {
    thanas: {
      "Kotwali": {
        bazars: [
          "Barishal Nathullabad Bazar",
          "Bandh Road Bazar",
        ],
      },
      "Bandar": {
        bazars: [
          "Bandar Bazar",
          "Barisal Port Bazar",
        ],
      },
    },
  },

  "Rangpur": {
    thanas: {
      "Kotwali": {
        bazars: [
          "Rangpur Shaheed Minar Bazar",
          "Dhap Bazar",
        ],
      },
      "Mithapukur": {
        bazars: [
          "Mithapukur Bazar",
        ],
      },
    },
  },

  "Mymensingh": {
    thanas: {
      "Kotwali": {
        bazars: [
          "Mymensingh Bazar",
          "Ganginar Par Bazar",
        ],
      },
      "Trishal": {
        bazars: [
          "Trishal Bazar",
          "Darirampur Bazar",
        ],
      },
    },
  },
};

// =============================================================================
// Utility Helpers
// =============================================================================

/** Returns all district names */
export function getDistricts(): string[] {
  return Object.keys(BD_LOCATIONS).sort();
}

/** Returns thana names for a given district */
export function getThanas(district: string): string[] {
  const d = BD_LOCATIONS[district];
  if (!d) return [];
  return Object.keys(d.thanas).sort();
}

/** Returns bazar names for a given district + thana */
export function getBazars(district: string, thana: string): string[] {
  const t = BD_LOCATIONS[district]?.thanas[thana];
  if (!t) return [];
  return [...t.bazars].sort();
}

/** Check if a given location (district/thana/bazar) is valid */
export function isValidLocation(district?: string | null, thana?: string | null, bazar?: string | null): boolean {
  if (!district) return false;
  const d = BD_LOCATIONS[district];
  if (!d) return false;
  if (!thana) return true; // district-only is valid
  const t = d.thanas[thana];
  if (!t) return false;
  if (!bazar) return true; // district+thana is valid
  return t.bazars.includes(bazar);
}
