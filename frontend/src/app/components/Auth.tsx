"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_ADDR;
const HEADERS = {
  "Content-Type": "application/json",
};

interface AuthProps {
  setMessage: (message: string) => void;
}

export default function Auth({ setMessage }: AuthProps) {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleAuth = async (endpoint: string) => {
    try {
      const response = await axios.post(
        `${BACKEND}/api/user/${endpoint}`,
        { username: username, password: password },
        { headers: HEADERS },
      );
      setMessage(response.data.message);
      setTimeout(() => router.push("/interview"), 1000); // if status OK, do this
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setMessage(error.response.data.message);
      }
      setTimeout(() => setMessage(""), 2000); // if status 400, do this
    }
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleLogin = () => handleAuth("login");
  const handleRegister = () => handleAuth("register");

  return (
    <>
      <div className="relative justify-self-stretch">
        <input
          type="text"
          className="uninteractable rounded-lg px-2 py-1"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Username"
        />
      </div>
      <div className="relative justify-self-stretch">
        <input
          type="password"
          className="uninteractable m-2 rounded-lg px-2 py-1"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Password"
        />
      </div>
      <div className="flex">
        <button
          onClick={handleLogin}
          className="block w-full rounded-full bg-black p-4 px-4 py-2 font-bold text-white hover:bg-neutral-800 dark:bg-white dark:text-black"
        >
          Login
        </button>
        <button
          onClick={handleRegister}
          className="block w-full rounded-full bg-black p-4 px-4 py-2 font-bold text-white hover:bg-neutral-800 dark:bg-white dark:text-black"
        >
          Register
        </button>
      </div>
    </>
  );
}
