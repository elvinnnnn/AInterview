"use client";
import React, { useState } from "react";
import Mascot from "./Mascot";
import axios from "axios";

interface TopbarProps {
  setBotResponse: React.Dispatch<React.SetStateAction<string>>;
  setDbId: React.Dispatch<React.SetStateAction<string>>;
  isListening: boolean;
}
export default function Topbar({
  setBotResponse,
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
      const res = await axios.post(
        "http://localhost:5000/dialogues",
        description,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(res.data);
      setBotResponse(res.data.greeting);
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
    <>
      {isLoading ? (
        <>
          <Mascot
            loading={isLoading}
            session={inSession}
            listening={isListening}
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
          />
          <div className="w-1/2" />
          {inSession ? (
            <button
              className="button w-1/2 rounded-lg ml-40 mr-5 md:mx-20 my-2 py-1 px-2 hover:bg-gray-200 text-gray-500"
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
              className="uninteractable w-1/2 ml-20 mr-5 md:mx-20 my-2 py-1 px-2 rounded-lg"
            />
          )}
        </>
      )}
    </>
  );
}
