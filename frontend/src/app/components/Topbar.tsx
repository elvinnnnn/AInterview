"use client";
import React, { useState } from "react";
import Mascot from "./Mascot";
import axios from "axios";
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_ADDR;
const HEADERS = {
  "Content-Type": "application/json",
};

interface TopbarProps {
  setBotText: React.Dispatch<React.SetStateAction<string>>;
  setDbId: React.Dispatch<React.SetStateAction<string>>;
  isListening: boolean;
}
export default function Topbar({
  setBotText,
  setDbId,
  isListening,
}: TopbarProps) {
  const [description, setDescription] = useState<string>("");
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inSession, setInSession] = useState<boolean>(false);

  const handleSendDescription = async () => {
    // Send description to backend OpenAI API
    try {
      const res = await axios.post(`${BACKEND}/api/dialogue`, description, {
        headers: HEADERS,
      });
      console.log(res.data);
      setBotText(res.data.greeting);
      setDbId(res.data.id);
      setIsLoading(false);
      setInSession(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  return (
    <div className="relative flex items-end">
      {isLoading ? (
        <>
          <Mascot
            loading={isLoading}
            session={inSession}
            listening={isListening}
            frontpage={false}
          />
          <div className="w-1/2" />
          <div className="w-1/2" />
        </>
      ) : (
        <>
          <Mascot
            loading={isLoading}
            session={inSession}
            listening={isListening}
            frontpage={false}
          />
          <div className="w-1/2" />
          {inSession ? (
            <button
              className="button my-2 ml-40 mr-5 w-1/2 rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-200 md:mx-20"
              onClick={reset}
            >
              Try another interview?
            </button>
          ) : (
            <input
              id="description-input"
              value={description}
              onChange={handleDescriptionChange}
              onKeyUp={handleEnter}
              type="text"
              placeholder="Job description..."
              className="uninteractable my-2 ml-20 mr-5 w-1/2 rounded-lg px-2 py-1 md:mx-20"
            />
          )}
        </>
      )}
    </div>
  );
}
