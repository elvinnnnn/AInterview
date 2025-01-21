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
    <div id="chat-input" className="mx-5 flex items-start">
      <input
        value={userText}
        onChange={setUserText}
        onKeyUp={handleEnter}
        type="text"
        placeholder="Your response..."
        className="uninteractable mr-1 w-full rounded-lg bg-lightgray px-2 py-1 text-white"
      />

      <button
        className="button text-gray-500 hover:bg-gray-200 ml-1 rounded-lg p-1"
        onClick={handleSendChat}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
          />
        </svg>
      </button>
    </div>
  );
}
