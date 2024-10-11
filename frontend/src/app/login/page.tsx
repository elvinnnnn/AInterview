"use client";
import React, { useState } from "react";
import Mascot from "../components/Mascot";
import { useRouter } from "next/navigation";
import axios from "axios";
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_ADDR;
const HEADERS = {
  "Content-Type": "application/json",
};
export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        `${BACKEND}/login`,
        { username: username, password: password },
        { headers: HEADERS }
      );
      console.log(response.data);
      localStorage.setItem("token", response.data);
      // res should return {userId: string, token: string}
      // If username and password are found in db, then let them in
      // If not match, tell them, and give them an option to register with those credentials instead
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

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
          value={username}
          onChange={handleUsernameChange}
          placeholder="Username"
        />
      </div>
      <div className="relative justify-self-stretch">
        <input
          type="password"
          className="uninteractable rounded-lg py-1 px-2 m-2"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Password"
        />
      </div>
      <div>
        <button
          onClick={handleLogin}
          className="block hover:bg-neutral-800 w-full p-4 text-white bg-black dark:text-black dark:bg-white font-bold py-2 px-4 rounded-full"
        >
          Login
        </button>
      </div>
    </div>
  );
}
