import React from "react";

const MascotFace = ({ face }: { face: string }) => (
  <div
    className={
      "mascot animate-jump preserve-whitespace absolute text-5xl text-white"
    }
  >
    {"  "}
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
      "mascot animate-jump preserve-whitespace absolute text-5xl text-white"
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

const Mascot = ({
  loading,
  session,
  listening,
  frontpage,
  message,
}: MascotProps) => {
  if (frontpage) {
    return (
      <>
        <MascotFace face=".  ^-^  .  " />
        <MascotSides />
        {message && (
          <div className="mascot-dialogue absolute mt-20 text-white">
            - {message} -
          </div>
        )}
      </>
    );
  }
  return !loading ? (
    <>
      {!session ? (
        <MascotFace face="^ .^" />
      ) : !listening ? (
        <MascotFace face="^ 0^ /" />
      ) : (
        <MascotFace face="^ -^" />
      )}
      <MascotSides />
    </>
  ) : (
    <>
      <MascotThinkingFace />
      <MascotSides />
    </>
  );
};

export default Mascot;
