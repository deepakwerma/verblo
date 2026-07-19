"use client";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import React, { useMemo } from "react";
import { useConversations } from "../hooks/use-conversation";
import { queryKeys } from "../utils/query-keys";
import { toast } from "sonner";
import { ChatEmpty } from "./chat-empty";
import { ChatMessages } from "./chat-messages";
import { ChatComposer } from "./chat-composer";
import { BranchSwitcher } from "./branch-switcher";

type BranchListItem = {
  id: string;
  conversationId: string;
  name: string;
  parentMessageId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ConversationViewProps = {
  conversationId: string;
  initialMessages: UIMessage[];
  branches: BranchListItem[];
  activeBranchId: string;
};

export const ConversationView = ({
  conversationId,
  initialMessages,
  branches,
  activeBranchId,
}: ConversationViewProps) => {
  const queryClient = useQueryClient();
  const { data: conversations } = useConversations();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            id: conversationId,
            message: messages.at(-1),
          },
        }),
      }),
    [conversationId],
  );

  const { messages, sendMessage, status } = useChat({
    id: `${conversationId}:${activeBranchId}`,
    messages: initialMessages,
    transport,
    onFinish: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const title =
    conversations?.find((item) => item.id === conversationId)?.title ?? "Chat";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mx-1 h-4" />
        <h1 className="truncate text-sm font-medium">{title}</h1>
        <div className="ml-auto">
          <BranchSwitcher
            conversationId={conversationId}
            branches={branches}
            activeBranchId={activeBranchId}
          />
        </div>
      </header>

      {messages.length === 0 ? (
        <ChatEmpty />
      ) : (
        <ChatMessages
          messages={messages}
          status={status}
          conversationId={conversationId}
        />
      )}

      <ChatComposer
        onSend={(text) => {
          void sendMessage({ text });
        }}
        isSending={status !== "ready"}
        autoFocus
      />
    </div>
  );
};
