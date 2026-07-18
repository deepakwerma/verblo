import { auth } from "@clerk/nextjs/server";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { UserButton } from "@clerk/nextjs";

export default async function Home() {
  await auth.protect();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background text-foreground font-sans">
      <h1>Helllo World</h1>
      <ModeToggle />
      <UserButton/>
    </div>
  );
}