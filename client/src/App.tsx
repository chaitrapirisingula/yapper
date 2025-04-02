import React from "react";
import { Route, Routes } from "react-router-dom";
import Settings from "./Settings";
import Game from "./Game";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Settings />} />
      <Route path="/game" element={<Game />} />
      <Route path="*" element={<Settings />} />
    </Routes>
  );
};

export default App;
