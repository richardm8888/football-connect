import React from "react";
import { MAX_MISTAKES } from "../../../lib/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import BaseModal from "../BaseModal";

function InfoModal({ trigger }) {
  return (
    <BaseModal
      title=""
      trigger={trigger}
      initiallyOpen={false}
      actionButtonText="Got It!"
    >
        <h2 class="text-xl">How To Play</h2>
        <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
            <AccordionTrigger>What's The Goal?</AccordionTrigger>
            <AccordionContent>
                Correctly connect the players by clubs they've played for.
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
            <AccordionTrigger>How Do I Play?</AccordionTrigger>
            <AccordionContent>
                Select the players you think are connected and tap 'Shoot' to check if your guess is correct.<br/>
                Fail to get all four players correct and you'll miss.<br/>
                Guess all four teams with your five penalty kicks to win your daily shootout.
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
            <AccordionTrigger>How difficult is it?</AccordionTrigger>
            <AccordionContent>
                Each of the four clubs has a different difficulty rating.<br />
                One club has no players who have played for any of the other clubs and the others can contain cross-overs.
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
            <AccordionTrigger>How Many Tries Do I Get?</AccordionTrigger>
            <AccordionContent>
            {`You can take ${MAX_MISTAKES} penalties before being knocked out of todays competition.`}
            </AccordionContent>
        </AccordionItem>
        </Accordion>
    </BaseModal>
  );
}

export default InfoModal;
