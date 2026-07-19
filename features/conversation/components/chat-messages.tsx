"use client";

import { isTextUIPart, type UIMessage } from "ai";
import type { ChatStatus } from "ai";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Loader } from "@/components/ai-elements/loader";
import { BranchButton } from "./branch-button";

function getMessageText(message: UIMessage) {
  return message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join("");
}

type ChatMessagesProps = {
  messages: UIMessage[];
  status: ChatStatus;
  conversationId: string;
};

export function ChatMessages({
  messages,
  status,
  conversationId,
}: ChatMessagesProps) {
  const isWaiting = status === "submitted" && messages.at(-1)?.role === "user";

  return (
    <Conversation>
      <ConversationContent className="py-8">
        {messages.map((message) => (
          <div key={message.id} className="group">
            <Message from={message.role}>
              <MessageContent>
                <MessageResponse>{getMessageText(message)}</MessageResponse>
              </MessageContent>
            </Message>
            <div
              className={
                message.role === "user" ? "flex justify-end pr-2" : "pl-2"
              }
            >
              <BranchButton
                conversationId={conversationId}
                messageId={message.id}
              />
            </div>
          </div>
        ))}

        {isWaiting ? (
          <Message from="assistant">
            <MessageContent>
              <Loader />
            </MessageContent>
          </Message>
        ) : null}
      </ConversationContent>
    </Conversation>
  );
}
