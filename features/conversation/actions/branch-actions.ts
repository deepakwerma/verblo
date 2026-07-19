"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/features/auth/action/require-user";
import { revalidatePath } from "next/cache";


export async function getOrCreateMainBranch(conversationId: string) {
  let branch = await prisma.branch.findFirst({
    where: { conversationId, parentMessageId: null },
    orderBy: { createdAt: "asc" },
  });

  if (!branch) {
    branch = await prisma.branch.create({
      data: { conversationId, name: "Main", parentMessageId: null },
    });
    await prisma.message.updateMany({
      where: { conversationId, branchId: null },
      data: { branchId: branch.id },
    });
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { activeBranchId: branch.id },
    });
  }
  return branch;
}

export async function createBranch(
  conversationId: string,
  fromMessageId: string,
  name?: string
) {
  const user = await requireUser();

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: user.id },
  });
  if (!conversation) throw new Error("Conversation not found");

  const count = await prisma.branch.count({ where: { conversationId } });

  const branch = await prisma.branch.create({
    data: {
      conversationId,
      name: name ?? `Branch ${count}`,
      parentMessageId: fromMessageId,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { activeBranchId: branch.id },
  });

  revalidatePath(`/chat/${conversationId}`);
  return branch;
}


export async function getBranchMessages(branchId: string): Promise<any[]> {
  const branch = await prisma.branch.findUniqueOrThrow({ where: { id: branchId } });

  let history: any[] = [];
  if (branch.parentMessageId) {
    const parentMessage = await prisma.message.findUniqueOrThrow({
      where: { id: branch.parentMessageId },
    });
    const ancestorMessages = await getBranchMessages(parentMessage.branchId!);
    const cutoff = ancestorMessages.findIndex((m) => m.id === branch.parentMessageId);
    history = ancestorMessages.slice(0, cutoff + 1);
  }

  const own = await prisma.message.findMany({
    where: { branchId },
    orderBy: { createdAt: "asc" },
  });

  return [...history, ...own];
}


export async function listBranches(conversationId: string) {
  await getOrCreateMainBranch(conversationId);
  return prisma.branch.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
}

export async function switchBranch(conversationId: string, branchId: string) {
  const user = await requireUser();
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: user.id },
  });
  if (!conversation) throw new Error("Conversation not found");

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { activeBranchId: branchId },
  });
  revalidatePath(`/chat/${conversationId}`);
}

export async function renameBranch(conversationId: string, branchId: string, name: string) {
  await prisma.branch.update({ where: { id: branchId }, data: { name } });
  revalidatePath(`/chat/${conversationId}`);
}

export async function deleteBranch(conversationId: string, branchId: string) {
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch) return;
  if (branch.parentMessageId === null) throw new Error("Cannot delete Main branch");

  await prisma.branch.delete({ where: { id: branchId } }); // cascades its own messages

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (conversation?.activeBranchId === branchId) {
    const main = await getOrCreateMainBranch(conversationId);
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { activeBranchId: main.id },
    });
  }
  revalidatePath(`/chat/${conversationId}`);
}