import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";

function ChatContainer() {
  const { messages, getMessage, isMessageLoading, selectedUser, subscribeToMessage, unSubscribeFromMessage } =
    useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null)

  useEffect(() => {
    getMessage(selectedUser._id, getMessage);
    subscribeToMessage()
    return () => unSubscribeFromMessage();
  }, [selectedUser?._id, getMessage, subscribeToMessage, unSubscribeFromMessage]);

  useEffect(() => {
    if(messageEndRef.current && messages){
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessageLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "avatar.png"
                      : selectedUser.profilePic || "avatar.png"
                  }
                  alt="profilePic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {new Date(message.updatedAt).toLocaleTimeString()}
              </time>
            </div>
            <div className="flex chat-bubble">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
             {message.text && <p className="break-words whitespace-pre-wrap w-full">
                {message.text}
              </p>} 
            </div>
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
}

export default ChatContainer;
