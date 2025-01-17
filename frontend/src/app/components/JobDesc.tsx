"use client";
import React, { useState } from "react";
import axios from "axios";
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_ADDR;
const HEADERS = {
  "Content-Type": "application/json",
};
interface JobDescProps {
  setBotText: React.Dispatch<React.SetStateAction<string>>;
  setDbId: React.Dispatch<React.SetStateAction<string>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setInSession: React.Dispatch<React.SetStateAction<boolean>>;
  inSession: boolean;
}

export default function JobDesc({
  setBotText,
  setDbId,
  setIsLoading,
  setInSession,
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
      setBotText(res.data.greeting);
      setDbId(res.data.id);
      setInSession(true);
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
      className="button my-2 ml-40 mr-5 w-1/2 rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-200 md:mx-20"
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
      placeholder="Paste in the job description here..."
      className="uninteractable border-lightgray bg-gray h-full w-full resize-none rounded-lg border-4"
    />
  );
}
