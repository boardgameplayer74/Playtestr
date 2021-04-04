import React from 'react';
import { TurnModuleParams } from './index';
import Draggable from 'react-draggable';
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';
import css from './turn.module.css';


// this displays the TMI instructions when needed
export default function TMIInstructions(stateOf:TurnModuleParams){
  if (stateOf.showInstructions) {  
    return (
      <Draggable>
        <div className={css.instructions}>
          <h4>TMI Instructions
            <button 
              className={css.killInstuctions}
              onClick={()=>{
                stateOf.setShowInstructions(false);
              }}
            >X</button>
          </h4>
          <Accordion allowZeroExpanded className={css.accordion}>

            <AccordionItem>
              <AccordionItemHeading className={css.accordionHeading}>
                <AccordionItemButton>Every game has at least one each of Stage, Phase, Round, Turn, and Step. Yours may have multiple of any of them. Click to see explanations of these terms.</AccordionItemButton>
              </AccordionItemHeading>
              <AccordionItemPanel className={css.accordionBody}>
                <p>The nomenclature around boardgames varies by region. Not all of us use the same terms for the same mechanisms, so for the purposes of this website, we will define exactly what we mean by each of the following terms.  This may not match exactly what you call these items. We apologize - there was no way to mak it match everyone's different expectation. What most important, is understanding what each of these mechanisms do.</p>
                <p><b>Stages</b> determine the rules in effect during gameplay. Many games have only a single stage because there is only ever one set of rules; however, inclusion of a setup stage with truncated rules is common, as is a final stage where players tally points from milestone awards or collected cards, etc.</p>
                <p><b>Phases</b> broadly determine what actions are available to players and may divide play into thematic chunks. For example, a farming game might have planting, growing, and harvesting phases each with its own kinds of actions to be taken.</p>
                <p><b>Rounds</b> are sequences where each player receives one full turn in some kind of order, with a new round started once each player has acted.  There are a lot of variations and options in rounds, including some that defy the traditional notion of one turn per player.</p>
                <p><b>Turns</b> are time windows during which a player performs one or more actions sequentially before another agent is allowed to act, though options may alter this through <em>interrupts</em> or <em>reactions</em>.</p>
                <p><b>Steps</b>, like phases, divide up when actions can be taken into a thematic order; however, all steps are still part of the same player's turn.</p>
                <p>These items connect together in a specific way, which is that Phases slot within Stages, and we call the the Stage a parent and the Phase a child.  Stages can have multiple Phase children, and Phases can have multiple Stage parents.  Similarly, Rounds slot within Phases, Turns within Rounds, and Steps within Turns.</p>
                <p>The best way to think of these is as definitions of game behavior.  Once you've created a "card" for a particular kind of Round, you are free to use it in as many different Phases as you like.  Each time you use it, you can attach it to different Turn cards to produce specific play mechanisms.</p>
              </AccordionItemPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionItemHeading className={css.accordionHeading}>
                <AccordionItemButton>
                  The <b>Quick Start</b> button will create a simple game template for you; you can always change the names or add extra components later!
                </AccordionItemButton>
              </AccordionItemHeading>
            </AccordionItem>

            <AccordionItem>
              <AccordionItemHeading className={css.accordionHeading}>
                <AccordionItemButton>
                foo!
                </AccordionItemButton>
              </AccordionItemHeading>
              <AccordionItemPanel className={css.accordionBody}>
                bar!
              </AccordionItemPanel>      
            </AccordionItem>
            
          </Accordion>
        </div>
      </Draggable>
    );
  }
  return null;
}