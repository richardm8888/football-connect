import React, { useEffect } from "react";
import Header from "../../components/Header";

export const PuzzleDataContext = React.createContext();

function PuzzleDataProvider({ difficulty, children }) {
    const [gameData, setGameData] = React.useState({});

    useEffect(() => {
        fetch("/api/game?difficulty=" + difficulty)
            .then(res => res.json())
            .then(
                (result) => {
                    
                    setGameData({...gameData, [difficulty]: result.GameData});
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.log(error);
                }
            );
    }, []);

    if (!gameData[difficulty]?.length) {
        return (
            <div className="wrapper">
                <Header showInfo={true} />
                <div className={`game-wrapper`}>
                    <p>LOADING...</p>
                </div>
            </div>
        );
    }

    const categorySize = gameData[difficulty][0]?.words?.length ?? 0;
    const numCategories = gameData[difficulty][0]?.length ?? 0;

    return (
        <PuzzleDataContext.Provider
            value={{ gameData: gameData[difficulty], numCategories, categorySize }}
        >
            {children}
        </PuzzleDataContext.Provider>
    );
}

export default PuzzleDataProvider;
