export const queryKeys = {
  conversations: {
    all: ["conversations"] as const,
    detail: (id: string) => ["converstations", id] as const,
  },
  message: {
    byConversation: (conversationId: string) =>
      ["message", conversationId] as const,
  },
};
