import React from "react";
import { range } from "../../lib/utils";
import { CircleSlash } from "lucide-react";
import { MAX_MISTAKES } from "../../lib/constants";
import { GameStatusContext } from "../../providers/GameStatusProvider";
import { MdOutlineSportsSoccer } from "react-icons/md";

function SingleMistakeDisplay({ isUsed }) {
  return (
    <div>
      {isUsed ? (
        <CircleSlash className="h-4 w-4 stroke-neutral-400" />
      ) : (
        <MdOutlineSportsSoccer size={'16px'} color={'#a3a3a3'} />
      )}
    </div>
  );
}

function NumberOfMistakesDisplay() {
  const { numMistakesUsed } = React.useContext(GameStatusContext);
  // array size of number of guess. [1, 2, 3, 4]
  const mistakeRange = range(MAX_MISTAKES);
  return (
    <div className="flex flex-row gap-x-4 justify-center items-center">
      <p className="text-base">Mistakes Remaining: </p>
      {mistakeRange.map((el) => (
        <SingleMistakeDisplay key={el} isUsed={el < numMistakesUsed} />
      ))}
    </div>
  );
}

export default NumberOfMistakesDisplay;
