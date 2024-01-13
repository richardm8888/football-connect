import React, { useEffect } from "react";
// import fetch from 'node-fetch';

export const PuzzleDataContext = React.createContext();

function PuzzleDataProvider({ children }) {
    const [gameData, setGameData] = React.useState([]);

    useEffect(() => {
        fetch("/api/game")
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(result);
                    setGameData(result.GameData);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.log(error);
                }
            );
    }, []);


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
