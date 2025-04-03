import React from "react";
import { useNavigate } from "react-router-dom";

type GameOverProps = {
  score: number;
  language: string;
  level: string;
  timeLimit: number;
};

export const GameOver: React.FC<GameOverProps> = ({
  score,
  language,
  level,
  timeLimit,
}) => {
  const navigate = useNavigate();

  const handlePlayAgain = () => {
    // Redirect to game setup
    navigate("/");
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 text-center">
      <div className="flex flex-row items-center justify-center gap-2">
        <img src="./logo.png" alt="yapper" className="h-16"></img>
        <h2 className="text-2xl text-gray-800 text-center font-bold">yapper</h2>
      </div>
      <h1 className="text-3xl font-bold my-6">time's up!</h1>

      <div className="p-8 mb-6">
        <span className="text-xl">
          {language} - {level}
        </span>

        <p className="text-2xl font-bold mt-6">score: {score}</p>
        <p className="mt-2 text-gray-600">
          you answered {score} question{score !== 1 ? "s" : ""} correctly in{" "}
          {timeLimit} minute{score !== 1 ? "s" : ""}
        </p>
      </div>

      <button
        onClick={handlePlayAgain}
        className="bg-stone-600 text-white py-2 px-6 rounded-lg hover:bg-stone-700 transition-colors text-lg cursor-pointer"
      >
        play again
      </button>
    </div>
  );
};
