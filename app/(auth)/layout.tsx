import React, { Children } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col h-screen items-centre justify-centre">
      <div className="w-full max-w-md">{children}</div>
    </section>
  );
}
