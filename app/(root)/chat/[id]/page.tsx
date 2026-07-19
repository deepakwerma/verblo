import { loadChatMessages } from "@/features/ai/actions/chat-store";
import { getConversation } from "@/features/conversation/actions/conversation-actions";
import { getOrCreateMainBranch, listBranches } from "@/features/conversation/actions/branch-actions";
import { ConversationView } from "@/features/conversation/components/conversation-view";
import { notFound } from "next/navigation";
import React from "react";

type ConversationPageProps = {
  params: Promise<{ id: string }>;
};


const page = async ({ params }: ConversationPageProps) => {
  const { id } = await params;

  let conversation;
  try {
    conversation = await getConversation(id);
  } catch (error) {
    notFound();
  }

  
  const mainBranch = await getOrCreateMainBranch(id);
  const activeBranchId = conversation.activeBranchId ?? mainBranch.id;
  const branches = await listBranches(id);

  const initialMessages = await loadChatMessages(activeBranchId); 

  return (
    <ConversationView
      key={id}
      conversationId={id}
      initialMessages={initialMessages}
      branches={branches}          
      activeBranchId={activeBranchId} 
    />
  );
};

export default page;