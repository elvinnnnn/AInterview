"use client";
import { Mascot, Auth } from "../components";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export default function Welcome() {
  const [message, setMessage] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const handleSetMessage = (msg: string) => setMessage(msg);

  const checkLogin = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: {
        id: string;
        unique_name: string;
        nbf: number;
        exp: number;
        iat: number;
      } = jwtDecode(token);
      setIsLoggedIn(true);
      console.log(decoded);
      setMessage(`Welcome back, ${decoded.unique_name}!`);
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  return (
    <div className="welcome flex h-screen flex-col items-center justify-center">
      <div className="m-9"></div>
      <div className="relative text-5xl font-bold text-white">AInterview</div>
      <div className="text-white">
        Mock it till you rock it – every practice makes perfect!
      </div>
      <div className={!isLoggedIn ? "m-14" : "m-24"}></div>
      <Mascot
        loading={false}
        session={false}
        listening={false}
        frontpage={true}
        message={message}
      />
      <Auth setMessage={handleSetMessage} loggedIn={isLoggedIn} />
    </div>
  );
}
