import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Initialize Access | VidyaHub",
  description: "Securely activate your VidyaHub administrative or student node.",
};

export default function AcceptInviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
