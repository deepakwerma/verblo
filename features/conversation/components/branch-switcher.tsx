"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GitBranchIcon, PencilIcon, TrashIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  switchBranch,
  renameBranch,
  deleteBranch,
} from "../actions/branch-actions";

type BranchListItem = {
  id: string;
  conversationId: string;
  name: string;
  parentMessageId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type BranchSwitcherProps = {
  conversationId: string;
  branches: BranchListItem[];
  activeBranchId: string;
};

export function BranchSwitcher({
  conversationId,
  branches,
  activeBranchId,
}: BranchSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // sirf Main branch hai aur koi aur branch nahi bani, toh switcher dikhane ki zaroorat nahi
  if (branches.length <= 1) return null;

  const activeBranch = branches.find((b) => b.id === activeBranchId);

  const handleSwitch = (branchId: string) => {
    startTransition(async () => {
      try {
        await switchBranch(conversationId, branchId);
        router.refresh();
      } catch (error) {
        toast.error("Branch switch nahi ho payi");
      }
    });
  };

  const handleRename = (branchId: string, currentName: string) => {
    const name = prompt("Branch ka naya naam:", currentName);
    if (!name || name.trim() === "") return;

    startTransition(async () => {
      try {
        await renameBranch(conversationId, branchId, name.trim());
        router.refresh();
      } catch (error) {
        toast.error("Rename fail ho gaya");
      }
    });
  };

  const handleDelete = (branchId: string, name: string) => {
    if (!confirm(`"${name}" branch delete karni hai? Ye undo nahi hogi.`))
      return;

    startTransition(async () => {
      try {
        await deleteBranch(conversationId, branchId);
        router.refresh();
      } catch (error) {
        toast.error("Delete fail ho gaya (Main branch delete nahi ho sakti)");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={isPending}
          >
            <GitBranchIcon className="size-3.5" />
            {activeBranch?.name ?? "Main"}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        {branches.map((branch) => (
          <DropdownMenuItem
            key={branch.id}
            className="flex items-center justify-between gap-2"
            onSelect={(e) => {
              e.preventDefault();
              handleSwitch(branch.id);
            }}
          >
            <span
              className={
                branch.id === activeBranchId
                  ? "font-medium truncate"
                  : "truncate text-muted-foreground"
              }
            >
              {branch.name}
            </span>

            {branch.parentMessageId && (
              <span className="flex shrink-0 items-center gap-1">
                <PencilIcon
                  className="size-3.5 hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename(branch.id, branch.name);
                  }}
                />
                <TrashIcon
                  className="size-3.5 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(branch.id, branch.name);
                  }}
                />
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
