import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "와공방 — 원통와통 기와 제작 체험",
  description: "흙 고르기부터 소성까지, 아홉 단계로 만나는 전통 기와 제작 체험",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
