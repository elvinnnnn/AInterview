import React from "react";

interface ChatInputProps {
  botText: string;
  userText: string;
  setUserText: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleEnter: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSendChat: () => void;
}

export default function ChatInput({
  botText,
  userText,
  setUserText,
  handleEnter,
  handleSendChat,
}: ChatInputProps) {
  return (
    <div
      id="chat-input"
      className={`flex items-start mx-20 p-2 ${botText ? "slide-down" : ""}`}
    >
      <input
        value={userText}
        onChange={setUserText}
        onKeyUp={handleEnter}
        type="text"
        placeholder="Your response..."
        className="uninteractable w-5/6 rounded-lg mr-1 py-1 px-2"
      />
      <button
        className="button rounded-lg ml-1 py-1 hover:bg-gray-200 text-gray-500 w-1/6"
        onClick={handleSendChat}
      >
        {">>>"}
      </button>
    </div>
  );
}
