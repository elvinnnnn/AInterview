import Textbox from "./Textbox";
import { Message } from "../types";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import React, { useEffect, useRef } from "react";

export default function Chatbox({
  messages,
  jobTitle,
}: {
  messages: Message[];
  jobTitle: string;
}) {
  const simpleBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (simpleBarRef.current) {
      simpleBarRef.current.scrollTop = 1200;
    }
  }, [messages]);

  return (
    <div
      id="chat-box"
      className="relative flex h-full flex-col border-4 border-lightgray bg-gray"
    >
      <div className="flex h-[8%] min-h-20 w-full items-center justify-end border-b-4 border-lightgray pr-4 text-white">
        <div className="max-w-[50%] text-right">{jobTitle}</div>
      </div>
      <SimpleBar
        style={{
          height: "84%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
        scrollableNodeProps={{ ref: simpleBarRef }}
        className="simplebar-container"
      >
        <div className="flex-grow"></div>
        {messages.map((message, index) => (
          <Textbox key={index} isUser={message.isUser} input={message.text} />
        ))}
      </SimpleBar>
      <div className="h-[8%] w-full border-lightgray" />
    </div>
  );
}
