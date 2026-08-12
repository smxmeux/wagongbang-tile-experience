import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://wagongbang-tile-experience.jiyour006.chatgpt.site"),
  title: "와공방 — 손으로 빚는 원통와통 기와 체험",
  description: "흙을 옮기고 붓과 칼을 직접 움직이며 완성하는 아홉 단계 전통 기와 제작 체험",
  openGraph: {
    title: "와공방 — 손으로 빚는 기와 체험",
    description: "마우스와 손가락으로 직접 만드는 전통 기와",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "와공방 손으로 빚는 기와 체험" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
