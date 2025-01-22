"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_ADDR;
const HEADERS = {
  "Content-Type": "application/json",
};

interface AuthProps {
  setMessage: (message: string) => void;
  loggedIn: boolean;
}

export default function Auth({ setMessage, loggedIn }: AuthProps) {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token === null) {
      setIsLoading(false);
    }
  }, [router]);

  const handleAuth = async (endpoint: "login" | "register") => {
    try {
      const response = await axios.post(
        `${BACKEND}/api/user/${endpoint}`,
        { username: username, password: password },
        { headers: HEADERS },
      );
      console.log(response.data);
      setMessage(response.data.message);
      const decoded: {
        id: string;
        unique_name: string;
        nbf: number;
        exp: number;
        iat: number;
      } = jwtDecode(response.data.token);
      localStorage.setItem("userId", decoded.id);
      localStorage.setItem("token", response.data.token);
      setTimeout(() => router.push("/interview"), 1000); // if status OK, do this
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setMessage(error.response.data.message);
      }
      setTimeout(() => setMessage(""), 2000); // if status 400, do this
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUsername(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value);
  const handleLogin = () => handleAuth("login");
  const handleRegister = () => handleAuth("register");

  if (loggedIn) {
    return (
      <div className="flex">
        <button
          onClick={() => {
            router.push("/interview");
          }}
          className="hover:bg-neutral-800 block w-full rounded-full p-4 px-4 py-2 font-bold text-white dark:bg-white dark:text-black"
        >
          Interview
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            router.push("/");
          }}
          className="hover:bg-neutral-800 block w-full rounded-full p-4 px-4 py-2 font-bold text-white dark:bg-white dark:text-black"
        >
          Logout
        </button>
      </div>
    );
  }

  return !isLoading ? (
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
          className="hover:bg-neutral-800 block w-full rounded-full p-4 px-4 py-2 font-bold text-white dark:bg-white dark:text-black"
        >
          Login
        </button>
        <button
          onClick={handleRegister}
          className="hover:bg-neutral-800 block w-full rounded-full p-4 px-4 py-2 font-bold text-white dark:bg-white dark:text-black"
        >
          Register
        </button>
      </div>
    </>
  ) : null;
}
