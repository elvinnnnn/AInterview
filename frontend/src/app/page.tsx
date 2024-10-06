"use client";
import React, { useState } from "react";
import axios from "axios";
import Image from "next/image";
import Topbar from "./components/Topbar";

const BACKEND_ADDR = process.env.NEXT_PUBLIC_BACKEND_ADDR;

export default function Home() {
  const [userInput, setUserInput] = useState<string>("");
  const [botResponse, setBotResponse] = useState<string>("");
  const [dbId, setDbId] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  // Implementation for storing these sent chats not complete! Currently just moves on to the next question.
  // Need to think about whether to store an object that has questions+responses together on the frontend or backend. (probably backend)
  const handleSendChat = async () => {
    try {
      setIsListening(true);
      const res = await axios.put(
        BACKEND_ADDR + "answer",
        { answer: userInput, id: dbId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setUserInput("");
      setBotResponse("");
      setTimeout(() => {
        console.log(res);
        setBotResponse(res.data);
        setIsListening(false);
      }, 1500);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen justify-center">
      <div id="title" className="fixed top-0 left-0 text-4xl font-bold">
        AInterview
      </div>
      <div className="grid grid-rows-6 w-11/12 sm:w-10/12 lg:w-9/12 xl:w-8/12 2xl:w-1/2">
        <div className="relative flex items-end">
          <Topbar
            setBotResponse={setBotResponse}
            setDbId={setDbId}
            isListening={isListening}
          />
        </div>
        <div id="chat-box" className="relative flex row-span-4 mx-2 md:mx-16">
          <button className="absolute right-0">
            <Image
              id="cog"
              src="/cog.png"
              alt="cog"
              width={30}
              height={30}
            ></Image>
          </button>
          {botResponse != "" ? (
            <div>
              <div id="bot-textbox-arrow" className="ml-26 md:ml-12"></div>
              <div
                id="bot-textbox"
                className="flex absolute top-0 left-0 items-center justify-center p-5 m-3 mr-10 uninteractable shadow-lg"
              >
                {botResponse}
              </div>
            </div>
          ) : null}
          {userInput != "" ? (
            <div>
              <div
                id="user-textbox-arrow"
                className=" absolute bottom-0 right-0 mb-6"
              ></div>
              <div
                id="user-textbox"
                className="flex absolute bottom-0 right-0 items-center justify-center p-5 m-3 uninteractable shadow-lg"
              >
                {userInput}
              </div>
            </div>
          ) : null}
        </div>
        <div id="chat-input" className="flex items-start mx-20 p-2">
          <input
            value={userInput}
            onChange={handleUserInputChange}
            type="text"
            placeholder="Your response..."
            className="uninteractable w-5/6 rounded-lg mr-1 py-1 px-2"
          />
          <button
            className="button w-1/6 rounded-lg ml-1 py-1 hover:bg-gray-200 text-gray-500"
            onClick={handleSendChat}
          >
            {">>>"}
          </button>
        </div>
      </div>
    </div>
  );
}
