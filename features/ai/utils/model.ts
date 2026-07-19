import { deepSeek } from "@ai-sdk/deepseek";

export const DEFAULT_CHAT_MODEL = "deepseek-v4-flash";

export function getChatModel(modelId?: string | null) {
  return deepSeek(modelId || DEFAULT_CHAT_MODEL);
}
