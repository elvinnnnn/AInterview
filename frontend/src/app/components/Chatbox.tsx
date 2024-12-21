import Image from "next/image";
import Textbox from "./Textbox";

interface TextboxProps {
  botText: string;
  userText: string;
}

export default function Chatbox({ botText, userText }: TextboxProps) {
  return (
    <div id="chat-box" className="relative row-span-4 mx-2 flex md:mx-16">
      <button className="absolute right-0">
        <Image id="cog" src="/cog.png" alt="cog" width={30} height={30} />
      </button>
      {botText != "" ? (
        <Textbox
          isUser={false}
          css="top-0 left-0 p-5 m-3 mr-10"
          input={botText}
        />
      ) : null}
      {userText != "" ? (
        <Textbox
          isUser={true}
          css="bottom-0 right-0 p-5 m-3"
          input={userText}
        />
      ) : null}
    </div>
  );
}
