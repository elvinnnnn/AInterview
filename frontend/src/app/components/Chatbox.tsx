import Textbox from "./Textbox";
import { Message } from "../types";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

export default function Chatbox({
  messages,
  jobTitle,
}: {
  messages: Message[];
  jobTitle: string;
}) {
  return (
    <div
      id="chat-box"
      className="relative flex h-full flex-col border-4 border-lightgray bg-gray"
    >
      <div className="flex h-[10%] min-h-20 w-full items-center justify-end border-b-4 border-lightgray pr-4 text-white">
        {jobTitle}
      </div>
      <SimpleBar
        style={{
          height: "84%",
          display: "flex",
          flexDirection: "column",
        }}
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
