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
  History,
} from "../components";
import { Message } from "../types";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_ADDR;
const HEADERS = {
  "Content-Type": "application/json",
};

interface AnswerData {
  text: string;
  finished: boolean;
}

export default function Interview() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userText, setUserText] = useState<string>("");
  const [dbId, setDbId] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isFeedback, setIsFeedback] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [inSession, setInSession] = useState<boolean>(false);
  const [jobTitle, setJobTitle] = useState<string>("");

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
      setMessages((prev) => [...prev, { isUser: true, text: userText }]);
      setIsListening(true);
      const response = await axios.put(
        `${BACKEND}/api/dialogue`,
        { answer: userText, id: dbId },
        { headers: HEADERS },
      );
      setUserText("");
      delayedBotText(response.data);
      setJobTitle(response.data.title);
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

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendChat();
      setUserText("");
    }
  };

  const delayedBotText = (data: AnswerData) => {
    setTimeout(() => {
      setMessages((prev) => [...prev, { isUser: false, text: data.text }]);
      if (data.finished) {
        setIsFeedback(true);
      }
      setIsListening(false); // This is for mascot animations.
    }, 1500);
  };

  const handleSetUserText = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUserText(e.target.value);

  return (
    <>
      <Navbar />
      <div className="my-4 flex h-[calc(100vh-96px)] flex-row space-x-4 xl:mx-24 2xl:mx-96">
        <div className="flex h-full w-1/3 flex-col">
          <div className="mb-2 h-auto">
            <JobDesc
              setMessages={setMessages}
              setDbId={setDbId}
              setIsLoading={setIsLoading}
              setInSession={setInSession}
              setJobTitle={setJobTitle}
              inSession={inSession}
            />
          </div>
          <History />
          <div className="mb-4"></div>
          <Preferences />
        </div>
        <div className="h-full w-2/3 items-center justify-center">
          <Mascot
            loading={isLoading}
            session={inSession}
            listening={isListening}
            frontpage={false}
          />
          <Chatbox messages={messages} jobTitle={jobTitle} />
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
