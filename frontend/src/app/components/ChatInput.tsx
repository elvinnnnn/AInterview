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
      className={`mx-20 flex items-start p-2 ${botText ? "slide-down" : ""}`}
    >
      <input
        value={userText}
        onChange={setUserText}
        onKeyUp={handleEnter}
        type="text"
        placeholder="Your response..."
        className="uninteractable bg-lightgray mr-1 w-5/6 rounded-lg px-2 py-1"
      />
      <button
        className="button ml-1 w-1/6 rounded-lg py-1 text-gray-500 hover:bg-gray-200"
        onClick={handleSendChat}
      >
        {">>>"}
      </button>
    </div>
  );
}
