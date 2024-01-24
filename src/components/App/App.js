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
  const banner = React.useRef<HTMLDivElement>(null);


  const atOptions = {
		'key' : '24f3077a26ed67ffedec91719e64ee1d',
		'format' : 'iframe',
		'height' : 250,
		'width' : 300,
		'params' : {}
	};

  useEffect(() => {
    if (banner.current && !banner.current.firstChild) {
        const conf = document.createElement('script')
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = `//www.highperformancedformats.com/${atOptions.key}/invoke.js`
        conf.innerHTML = `atOptions = ${JSON.stringify(atOptions)}`

        banner.current.append(conf)
        banner.current.append(script)
    }
  }, [banner]);

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

                <div ref={banner}></div>
                  
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
