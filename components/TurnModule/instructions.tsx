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
                <AccordionItemButton>Every game has at least one each of Stage, Phase, Round, Turn, and Step. Yours may have multiple of any of them. <em>Click to see explanations of these terms</em></AccordionItemButton>
              </AccordionItemHeading>
              <AccordionItemPanel className={css.accordionBody}>
                <p>The nomenclature around boardgames varies by region. Not all of us use the same terms for the same mechanisms, so for the purposes of this website, we will define exactly what we mean by each of the following terms.  This may not match what you call these items. We apologize - there was no way to make it match everyone's different expectation. What's most important is understanding what each of these mechanisms do and how they fit together to simulate your game.</p>
                <p><b>Stages</b> determine the rules in effect during gameplay. Many games have only a single stage because there is only ever one set of rules; however, inclusion of a setup stage with truncated rules is common, as is a final stage where players tally points from milestone awards or collected cards, etc.</p>
                <p><b>Phases</b> broadly determine what actions are available to players and may divide play into thematic chunks. For example, a farming game might have planting, growing, and harvesting phases each with its own kinds of actions to be taken.</p>
                <p><b>Rounds</b> are sequences where each player receives one full turn in some kind of order, with a new round started once each player has acted.  There are a lot of variations and options in rounds, including some that defy the traditional notion of one turn per player.</p>
                <p><b>Turns</b> are time windows during which a player performs one or more actions sequentially before another agent is allowed to act, though options may alter this through <em>interrupts</em> or <em>reactions</em>.</p>
                <p><b>Steps</b>, like phases, divide up when actions can be taken into a thematic order; however, all steps are still part of the same player's turn.</p>
                <p>These items connect together in specific ways:  Phases slot within Stages, and in this relationship we call the the Stage a <em>parent</em> and the Phase a <em>child</em>.  Stages can have multiple Phase children, and Phases can have multiple Stage parents.  Similarly, Rounds slot within Phases, Turns within Rounds, and Steps within Turns.  Components that belong to the same parent are all <em>siblings.</em></p>
                <p>The best way to think of these components is as definitions of game behavior.  Once you've created a "card" for a particular kind of Round, you are free to use it in as many different Phases as you like.  Each time you use it, you can attach it to different Turn cards to produce specific play mechanisms. This allows a great deal of creative flexibility without having to design similar components repeatedly.</p>
              </AccordionItemPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionItemHeading className={css.accordionHeading}>
                <AccordionItemButton>
                  The <b>Quick Start</b> button will create a simple game template for you; you can always change the names or add extra components afterward!
                </AccordionItemButton>
              </AccordionItemHeading>
            </AccordionItem>

            <AccordionItem>
              <AccordionItemHeading className={css.accordionHeading}>
                <AccordionItemButton>
                  The relationships you define between components dictate how the game will be played. <em>Click to see how.</em>
                </AccordionItemButton>
              </AccordionItemHeading>
              <AccordionItemPanel className={css.accordionBody}>
                <p>As the components are connected together, their names will be listed in their partners, either as children or parents. In the case of parents, the list is alphabetical and exists just to remind you where the component is used.  In the case of children, you can change the order displayed by dragging and dropping the names into the order you want.</p>
                <p>The child list determines the order in which children are executed.  This sequence will cycle until an end condition is reached in the parent.  When the parent completes, control passes to the next sibling.</p>
                <p>For example, suppose a game has three stages: the Beginning stage, the Main stage, and the Victory stage.  The Begining stage has two phases: Purchasing and Building, and the Main stage has three: Research, Purchasing, and Building.  The End Stage has only one phase: Counting.  The end condition for the Main stage is 12 buildings, and the end condition for the Beginning and Victory stages is finishing 1 round of each phase.</p>
                <p>In this example, the game will start with one round each of Purchasing and Building, and then cycle through Researching, Purchasing, and Building until somebody has 12 buildings. Finally, one last round will occur in the Counting phase where players tally the final score.</p>
              </AccordionItemPanel>      
            </AccordionItem>
            
            <AccordionItem>
              <AccordionItemHeading className={css.accordionHeading}>
                <AccordionItemButton>
                  Each of these components have options that define how the component behaves. They also have a space for you to write descriptive text about their purpose within the game. <em>Click to see specific details</em>
                </AccordionItemButton>
              </AccordionItemHeading>
              <AccordionItemPanel className={css.accordionBody}>
                <p><b>Stages</b></p>
                <p><b>Phases</b></p>
                <p><b>Rounds</b> contain options that allow you to choose how the round plays out.  The primary selection here is th turn type, of which there are many:
                  <ul>
                    <li><b>Fixed:</b> Turns progress through all players in fixed order</li>
                    <li><b>Progressive:</b> As fixed, but after 1 round the second player becomes first as the first becomes last</li>
                    <li><b>Last-First:</b> As fixed, but the last player in a round is the first player in the next</li>
                    <li><b>Random Start:</b> As fixed, but the first player is randomly chosen each turn</li>
                    <li><b>Random Turn:</b> The next player is chosen randomly from the list of those who have not yet gone</li>
                    <li><b>Static Stat:</b> As fixed, but the player with the high (or low) statistic goes first</li>
                    <li><b>Dynamic Stat:</b> The next player is always the one with the highest (or lowest) statistic</li>
                    <li><b>Pass Start:</b> The first player to pass goes first next round</li>
                    <li><b>Pass Turn:</b> Players go in the order they passed last round</li>
                    <li><b>Bid Start:</b> Players spend a component each round to become first player. Only the high bidder spends</li>
                    <li><b>Bid Turn:</b> Players spend to determine play order; all players spend</li>
                    <li><b>Action Start:</b> Players take a special action to determine first player</li>
                    <li><b>Action Turn:</b> players take a special action to determine round order</li>
                    <li><b></b></li>
                  </ul>
                </p>
                <p><b>Turns</b> contain options that allow you to determine how players choose actions</p>
                <p><b>Steps</b> contain a list of actions players are allowed to perform</p>
              </AccordionItemPanel>      
            </AccordionItem>

          </Accordion>
        </div>
      </Draggable>
    );
  }
  return null;
}