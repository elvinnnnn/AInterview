import React, { useEffect, useState } from "react";
import axios from "axios";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_ADDR;

interface Dialogue {
  id: string;
  jobTitle: string;
  userId: string;
  currentQuestionIndex: number;
  greeting: string;
  questions: string[];
  farewell: string;
}

export default function History({
  handleDialogueOpen,
}: {
  handleDialogueOpen: (dialogueId: string, userId: string) => void;
}) {
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (token && userId) {
        const response = await axios.get(`${BACKEND}/api/dialogue/all`, {
          params: {
            userId: userId,
          },
        });
        console.log(response.data);
        setDialogues(response.data);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="h-full w-full rounded-lg border-4 border-lightgray bg-gray text-center text-2xl text-white">
        History
        {dialogues.map((dialogue) => (
          <button
            key={dialogue.id}
            className="my-2 min-h-16 w-[94%] w-full rounded-md border-2 text-base"
            onClick={() => handleDialogueOpen(dialogue.id, dialogue.userId)}
          >
            {dialogue.jobTitle}
          </button>
        ))}
      </div>
    </>
  );
}
