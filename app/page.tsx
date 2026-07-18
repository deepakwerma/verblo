import { ModeToggle } from "@/components/ui/mode-toggle";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background text-foreground font-sans">
      <h1>Helllo World</h1>
      <ModeToggle />
    </div>
  );
}