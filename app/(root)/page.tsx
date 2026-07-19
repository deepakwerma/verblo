import React from 'react'
import {startNewChat } from '@features/home/actions/start-new-chat'
import {redirect} from 'next/navigation'


const page = async() => {
  const conversationId = await startNewChat();

  redirect(`/chat/${conversationId}`);
}
export default page