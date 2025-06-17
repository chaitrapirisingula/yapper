import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type Language = "Telugu" | "Tamil" | "Spanish" | "Korean" | "Japanese";
type Level = "beginner" | "intermediate" | "advanced";
type QuestionType =
  | "word to definition"
  | "definition to word"
  | "fill in blank"
  | "synonyms"
  | "antonyms";

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const [language, setLanguage] = useState<Language>("Telugu");
  const [level, setLevel] = useState<Level>("beginner");
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    "word to definition",
    "definition to word",
  ]);
  const [timeLimit, setTimeLimit] = useState<number>(1);

  const languages: Language[] = [
    "Telugu",
    "Tamil",
    "Spanish",
    "Korean",
    "Japanese",
  ];
  const levels: Level[] = ["beginner", "intermediate", "advanced"];
  const allQuestionTypes: QuestionType[] = [
    "word to definition",
    "definition to word",
    "fill in blank",
    "synonyms",
    "antonyms",
  ];

  const handleQuestionTypeToggle = (type: QuestionType) => {
    if (questionTypes.includes(type)) {
      setQuestionTypes(questionTypes.filter((t) => t !== type));
    } else {
      setQuestionTypes([...questionTypes, type]);
    }
  };

  const handleStart = () => {
    // Pass in settings to game
    const queryString = new URLSearchParams({
      language,
      level,
      timeLimit: timeLimit.toString(),
      questionTypes: questionTypes.join(","),
    }).toString();

    navigate(`/game?${queryString}`);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6">
      <div className="flex flex-row items-center justify-center gap-2">
        <img src="./logo.png" alt="yapper" className="h-16"></img>
        <h2 className="text-2xl text-gray-800 text-center font-bold">yapper</h2>
      </div>

      {/* Language Selection */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* Level Selection */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          difficulty
        </label>
        <div className="flex flex-wrap gap-2">
          {levels.map((lvl) => (
            <button
              key={lvl}
              type="button"
              className={`px-4 py-2 rounded-md ${
                level === lvl
                  ? "bg-stone-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              onClick={() => setLevel(lvl)}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Question Types (Multiple Selection) */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">types</label>
        <div className="space-y-2">
          {allQuestionTypes.map((type) => (
            <div key={type} className="flex items-center">
              <input
                type="checkbox"
                id={`question-type-${type}`}
                checked={questionTypes.includes(type)}
                onChange={() => handleQuestionTypeToggle(type)}
                className="h-4 w-4 text-stone-600 rounded focus:ring-stone-500"
              />
              <label
                htmlFor={`question-type-${type}`}
                className="ml-2 text-gray-700"
              >
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Time Limit */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          duration: {timeLimit} minutes
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={timeLimit}
            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="w-12 text-gray-700">{timeLimit}</span>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={questionTypes.length === 0}
        className="w-full cursor-pointer bg-stone-600 text-white py-2 px-4 rounded-md 
             hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500 
             focus:ring-offset-2 transition-colors 
             disabled:cursor-not-allowed disabled:bg-stone-400 disabled:text-gray-300"
      >
        start
      </button>
    </div>
  );
};

export default Settings;
