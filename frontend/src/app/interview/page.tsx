"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  ChatInput,
  Chatbox,
  Navbar,
  JobDesc,
  Mascot,
  Preferences,
} from "../components";
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
  const [inSession, setInSession] = useState<boolean>(false);
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

  return (
    <>
      <Navbar />
      <div className="my-4 flex h-[calc(100vh-96px)] flex-row space-x-4 border-2 xl:mx-24 2xl:mx-96">
        <div className="flex h-full w-1/3 flex-col space-y-2">
          <div className="h-full border-2">
            <JobDesc
              setBotText={setBotText}
              setDbId={setDbId}
              setIsLoading={setIsLoading}
              setInSession={setInSession}
              inSession={inSession}
            />
          </div>
          <Preferences></Preferences>
        </div>
        <div className="h-full w-2/3 items-center justify-center border-2">
          <Mascot
            loading={isLoading}
            session={inSession}
            listening={isListening}
            frontpage={false}
          />
          <Chatbox botText={botText} userText={userText} />
          {isFeedback ? (
            <div className="mx-20 flex items-start p-2">
              <button
                className="button text-gray-500 hover:bg-gray-200 ml-1 rounded-lg py-1"
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
    </>
  );
}
