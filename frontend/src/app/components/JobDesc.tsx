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
  setDbId: React.Dispatch<React.SetStateAction<string>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setInSession: React.Dispatch<React.SetStateAction<boolean>>;
  setJobTitle: React.Dispatch<React.SetStateAction<string>>;
  inSession: boolean;
}

export default function JobDesc({
  setMessages,
  setDbId,
  setIsLoading,
  setInSession,
  setJobTitle,
  inSession,
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
      const res = await axios.post(`${BACKEND}/api/dialogue`, description, {
        headers: HEADERS,
      });
      console.log(res.data);
      setMessages((prev) => [
        ...prev,
        { isUser: false, text: res.data.greeting },
      ]);
      setJobTitle(res.data.title);
      setDbId(res.data.id);
      setInSession(true);
      setIsLoading(false);
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

  const reset = async () => {
    try {
      axios.delete("http://localhost:5000/wipe");
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };
  return inSession ? (
    <button
      className="button text-gray-500 hover:bg-gray-200 h-[50px] w-full rounded-lg"
      onClick={reset}
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
