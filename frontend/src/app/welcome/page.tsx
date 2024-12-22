"use client";
import { Mascot, Auth } from "../components";
import { useState } from "react";

export default function Welcome() {
  const [message, setMessage] = useState<string>("");
  const handleSetMessage = (msg: string) => {
    setMessage(msg);
  };
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="m-9"></div>
      <div className="relative text-5xl font-bold text-white">AInterview</div>
      <div className="text-white">
        Mock it till you rock it – every practice makes perfect!
      </div>
      <div className="m-14"></div>
      <Mascot
        loading={false}
        session={false}
        listening={false}
        frontpage={true}
        message={message}
      />
      <Auth setMessage={handleSetMessage} />
    </div>
  );
}
