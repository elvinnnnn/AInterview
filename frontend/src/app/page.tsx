import React from "react";

export default function Home() {
  return (
    <div className="flex h-screen justify-center">
      <div className="grid grid-rows-6 w-1/2">
        <div className="flex items-end">
          <div id="mascot" className="w-1/2 text-5xl">
            {"( ^ 0^)/"}
          </div>
          <input
            type="text"
            placeholder="Enter job description here"
            className="w-1/2"
          />
        </div>
        <div
          id="chatbox"
          className="flex row-span-3 border-solid border-2"
        ></div>
        <div id="chatinput">
          <input type="text" placeholder="Your response..." className="w-3/4" />
          <button className="button w-1/4">{">>>"}</button>
        </div>
      </div>
    </div>
  );
}
