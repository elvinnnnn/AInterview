"use client";
import React, { useState } from "react";
import axios from "axios";
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_ADDR;
const HEADERS = {
  "Content-Type": "application/json",
};
import { Message } from "../types";

interface JobDescProps {
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setInSession: React.Dispatch<React.SetStateAction<boolean>>;
  setJobTitle: React.Dispatch<React.SetStateAction<string>>;
  inSession: boolean;
  handleDialogueOpen: (dialogueId: string, userId: string) => void;
}

export default function JobDesc({
  setMessages,
  setIsLoading,
  setInSession,
  setJobTitle,
  inSession,
  handleDialogueOpen,
}: JobDescProps) {
  const [description, setDescription] = useState<string>("");

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setDescription(e.target.value);
  };

  const handleSendDescription = async () => {
    // Send description to backend OpenAI API
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (token && userId) {
        const res = await axios.post(
          `${BACKEND}/api/dialogue`,
          { description: description, userId: userId },
          {
            headers: HEADERS,
          },
        );
        setMessages((prev) => [
          ...prev,
          { isUser: false, text: res.data.greeting },
        ]);
        console.log(res.data);
        console.log(res.data.id);
        setJobTitle(res.data.title);
        localStorage.setItem("dialogueId", res.data.id);
        handleDialogueOpen(res.data.id, userId);
        setInSession(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      setIsLoading(true);
      handleSendDescription();
      setDescription("");
    }
  };

  return inSession ? (
    <button
      className="button text-gray-500 hover:bg-gray-200 h-[50px] w-full rounded-lg"
      onClick={() => {
        localStorage.removeItem("dialogueId");
        window.location.reload();
      }}
    >
      Try another interview?
    </button>
  ) : (
    <textarea
      id="description-input"
      value={description}
      onChange={handleDescriptionChange}
      onKeyUp={handleEnter}
      placeholder="Paste the job description here..."
      className="jobdesc uninteractable h-full w-full resize-none rounded-lg border-4 border-lightgray bg-gray p-2 text-white"
    />
  );
}
