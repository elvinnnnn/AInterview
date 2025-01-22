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
import { Message, DialogueQuestion } from "../types";

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
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
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

  useEffect(() => {
    const dialogueId = localStorage.getItem("dialogueId");
    const userId = localStorage.getItem("userId");
    if (dialogueId && userId) {
      handleDialogueOpen(dialogueId, userId);
      setInSession(true);
    }
  }, []);

  const handleDialogueOpen = async (dialogueId: string, userId: string) => {
    setMessages([]);
    try {
      const response = await axios.get(`${BACKEND}/api/dialogue/one`, {
        params: {
          dialogueId: dialogueId,
          userId: userId,
        },
      });
      console.log(response.data);
      console.log(response.data.messages);
      formatToMessage(response.data.messages);
      setJobTitle(response.data.jobTitle);
      localStorage.setItem("dialogueId", dialogueId);
    } catch (error) {
      console.error("Error getting dialogue:", error);
    }
  };

  const formatToMessage = (messages: { [key: number]: DialogueQuestion }) => {
    const mappedMessages = Object.values(messages).map((message) => ({
      question: message.question,
      answer: message.answer,
    }));
    for (const message of mappedMessages) {
      setMessages((prev) => [
        ...prev,
        { isUser: false, text: message.question },
      ]);

      if (message.answer === "") break; // Don't display unanswered questions
      setMessages((prev) => [...prev, { isUser: true, text: message.answer }]);
    }
  };

  const handleSendChat = async () => {
    try {
      setMessages((prev) => [...prev, { isUser: true, text: userText }]);
      setIsListening(true);
      const dialogueId = localStorage.getItem("dialogueId");
      console.log(dialogueId);
      const response = await axios.put(
        `${BACKEND}/api/dialogue`,
        { answer: userText, id: dialogueId },
        { headers: HEADERS },
      );
      setUserText("");
      if (response.data.finished) {
        setIsFinished(true);
      } else {
        delayedBotText(response.data);
      }
      setJobTitle(response.data.title);
    } catch (error) {
      console.error("Error sending answer:", error);
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
              setIsLoading={setIsLoading}
              setInSession={setInSession}
              setJobTitle={setJobTitle}
              handleDialogueOpen={handleDialogueOpen}
              inSession={inSession}
            />
          </div>
          <div className="h-2/3">
            <History handleDialogueOpen={handleDialogueOpen} />
          </div>
          <div className="mb-4" />
          <div className="h-1/3">
            <Preferences />
          </div>
        </div>
        <div className="h-full w-2/3 items-center justify-center">
          <Mascot
            loading={isLoading}
            session={inSession}
            listening={isListening}
            frontpage={false}
          />
          <Chatbox messages={messages} jobTitle={jobTitle} />
          <div id="chat-input">
            {isFinished ? (
              <div className="flex w-full items-start justify-center">
                <button
                  className="button text-gray-500 hover:bg-gray-200 button text-gray-500 hover:bg-gray-200 h-[50px] w-[94%] rounded-lg"
                  onClick={() => {
                    localStorage.removeItem("dialogueId");
                    window.location.reload();
                  }}
                >
                  Try another Interview?
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
      </div>
    </>
  );
}
