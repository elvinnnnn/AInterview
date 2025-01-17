import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function Navbar() {
  const router = useRouter();
  return (
    <div className="navbar border-b-4 border-lightgray bg-gray">
      <div className="mx-4 flex items-center justify-between">
        <Link href="/" id="title" className="text-4xl font-bold" role="title">
          AInterview
        </Link>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              router.push("/library");
            }}
            className="hover:bg-neutral-800 rounded-full text-2xl font-bold text-white"
          >
            Library
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/welcome");
            }}
            className="hover:bg-neutral-800 rounded-full text-2xl font-bold text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
