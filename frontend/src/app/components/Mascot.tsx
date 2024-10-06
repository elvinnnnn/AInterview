import React from "react";

const MascotFace = ({ face }: { face: string }) => (
  <div
    className={
      "mascot uninteractable animate-jump preserve-whitespace text-5xl text-black dark:text-white absolute"
    }
  >
    {"  "}
    {face}
  </div>
);

const MascotSides = () => (
  <div
    className={
      "mascot uninteractable animate-jump-delayed preserve-whitespace text-5xl text-black dark:text-white absolute"
    }
  >
    {"("}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{")"}
  </div>
);

const MascotThinkingFace = () => (
  <div
    className={
      "mascot uninteractable animate-jump preserve-whitespace text-5xl text-black dark:text-white absolute"
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
}

const Mascot = ({ loading, session, listening, frontpage }: MascotProps) => {
  if (frontpage) {
    return (
      <>
        <MascotFace face=".  ^-^  .  " />
        <MascotSides />
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
