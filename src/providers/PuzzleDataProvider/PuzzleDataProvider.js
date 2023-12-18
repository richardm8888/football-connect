import React, { useEffect } from "react";
// import { puzzleAnswers } from "../../lib/time-utils";
import getGameData from "../../generate";

export const PuzzleDataContext = React.createContext();

function PuzzleDataProvider({ children }) {
    useEffect(() => {
    getGameData().then((data) => {
        setGameData(data);   
    });
  }, []);

  const [gameData, setGameData] = React.useState([]);
  const categorySize = gameData[0]?.words?.length ?? 0;
  const numCategories = gameData?.length ?? 0;

  if (!gameData.length) {
    return <></>;
  }

  return (
    <PuzzleDataContext.Provider
      value={{ gameData, numCategories, categorySize }}
    >
      {children}
    </PuzzleDataContext.Provider>
  );
}

export default PuzzleDataProvider;
