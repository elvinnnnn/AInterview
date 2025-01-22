import React from "react";

const MascotFace = ({
  face,
  frontpage,
}: {
  face: string;
  frontpage: boolean;
}) => (
  <div
    className={
      "mascot animate-jump preserve-whitespace absolute text-5xl text-white"
    }
  >
    {frontpage ? "" : "  "}
    {face}
  </div>
);

const MascotSides = () => (
  <div
    className={
      "mascot animate-jump-delayed preserve-whitespace absolute text-5xl text-white"
    }
  >
    {"("}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{")"}
  </div>
);

const MascotThinkingFace = () => (
  <div
    className={
      "mascot animate-jump thinking preserve-whitespace absolute text-5xl text-white"
    }
  >
    {"  "}
    {"= w="} {"o"}
  </div>
);

interface MascotProps {
  loading: boolean;
  session: boolean;
  listening: boolean;
  frontpage: boolean;
  message?: string;
}

export default function Mascot({
  loading,
  session,
  listening,
  frontpage,
  message,
}: MascotProps) {
  if (frontpage) {
    return (
      <>
        <div className="mascot-container mr-6 flex items-center justify-center">
          <MascotFace face=".  ^-^  ." frontpage={frontpage} />
          <MascotSides />
        </div>
        <div className="m-6"></div>
        {message && (
          <div className="mascot-dialogue text-center text-white">
            - {message} -
          </div>
        )}
      </>
    );
  }
  return !loading ? (
    <div className="mascot-container">
      {!session ? (
        <MascotFace face="^ .^" frontpage={frontpage} />
      ) : !listening ? (
        <MascotFace face="^ 0^ /" frontpage={frontpage} />
      ) : (
        <MascotFace face="^ -^" frontpage={frontpage} />
      )}
      <MascotSides />
    </div>
  ) : (
    <div className="mascot-container">
      <MascotThinkingFace />
      <MascotSides />
    </div>
  );
}
