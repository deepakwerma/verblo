"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { GitBranchIcon } from "lucide-react";
import { toast } from "sonner";
import { createBranch } from "../actions/branch-actions";

type BranchButtonProps = {
  conversationId: string;
  messageId: string;
};

export function BranchButton({ conversationId, messageId }: BranchButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        await createBranch(conversationId, messageId);
        toast.success("Nayi branch ban gayi!");
        router.refresh();
      } catch (error) {
        toast.error("Branch nahi ban payi");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-1 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 disabled:opacity-50"
    >
      <GitBranchIcon className="size-3" />
      {isPending ? "Creating..." : "Branch from here"}
    </button>
  );
}