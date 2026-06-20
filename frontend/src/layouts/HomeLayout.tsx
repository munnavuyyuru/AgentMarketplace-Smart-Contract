import type { ReactNode } from "react";
import Navbar from "../components/Navbar";

type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-stone-100 text-black">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
