import React from "react";

interface MascotProps {
  loading: boolean;
  session: boolean;
  listening: boolean;
}

export default function Mascot({ loading, session, listening }: MascotProps) {
  return !loading ? (
    <>
      {!session ? (
        <div className="mascot uninteractable absolute animate-jump preserve-whitespace text-5xl">
          {"  "}
          {"^ -^"}
        </div>
      ) : !listening ? (
        <div className="mascot uninteractable absolute animate-jump preserve-whitespace text-5xl">
          {"  "}
          {"^ 0^"} {"/"}
        </div>
      ) : (
        <div className="mascot uninteractable absolute animate-jump preserve-whitespace text-5xl">
          {"  "}
          {"^ -^"}
        </div>
      )}
      <div className="mascot uninteractable absolute animate-jump-delayed preserve-whitespace text-5xl">
        {"("}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{")"}
      </div>
    </>
  ) : (
    <>
      <div className="mascot thinking uninteractable absolute animate-jump preserve-whitespace text-5xl">
        {"  "}
        {"= w="} {"o"}
      </div>
      <div className="mascot uninteractable absolute animate-jump-delayed preserve-whitespace text-5xl">
        {"("}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{")"}
      </div>
    </>
  );
}
