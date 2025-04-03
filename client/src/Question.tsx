import React from "react";

type QuestionCardProps = {
  questionType: string;
  question: string;
  userAnswer: string;
  feedback: string;
  setUserAnswer: (answer: string) => void;
  onSubmit: () => void;
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionType,
  question,
  userAnswer,
  feedback,
  setUserAnswer,
  onSubmit,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="py-6">
      <div className="mb-4">
        <span className="bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded">
          {questionType}
        </span>
      </div>

      <h2 className="text-xl font-bold mb-4">{question}</h2>

      <div className="mb-4">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type your answer here..."
          className="w-full p-3 border border-gray-300 rounded"
          autoFocus
        />
      </div>

      <button
        onClick={onSubmit}
        className="w-full bg-stone-600 text-white py-2 px-4 rounded hover:bg-stone-700 transition-colors cursor-pointer"
      >
        submit (or use enter key)
      </button>

      {feedback && (
        <div className="mt-4 p-3 bg-gray-300 rounded">{feedback}</div>
      )}
    </div>
  );
};
