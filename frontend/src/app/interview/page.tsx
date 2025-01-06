"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Topbar, ChatInput, Chatbox } from "../components";
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_ADDR;
const HEADERS = {
  "Content-Type": "application/json",
};

interface AnswerData {
  text: string;
  finished: boolean;
}

export default function Interview() {
  const [userText, setUserText] = useState<string>("");
  const [botText, setBotText] = useState<string>("");
  const [dbId, setDbId] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isFeedback, setIsFeedback] = useState<boolean>(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token === null) {
      router.push("/welcome");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleSendChat = async () => {
    try {
      setIsListening(true);
      const response = await axios.put(
        `${BACKEND}/api/dialogue`,
        { answer: userText, id: dbId },
        { headers: HEADERS },
      );
      setUserText("");
      setBotText("");
      delayedBotText(response.data);
    } catch (error) {
      console.error("Error sending answer:", error);
    }
  };

  const getReview = async (dbId: string) => {
    try {
      const response = await axios.get(`${BACKEND}/api/review/${dbId}`);
      console.log(response.data);
    } catch (error) {
      console.error("Error getting review:", error);
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

  const handleSetUserText = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUserText(e.target.value);

  return !isLoading ? (
    <div className="interview flex h-screen justify-center">
      <Link
        href="/"
        id="title"
        className="fixed left-0 top-0 text-4xl font-bold"
        role="title"
      >
        AInterview
      </Link>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          router.push("/welcome");
        }}
        className="fixed right-0 top-0 block rounded-full p-4 px-4 py-2 text-2xl font-bold text-white hover:bg-neutral-800 dark:bg-white dark:text-black"
      >
        Logout
      </button>
      <div className="grid w-11/12 grid-rows-6 sm:w-10/12 lg:w-9/12 xl:w-8/12 2xl:w-1/2">
        <Topbar
          setBotText={setBotText}
          setDbId={setDbId}
          isListening={isListening}
        />
        <Chatbox botText={botText} userText={userText} />
        {isFeedback ? (
          <div className="mx-20 flex items-start p-2">
            <button
              className="button ml-1 rounded-lg py-1 text-gray-500 hover:bg-gray-200"
              onClick={() => getReview(dbId)}
            >
              Review your Interview!
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
  ) : null;
}
