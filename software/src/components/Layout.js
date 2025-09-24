import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout({ user, children }) {
  const [sideOpen, setSideOpen] = useState(false);

  return (
    <>
      <Header user={user} onToggleSidebar={() => setSideOpen(true)} />
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} user={user} />
      <main className="main">{children}</main>
    </>
  );
}
