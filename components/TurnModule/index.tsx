import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import css from './turnModule.module.css';

/**
 * Steps are sets of Actions that users are required to pick from in sequential 
 * order. Turns may have a single step with a single available action, a single 
 * step with many available actions, or many steps each with it's own distinct 
 * set of available actions.  
 * Some designers call steps "Sequential Phases" or sometimes even just phases.
 */
import { Step, NEW_STEP, drawStep } from './drawStep';
 
/**
 * Turn are the time window during which a single agent performs one or more 
 * actions sequentially before another agent is allowed to act, though 
 * interrupts and reactions may alter this. Turns have one or more steps 
 * which define a particular order that actions must be taken in. 
 * Multiple turns may be defined, typically one for each phase because the 
 * available actions are different
 * Turns are pre-defined structures that are selected by the designer 
 */
import { Turn, NEW_TURN, drawTurn } from './drawTurn';

/**
 * The turn module is responsible for controlling the flow of the game and 
 * determining which agent acts next. Its settings are chosen from within the 
 * Turn Module Interface (TMI), but many parameters come from other modules.
 * The TMI uses four kinds of structures to coordinate the flow of the game:
 * stages, phases, rounds, turns, and steps
 */
const FLOW_PARTS = ['stage','phase','round','turn','step'];

/**
 * rounds are the game structure that determines the specific order in which 
 * agents may act. Rounds have one of a predetermined list of types and may 
 * also include specific interrupts and reactions that can temporarily alter 
 * turn order. Only specific actions are allowed to interrupt or react and 
 * agents must have access to those actions as indicated by a 
 * tracking component
 * Rounds are pre-defined structures that are selected by teh designer
 */
import { Round, NEW_ROUND, drawRound } from './drawRound';

/**
 * Phases are the game structure that broadly determine which actions are 
 * available to the agents; these sets of actions may be reduced by the 
 * current component state, but will never be increased. In other words: 
 * if an agent can do it, it must be listed in the phase definition first.
 * Phases are repeatable, both individually and in cycles; that is recorded 
 * in the stage definition
 * It's possible that phases get their actions from the embedded turns
 */
import { Phase, NEW_PHASE, drawPhase } from './drawPhase';

/**
 * Stages are the largest structure in game flow, and are responsible for 
 * determining the current rules set of the game. Stages frequently play very 
 * differently from each other. All games have at least one stage, with 
 * specialized "startup" and "cleanup" stages being the most common additional 
 * stages. However, games can have any positive number of stages.
 */
import { Stage, NEW_STAGE, drawStage } from './drawStage';

// we use this to capitalize the first letter of a word
import { capitalize } from '../../scripts/naming';

/**
 * This exports the type we need for the parent module to interact with the TMI
 * This interface is really only used to type the part of the parent's state 
 * that is passed back into the TMI in order to interact with the model.
 */
export interface TurnModuleParams {
  stages: Array<Stage>; // list of Stages (Acts) used in the game
  setStages: Function;  // function to change the saved stages
  phases: Array<Phase>; // list of Phases used in the game
  setPhases: Function;  // function to change the saved phases
  rounds: Array<Round>; // list of Rounds used in the game
  setRounds: Function;  // function to change the saved rounds
  turns: Array<Turn>;   // list of Turns used in the game
  setTurns: Function;   // function to change the saved turns
  steps: Array<Step>;   // list of Steps used in the game
  setSteps: Function;   // function to change the saved steps

  // functions!
  add: Function,
  remove: Function,
  moveUp: Function,
  moveDown: Function,
}

/**
 * The Turn Module State function sets the value of the state object and then
 * returns that object ot be embedded in a parent state object.
 */
export function TurnModuleState(){
  // this is where we set the initial state values
  let stage = JSON.parse(JSON.stringify(NEW_STAGE));
  stage.id = uuidv4();
  const [stages,setStages] = useState([stage]);

  let phase = JSON.parse(JSON.stringify(NEW_PHASE));
  phase.id = uuidv4();
  const [phases,setPhases] = useState([phase]);

  let round = JSON.parse(JSON.stringify(NEW_ROUND));
  round.id = uuidv4();
  const [rounds,setRounds] = useState([round]);

  let turn = JSON.parse(JSON.stringify(NEW_TURN));
  turn.id = uuidv4();
  const [turns,setTurns] = useState([turn]);

  let step = JSON.parse(JSON.stringify(NEW_STEP));
  step.id = uuidv4();
  const [steps,setSteps] = useState([step]);

  // hey!  a state object!
  const stateOf = {
    stages, setStages,
    phases, setPhases,
    rounds, setRounds,
    turns, setTurns,
    steps, setSteps,
    
    // allows the client to add new flow members of the TMI state
    add: (thingType: string, row: number) => {

      // TODO: add the new thing
      return new Promise((resolve,reject)=>{
        if (FLOW_PARTS.indexOf(thingType)>-1) {

          // initial immutable TMI state copy
          let things = JSON.parse(JSON.stringify(stateOf[`${thingType}s`]));

          // check for too many members
          if (things.length>9) return reject(`Can't have more than 10 ${thingType}s`);

          // create a new flow part for the TMI
          let thing = 
            thingType=='stage' ? JSON.parse(JSON.stringify(NEW_STAGE)) : 
            thingType=='phase' ? JSON.parse(JSON.stringify(NEW_PHASE)) : 
            thingType=='round' ? JSON.parse(JSON.stringify(NEW_ROUND)) :
            thingType=='turn' ? JSON.parse(JSON.stringify(NEW_TURN)) :
            thingType=='step' ? JSON.parse(JSON.stringify(NEW_STEP)) : {};
          thing.id = uuidv4();
          // put the new flow part in the state copy
          things.push(thing);
          // replace the original TMI with the new version
          stateOf[`set${capitalize(thingType)}s`](things);
          // return true when the function operated correctly
          return resolve();
        }
        return reject(`${thingType} is not an approved flow mechanism`);
      });
    },
    
    // allows the client to remove a flow member from the TMI state
    remove: (thingType: string, row:number) => {
      alert(`removing ${thingType}`);
    },
    
    // move this thing up in the list
    moveUp: (thingType: string, row:number) => {
      alert(`moving ${thingType} up`);
    },
    
    // move this thing down in the list
    moveDown: (thingType: string, row:number) => {
      alert(`moving ${thingType} down`);
    },
  };
  
  // send that state object back
  return stateOf;
}

/**
 * The Turn Module Interface (TMI) is where we draw all the selectors that 
 * control the turn module in an easy-to-user structure and export that back to 
 * the designer page
 */
export function turnModuleInterface(
  stateOf: TurnModuleParams
) {

  return (
    <div className={css.TMIContainer}>
      <div>Welcome to the Turn Module Interface!</div>
      <div className={css.cardBox}>
        {stateOf.stages.map((item: Stage, row:number) => drawStage(stateOf,item,row))}
      </div>
      <div className={css.cardBox}>
        {stateOf.phases.map((item: Phase, row:number) => drawPhase(stateOf,item,row))}
      </div>
      <div className={css.cardBox}>
        {stateOf.rounds.map((item: Round, row:number) => drawRound(stateOf,item,row))}
      </div>
      <div className={css.cardBox}>
        {stateOf.turns.map((item: Turn, row:number) => drawTurn(stateOf,item,row))}
      </div>
      <div className={css.cardBox}>
        {stateOf.steps.map((item: Step, row:number) => drawStep(stateOf,item,row))}
      </div>
    </div>
  );
}