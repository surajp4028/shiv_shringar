// Homepage sections the admin can switch on/off (Settings → Website sections).
export const SITE_SECTIONS = [
  { id: "marquee", label: "Scrolling announcement bar" },
  { id: "highlights", label: "Story highlights" },
  { id: "darshan", label: "Darshan of the Day" },
  { id: "special", label: "Special events (Shobha Yatra, Baba Barfani…)" },
  { id: "videos", label: "Videos" },
  { id: "about", label: "Our seva" },
  { id: "events", label: "Events" },
  { id: "yatra", label: "Yatra" },
  { id: "schedule", label: "Timings" },
  { id: "gallery", label: "Gallery" },
  { id: "support", label: "Support the seva / donation" },
  { id: "contact", label: "Contact & map" },
] as const;

export type SectionId = (typeof SITE_SECTIONS)[number]["id"];
