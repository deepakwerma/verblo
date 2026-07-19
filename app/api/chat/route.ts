import {
  loadChatMessages,
  saveChatMessages,
} from "@/features/ai/actions/chat-store";
import { getChatModel } from "@features/ai/utils/model";
import { requireUser } from "@/features/auth/action/require-user";
import { getOrCreateMainBranch } from "@/features/conversation/actions/branch-actions";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { tools } from "@/features/ai/tools";
import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  stepCountIs,
  type UIMessage,
} from "ai";

export async function POST(req: Request) {
  await auth.protect();

  const { message, id }: { message: UIMessage; id: string } = await req.json();

  if (!message || !id) {
    return new Response("Missing message or conversation id", { status: 400 });
  }

  const user = await requireUser();

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  const mainBranch = await getOrCreateMainBranch(id);
  const activeBranchId = conversation.activeBranchId ?? mainBranch.id;

  const previousMessages = await loadChatMessages(activeBranchId);

  const alreadySaved = previousMessages.some(
    (storedMessage) => storedMessage.id === message.id,
  );

  const messages = alreadySaved
    ? previousMessages
    : [...previousMessages, message];

  if (!alreadySaved) {
    await saveChatMessages(id, activeBranchId, [message]);
  }

  const result = streamText({
    model: getChatModel(conversation.model),
    system:
      conversation.systemPrompt ?? "You are ChaiGpt , a helpful assistant",
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(5),
  });

  result.consumeStream();

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
      onEnd: async ({ messages: finalMessages }) => {
        try {
          await saveChatMessages(id, activeBranchId, finalMessages, {
            updateTitle: false,
          });
        } catch (error) {
          console.error(error);
        }
      },
    }),
  });
}
