import Textbox from "./Textbox";
import { Message } from "../types";

export default function Chatbox({ messages }: { messages: Message[] }) {
  // const handleSetBotText = (text: string) => {
  //     setBotText(text.charAt(0)); // To handle some unexpected behaviour. This is a workaround.
  //     let i = 0;
  //     const typeWriter = () => {
  //       if (i < text.length) {
  //         setBotText((prev) => prev + text.charAt(i));
  //         i++;
  //         setTimeout(typeWriter, 10);
  //       }
  //     };
  //     typeWriter();
  //   };
  return (
    <div
      id="chat-box"
      className="relative flex h-full flex-col border-4 border-lightgray bg-gray"
    >
      <div className="h-[8%] w-full border-b-4 border-lightgray" />
      <div className="flex max-h-[84%] flex-col justify-end overflow-y-auto">
        {messages.map((message, index) => (
          <Textbox key={index} isUser={message.isUser} input={message.text} />
        ))}
      </div>
      <div className="h-[8%] w-full border-t-4 border-lightgray" />
    </div>
  );
}
