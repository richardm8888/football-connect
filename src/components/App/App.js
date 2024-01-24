import React from "react";
import Game from "../Game";

import Header from "../Header";
import InfoModal from "../modals/InfoModal";
import { MdOutlineSportsSoccer } from "react-icons/md";
import { Button } from "../ui/button";

import { Toaster } from "../ui/toaster";
import PuzzleDataProvider from "../../providers/PuzzleDataProvider";
import GameStatusProvider from "../../providers/GameStatusProvider";

function App() {
  const [isIntro, setIsIntro] = React.useState(true);
  const [isAd, setIsAd] = React.useState(false);
  const [difficulty, setDifficulty] = React.useState('easy');

  React.useEffect(() => {
    if (isAd) {
    	googletag.cmd.push(function() { googletag.display('div-gpt-ad-1706129779392-0'); });
    }
  }, [isAd]);


  if (isIntro || isAd) {
    return (
      <div className="wrapper">
        <Header showInfo={true} />
        <div className={`game-wrapper`}>
            <MdOutlineSportsSoccer size={'50px'} color={'#666666'} />
            {isIntro && (
              <>
                <h3 className="text-l text-center">The football player connections game</h3>
                <Button
                    size="lg"
                    variant="submit"
                    onClick={() => {
                      setIsIntro(false);
                      setIsAd(true);
                    }}
                >
                    {"Play"}
                </Button>
                <InfoModal 
                    trigger={(
                        <Button
                            size="lg"
                            variant="outline"
                        >
                            {"Rules"}
                        </Button>
                    )}
                />
              </>
            )}

            {isAd && (
              <>  
		    
		<div id='div-gpt-ad-1706129779392-0' style='min-width: 300px; min-height: 250px;'>
                <Button
                    size="lg"
                    variant="submit"
                    onClick={() => {
                      setDifficulty('easy');
                      setIsAd(false);
                    }}
                >
                    {"Easy"}
                </Button>
                <Button
                    size="lg"
                    variant="submit"
                    onClick={() => {
                      setDifficulty('medium');
                      setIsAd(false);
                    }}
                >
                    {"Medium"}
                </Button>
                <Button
                    size="lg"
                    variant="submit"
                    onClick={() => {
                      setDifficulty('hard');
                      setIsAd(false);
                    }}
                >
                    {"Hard"}
                </Button>
              </>
            )}
        </div>
      </div>
    );
  }

  return (
    <PuzzleDataProvider difficulty={difficulty}>
      <GameStatusProvider difficulty={difficulty}>
        <div className="wrapper">
          <Toaster />
          <Game difficulty={difficulty} />
        </div>
      </GameStatusProvider>
    </PuzzleDataProvider>
  );
}

export default App;
