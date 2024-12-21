import { Mascot, Login } from "./components";

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
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
      <Login />
    </div>
  );
}
