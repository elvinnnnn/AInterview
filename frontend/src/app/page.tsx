"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { Topbar, Textbox, ChatInput } from "./components";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_ADDR;
const HEADERS = {
  "Content-Type": "application/json",
};

interface AnswerData {
  text: string;
  finished: boolean;
}

export default function Home() {
  const router = useRouter();
  const [userText, setUserText] = useState<string>("");
  const [botText, setBotText] = useState<string>("");
  const [dbId, setDbId] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isFeedback, setIsFeedback] = useState<boolean>(false);
  useEffect(() => {
    // Check if user is already logged in
    if (!localStorage.getItem("token")) {
      router.push("/login");
    }
    // If so, redirect to home page
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleSendChat = async () => {
    try {
      setIsListening(true);
      const response = await axios.put(
        `${BACKEND}/answer`,
        { answer: userText, id: dbId },
        { headers: HEADERS }
      );
      const data = response.data;
      setUserText("");
      setBotText("");
      delayedBotText(data);
    } catch (error) {
      console.error("Error sending answer:", error);
    }
  };

  const handleSetBotText = (text: string) => {
    setBotText(text.charAt(0)); // To handle some unexpected behaviour. This is a workaround.
    let i = 0;
    const typeWriter = () => {
      if (i < text.length) {
        setBotText((prev) => prev + text.charAt(i));
        i++;
        setTimeout(typeWriter, 10);
      }
    };
    typeWriter();
  };

  // UNDER CONSTRUCTION ***
  const getFeedback = async () => {
    try {
      const response = await axios.post(`${BACKEND}/feedback`, dbId, {
        headers: HEADERS,
      });
      setIsFeedback(false);
      console.log(response.data);
    } catch (error) {
      console.error("Error getting feedback:", error);
    }
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendChat();
      setUserText("");
    }
  };

  const delayedBotText = (data: AnswerData) => {
    setTimeout(() => {
      handleSetBotText(data.text);
      if (data.finished) {
        setIsFeedback(true);
      }
      setIsListening(false); // This is for mascot animations.
    }, 1000);
  };

  const handleSetUserText = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserText(event.target.value);
  };

  return (
    <div className="flex h-screen justify-center">
      <Link
        href="/login"
        id="title"
        className="fixed top-0 left-0 text-4xl font-bold"
        role="title"
      >
        AInterview
      </Link>
      <button
        onClick={logout}
        className="fixed top-0 right-0 text-2xl font-bold text-black dark:text-white"
      >
        Logout
      </button>
      <div className="grid grid-rows-6 w-11/12 sm:w-10/12 lg:w-9/12 xl:w-8/12 2xl:w-1/2">
        <Topbar
          setBotText={setBotText}
          setDbId={setDbId}
          isListening={isListening}
        />
        <div id="chat-box" className="relative flex row-span-4 mx-2 md:mx-16">
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
        {isFeedback ? (
          <div className="flex items-start mx-20 p-2">
            <button
              className="button rounded-lg ml-1 py-1 hover:bg-gray-200 text-gray-500"
              onClick={getFeedback}
            >
              Get Feedback!
            </button>
          </div>
        ) : (
          <ChatInput
            botText={botText}
            userText={userText}
            setUserText={handleSetUserText}
            handleEnter={handleEnter}
            handleSendChat={handleSendChat}
          />
        )}
      </div>
    </div>
  );
}
