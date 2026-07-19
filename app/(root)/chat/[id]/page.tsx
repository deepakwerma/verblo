import { getConversation } from "@/features/conversation/actions/conversation-actions";
import React from "react";
import { notFound } from "next/navigation";

type ConversationPageProps = {
  params: Promise<{ id: string }>;
};

const page = async ({ params }: ConversationPageProps) => {
  const { id } = await params;

  try {
    await getConversation(id);
  } catch (error) {
    notFound();
  }

  return (
    <div>
      <h1>Conversation: {id}</h1>
    </div>
  );
};

export default page;
