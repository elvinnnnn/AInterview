"use client";
import React, { useState } from "react";
import axios from "axios";
import Image from "next/image";
import Mascot from "./components/Mascot";

export default function Home() {
  const [textInput, setTextInput] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [botResponse, setBotResponse] = useState<string>("");

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  // Implementation for storing these sent chats not complete! Currently just moves on to the next question.
  // Need to think about whether to store an object that has questions+responses together on the frontend or backend. (probably backend)
  const handleSendChat = async () => {
    try {
      const res = await axios.put("http://localhost:5000/answer", textInput, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(res);
      setBotResponse(res.data);
      if (textInput != "") {
        setTextInput("");
      }
    } catch (error) {
      console.error(error);
    }
  };

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
      setBotResponse(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
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
    <div className="flex h-screen justify-center">
      <button
        onClick={reset}
        id="title"
        className="fixed top-0 left-0 text-4xl font-bold"
      >
        AInterview
      </button>
      <div className="grid grid-rows-6 w-11/12 sm:w-10/12 lg:w-9/12 xl:w-8/12 2xl:w-1/2">
        <div className="relative flex items-end">
          <Mascot />
          <div className="w-1/2" />
          {/* <input
            value={description}
            onChange={handleDescriptionChange}
            onKeyUp={handleEnter}
            type="text"
            placeholder="Enter job description here"
            className="w-1/2"
          /> */}
        </div>
        <div id="chat-box" className="relative flex row-span-4 mx-2 md:mx-16">
          <button className="absolute right-0">
            <Image
              id="cog"
              src="/cog.png"
              alt="cog"
              width={30}
              height={30}
            ></Image>
          </button>
          {botResponse == "" ? (
            <div>
              <div id="bot-textbox-arrow" className="ml-26 md:ml-12"></div>
              <div
                id="bot-textbox"
                className="top-0 left-0 absolute flex items-center justify-center w-10/12 h-1/3 m-3 shadow-lg p-5"
              >
                {botResponse}
              </div>
            </div>
          ) : null}
          {textInput != "" ? (
            <div>
              <div
                id="user-textbox-arrow"
                className="bottom-0 right-0 absolute mb-6"
              ></div>
              <div
                id="user-textbox"
                className="bottom-0 right-0 absolute flex items-center justify-center p-5 m-3 shadow-lg"
              >
                {textInput}
              </div>
            </div>
          ) : null}
        </div>
        <div id="chatinput" className="mx-20 p-2 flex items-start">
          <input
            value={textInput}
            onChange={handleTextInputChange}
            type="text"
            placeholder=" Your response..."
            className="w-5/6 rounded-lg mr-1 py-1"
          />
          <button
            className="button w-1/6 rounded-lg ml-1 py-1 hover:bg-gray-200 text-gray-500"
            onClick={handleSendChat}
          >
            {">>>"}
          </button>
        </div>
      </div>
    </div>
  );
}
