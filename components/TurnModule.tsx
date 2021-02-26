import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * The turn module is responsible for controlling the flow of the game and 
 * determining which agent acts next. Its settings are chosen from within the 
 * Turn Module Interface, but many of its parameters come from other modules.
 */

/**
 * Steps are sets of Actions that users are required to pick from in sequential 
 * order. Turns may have a single step with a single available action, a single 
 * step with many available actions, or many steps each with it's own distinct 
 * set of available actions.  
 * Some designers call steps "Sequential Phases" or sometimes even just phases.
 */
interface Step {
  id: string;   // unique identifier for the Step, generated
  name: string; // human friendly name for the Step, changeable
  actions: Array<string>; // a list of Actions permitted during the step
}

const NEW_STEP = {
  id: uuidv4(),
  name: "",
  actions: [],
};

/**
 * Options: Many rounds and turns have parameters that are set by 
 * options and flags
 */
interface TurnOption {
  key: string;              // a key that identifies a particular turn option
  value: string | boolean;  // a value that indicates which option was taken
}

/**
 * Turn are the time window during which a single agent performs one or more 
 * actions sequentially before another agent is allowed to act, though 
 * interrupts and reactions may alter this. Turns have one or more steps 
 * which define a particular order that actions must be taken in. 
 * Multiple turns may be defined, typically one for each phase because the 
 * available actions are different
 * Turns are pre-defined structures that are selected by the designer 
 */
interface Turn {
  id: string;                   // unique identifer for turn, generated
  name: string;                 // human friendly name for the turn
  type: string;                 // one of a pre-defined list of Turn types
  steps: Array<Step>;           // list of steps taken within a Turn
  options: Array<TurnOption>;   // list of options used with this turn
}

const NEW_TURN = {
  id: uuidv4(),
  name: "",
  type: "",
  steps: [],
  options: [],
};

/**
 * rounds are the game structure that determines the specific order in which 
 * agents may act. Rounds have one of a predetermined list of types and may 
 * also include specific interrupts and reactions that can temporarily alter 
 * turn order. Only specific actions are allowed to interrupt or react and 
 * agents must have access to those actions as indicated by a 
 * tracking component
 * Rounds are pre-defined structures that are selected by teh designer
 */
interface Round {
  id: string;                 // unique identifer for round, generated
  name: string;               // human friendly name for the round
  type: string;               // one of a pre-defined list of Round types
  interrupts: Array<string>;  // list of actions allowed to interrupt a turn
  reactions: Array<string>;   // list of actions allowed to react to a turn
  options: Array<TurnOption>; // list of options used with this round
}

const NEW_ROUND = {
  id: uuidv4(),
  name: "",
  type: "",
  interrupts: [],
  reactions: [],
  options: [],
};

/**
 * Phases are the game structure that broadly determine which actions are 
 * available to the agents; these sets of actions may be reduced by the 
 * current component state, but will never be increased. In other words: 
 * if an agent can do it, it must be listed in the phase definition first.
 * Phases are repeatable, both individually and in cycles; that is recorded 
 * in the stage definition
 * It's possible that phases get their actions from the embedded turns
 */
interface Phase {
  id: string;             // unique identifer for the phase, generated
  name: string;           // human friendly name for the phase
  actions: Array<string>; // list of actions available in the phase
  roundID: string;        // type of round used in this phase
  turnID: string;         // type of turn used in this phase
}

const NEW_PHASE = {
  id: uuidv4(),
  name: "",
  actions: [],
  roundId: "",
  turnId: "",
};
 
/**
 * a phase cycle describes how which phases repeat within a stage and what 
 * triggers the game to move on from that cycle
 */
interface PhaseCycle {
  phases: Array<string>;  // an array of phase names that repeat in sequence
  trigger: Array<string>; // an array of trigger events that will end the cycle
}

/**
 * Stages are the largest structure in game flow, and are responsible for 
 * determining the current rules set of the game. Stages frequently play very 
 * differently from each other. All games have at least one stage, with 
 * specialized "startup" and "cleanup" stages being the most common additional 
 * stages. However, games can have any positive number of stages.
 */
interface Stage {
  id: string;                     // unique identifier for the stage, generated
  name: string;                   // human friendly name for the stage
  phases: Array<string>;          // list of phases in the stage
  phaseCycles: Array<PhaseCycle>; // list of phase cycles in the stage
  rules: Array<string>;           // list of rules used in this stage (?)
}

const NEW_STAGE = {
  id: "",
  name: "",
  phases: [],
  phaseCycles: [],
  rules: [],
};

export interface TurnModuleParams {
  stages, setStages,

  project: {
    stages: Array<Stage>; // list of Stages (Acts) used in the game
    phases: Array<Phase>; // list of Phases used in the game
    rounds: Array<Round>; // list of Rounds used in the game
    turns: Array<Turn>;   // list of Turns used in the game
    steps: Array<Step>;   // list of Steps used in the game
  }
}

/**
 * The Turn Module State function sets the value of the state object and then
 * rturns that object ot be embedded in a parent state object.
 */
export function TurnModuleState(){
  // this is where we set the initial state values
  let stage = JSON.parse(JSON.stringify(NEW_STAGE));
  stage.id = uuidv4();
  const [stages,setStages] = useState([stage]);
  

  // hey!  a state object!
  return {
    stages,
    setStages,

    //  this is the basic structure of our turn module
    project: {
      stages
    }
  };
}

export function turnModuleInterface(
  stateOf: TurnModuleParams
) {

  const func = {
    stage: {
      add: () => {
        // immutable copy
        let stages = JSON.parse(JSON.stringify(stateOf.project.stages));
        let stage = JSON.parse(JSON.stringify(NEW_STAGE));
        stage.id = uuidv4();
        stages.push(stage);
        stateOf.setStages(stages);
      },
      remove: () => {
        
      },
    }
    
  };

  return (
    <div>
      <div>Welcome to the Turn Module Interface!</div>
      <div>
        <button
          onClick={evt => {
            func.stage.add();
          }}
        >Add Stage</button>
      </div>
      <div><pre>{JSON.stringify(stateOf.project,null,2)}</pre></div>
    </div>
  );
}
