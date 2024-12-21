"use client";
import React, { useState } from "react";
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
    console.log(BACKEND);
    try {
      const response = await axios.post(
        `${BACKEND}/api/user`,
        { username: username, password: password },
        { headers: HEADERS },
      );
      console.log(response.data);
      localStorage.setItem("token", response.data);
      // res should return {userId: string, token: string}
      // If username and password are found in db, then let them in
      // If not match, tell them, and give them an option to register with those credentials instead
      router.push("/interview");
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
      <div>
        <button
          onClick={handleLogin}
          className="block w-full rounded-full bg-black p-4 px-4 py-2 font-bold text-white hover:bg-neutral-800 dark:bg-white dark:text-black"
        >
          Login
        </button>
      </div>
    </>
  );
}
