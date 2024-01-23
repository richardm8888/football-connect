import React from "react";
import { shuffleGameData } from "../../lib/game-helpers";
import GameGrid from "../GameGrid";
import Header from "../Header";
import NumberOfMistakesDisplay from "../NumberOfMistakesDisplay";
import GameLostModal from "../modals/GameLostModal";
import GameWonModal from "../modals/GameWonModal";

import { Separator } from "../ui/separator";
import ConfettiExplosion from "react-confetti-explosion";

import { PuzzleDataContext } from "../../providers/PuzzleDataProvider";
import { GameStatusContext } from "../../providers/GameStatusProvider";
import GameControlButtonsPanel from "../GameControlButtonsPanel";

import ViewResultsModal from "../modals/ViewResultsModal";

function Game({ difficulty }) {
    const { gameData, categorySize, numCategories } =
        React.useContext(PuzzleDataContext);
    const { submittedGuesses, solvedGameData, isGameOver, isGameWon } =
        React.useContext(GameStatusContext);

    const [shuffledRows, setShuffledRows] = React.useState(
        shuffleGameData({ gameData })
    );

    const [isEndGameModalOpen, setisEndGameModalOpen] = React.useState(false);
    const [gridShake, setGridShake] = React.useState(false);
    const [showConfetti, setShowConfetti] = React.useState(false);

    // use effect to update Game Grid after a row has been correctly solved
    React.useEffect(() => {
        const categoriesToRemoveFromRows = solvedGameData.map(
            (data) => data.category
        );
        const dataLeftForRows = gameData.filter((data) => {
            return !categoriesToRemoveFromRows.includes(data.category);
        });
        if (dataLeftForRows.length > 0) {
            setShuffledRows(shuffleGameData({ gameData: dataLeftForRows }));
        }
    }, [solvedGameData]);

    // Handle End Game!
    React.useEffect(() => {
        if (!isGameOver) {
            return;
        }
        // extra delay for game won to allow confetti to show
        const modalDelay = isGameWon ? 2000 : 250;
        const delayModalOpen = window.setTimeout(() => {
            setisEndGameModalOpen(true);
            //unmount confetti after modal opens
            setShowConfetti(false);
        }, modalDelay);

        if (isGameWon) {
            setShowConfetti(true);
        }

        return () => window.clearTimeout(delayModalOpen);
    }, [isGameOver]);

    return (
        <>
            <Header showInfo={true} />

            <div className={`game-wrapper`}>
                <h3 className="text-l text-center">
                    {`Difficulty level: ${difficulty}`}
                </h3>
                <h3 className="text-l text-center">
                    Select {categorySize} players that have<br />played for the same club and take a shot
                </h3>
                {isGameOver && isGameWon ? (
                    <GameWonModal
                        open={isEndGameModalOpen}
                        submittedGuesses={submittedGuesses}
                    />
                ) : (
                    <GameLostModal
                        open={isEndGameModalOpen}
                        submittedGuesses={submittedGuesses}
                    />
                )}
                <GameGrid
                    gameRows={shuffledRows}
                    shouldGridShake={gridShake}
                    setShouldGridShake={setGridShake}
                />
                {showConfetti && isGameOver && (
                    <div className="grid place-content-center">
                        <ConfettiExplosion
                            particleCount={100}
                            force={0.8}
                            duration={2500}
                        />
                    </div>
                )}
                <Separator />

                {!isGameOver ? (
                    <>
                        <NumberOfMistakesDisplay />
                        <GameControlButtonsPanel
                            shuffledRows={shuffledRows}
                            setShuffledRows={setShuffledRows}
                            setGridShake={setGridShake}
                        />
                    </>
                ) : (
                    <ViewResultsModal />
                )}          
            </div>
        </>
    );
}

export default Game;
