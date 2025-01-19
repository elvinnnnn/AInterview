import React from "react";

interface ChatInputProps {
  userText: string;
  setUserText: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleEnter: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSendChat: () => void;
}

export default function ChatInput({
  userText,
  setUserText,
  handleEnter,
  handleSendChat,
}: ChatInputProps) {
  return (
    <div id="chat-input" className="mx-20 flex items-start">
      <input
        value={userText}
        onChange={setUserText}
        onKeyUp={handleEnter}
        type="text"
        placeholder="Your response..."
        className="uninteractable mr-1 w-5/6 rounded-lg bg-lightgray px-2 py-1 text-white"
      />
      <button
        className="button text-gray-500 hover:bg-gray-200 ml-1 w-1/6 rounded-lg py-1"
        onClick={handleSendChat}
      >
        {">>>"}
      </button>
    </div>
  );
}
