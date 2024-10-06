"use client";
import React from "react";
import Mascot from "../components/Mascot";
import Link from "next/link";

export default function Login() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="m-9"></div>
      <div className="relative text-5xl font-bold text-black dark:text-white">
        AInterview
      </div>
      <div className="text-black dark:text-white">
        Mock it till you rock it – every practice makes perfect!
      </div>
      <div className="m-14"></div>
      <Mascot
        loading={false}
        session={false}
        listening={false}
        frontpage={true}
      />
      <div className="relative justify-self-stretch">
        <input
          type="text"
          className="uninteractable rounded-lg py-1 px-2"
          placeholder="Username"
        />
      </div>
      <div className="relative justify-self-stretch">
        <input
          type="text"
          className="uninteractable rounded-lg py-1 px-2 m-2"
          placeholder="Password"
        />
      </div>
      <div>
        <Link
          href="/"
          className="block hover:bg-neutral-800 w-full p-4 text-white bg-black dark:text-black dark:bg-white font-bold py-2 px-4 rounded-full"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
