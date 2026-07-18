const SITE_URL = "https://www.moneysplit.in";

export default function manifest() {
  return {
    name: "MoneySplit",
    short_name: "Money Split",
    description:
      "Split bills with friends, roommates, and travel groups without drama.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#000000",
    background_color: "#020617",
    id: SITE_URL,
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
