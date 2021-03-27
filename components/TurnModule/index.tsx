import React, { useState } from 'react';
//import { v4 as uuidv4 } from 'uuid';
import Draggable from 'react-draggable';
//import { capitalizeFirstLetter } from '../common/naming';
import css from './turn.module.css';

/**
 * The turn module is responsible for controlling the flow of the game and 
 * determining which agent acts next. Its settings are chosen from within the 
 * Turn Module Interface (TMI), but many parameters come from other modules.
 * The TMI uses four kinds of structures to coordinate the flow of the game:
 * stages, phases, rounds, turns, and steps
 */
export const FLOW_PARTS = ['stage','phase','round','turn','step'];
const TESTING = true;

/**
 * Steps are sets of Actions that users are required to pick from in sequential 
 * order. Turns may have a single step with a single available action, a single 
 * step with many available actions, or many steps each with it's own distinct 
 * set of available actions.  
 * Some designers call steps "Sequential Phases" or sometimes even just phases.
 */
import { Step, drawStep } from './drawStep';
 
/**
 * Turns are the time window during which a single agent performs one or more 
 * actions sequentially before another agent is allowed to act, though 
 * interrupts and reactions may alter this. Turns have one or more steps 
 * which define a particular order that actions must be taken in. 
 * Multiple turns may be defined, typically one for each phase because the 
 * available actions are different
 * Turns are pre-defined structures that are selected by the designer 
 */
import { Turn, drawTurn } from './drawTurn';

/**
 * rounds are the game structure that determines the specific order in which 
 * agents may act. Rounds have one of a predetermined list of types and may 
 * also include specific interrupts and reactions that can temporarily alter 
 * turn order. Only specific actions are allowed to interrupt or react and 
 * agents must have access to those actions as indicated by a 
 * tracking component
 * Rounds are pre-defined structures that are selected by teh designer
 */
import { Round, drawRound } from './drawRound';

/**
 * Phases are the game structure that broadly determine which actions are 
 * available to the agents; these sets of actions may be reduced by the 
 * current component state, but will never be increased. In other words: 
 * if an agent can do it, it must be listed in the phase definition first.
 * Phases are repeatable, both individually and in cycles; that is recorded 
 * in the stage definition
 * It's possible that phases get their actions from the embedded turns
 */
import { Phase, drawPhase } from './drawPhase';

/**
 * Stages are the largest structure in game flow, and are responsible for 
 * determining the current rules set of the game. Stages frequently play very 
 * differently from each other. All games have at least one stage, with 
 * specialized "startup" and "cleanup" stages being the most common additional 
 * stages. However, games can have any positive number of stages.
 */
import { Stage, drawStage } from './drawStage';

// this returns the rule module state so we can get a list of rules
import { RuleModuleParams, RuleModuleState } from '../RuleModule';

// this returns the action module state so we can get a list of actions
import { ActionModuleParams, ActionModuleState } from '../ActionModule';

import { model, addLink, addLink2, unLink, findChildren, findParents, addPart, killPart, moveDown, moveUp, changer, getNameById, clear, clearAll, quickStart } from './functions';

// this interface holds the list of acceptable options for flowPart
export interface FlowPartOptions {
  testing?: boolean;
}

interface Item {
  label: string;
  value: string;
}

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

  linkTable: Array<Array<boolean>>; // holds links between components
  setLinkTable: Function;           // function to change the table
  linkParents: Array<string>;
  setLinkParents: Function;
  linkChildren: Array<string>;
  setLinkChildren: Function;

  /**
   * the link table allows us to dynamically keep track of which components are
   * connected together
   */
  link: {
    sp: { 
      table: Array<Array<boolean>>;
      setTable: Function;
      parents: Array<string>;
      setParents: Function;
      children: Array<string>;
      setChildren: Function;
    };
    pr: { 
      table: Array<Array<boolean>>;
      setTable: Function;
      parents: Array<string>;
      setParents: Function;
      children: Array<string>;
      setChildren: Function;
    };
    rt: { 
      table: Array<Array<boolean>>;
      setTable: Function;
      parents: Array<string>;
      setParents: Function;
      children: Array<string>;
      setChildren: Function;
    };
    ts: { 
      table: Array<Array<boolean>>;
      setTable: Function;
      parents: Array<string>;
      setParents: Function;
      children: Array<string>;
      setChildren: Function;
    };
  }

  initialized: boolean;
  setInitialized: Function;

  showInstructions: boolean;
  setShowInstructions: Function;

  // state from other modules
  ruleModule: RuleModuleParams;
  actionModule: ActionModuleParams;

  // functions!
  model: Function;
  addLink: Function;
  addLink2: Function;
  unLink: Function;
  findChildren: Function;
  findParents: Function;
  addPart: Function;
  killPart: Function;
  moveUp: Function;
  moveDown: Function;
  changer: Function;
  getNameById: Function;
  initialize: Function;
  quickStart: Function;
  clear: Function;
  clearAll: Function;
}

/**
 * The Turn Module State function sets the value of the state object and then
 * returns that object ot be embedded in a parent state object.
 */
export function TurnModuleState(){
  // these are our main state buckets
  const [stages,setStages] = useState([]);
  const [phases,setPhases] = useState([]);
  const [rounds,setRounds] = useState([]);
  const [turns,setTurns] = useState([]);
  const [steps,setSteps] = useState([]);

  // hook functions for the link table
  const [linkTable,setLinkTable] = useState([]);
  const [linkParents, setLinkParents] = useState([]);
  const [linkChildren, setLinkChildren] = useState([]);

  // hook functions for the new link table
  const [sp,setSP] = useState([]);
  const [pr,setPR] = useState([]);
  const [rt,setRT] = useState([]);
  const [ts,setTS] = useState([]);
  const [spParents,setSPParents] = useState([]);
  const [spChildren,setSPChildren] = useState([]);
  const [prParents,setPRParents] = useState([]);
  const [prChildren,setPRChildren] = useState([]);
  const [rtParents,setRTParents] = useState([]);
  const [rtChildren,setRTChildren] = useState([]);
  const [tsParents,setSParents] = useState([]);
  const [tsChildren, setTSChildren] = useState([]);

  // various state flags
  const [initialized, setInitialized] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // hey!  a state object!
  const stateOf = {
    stages, setStages,
    phases, setPhases,
    rounds, setRounds,
    turns, setTurns,
    steps, setSteps,
    
    linkTable, setLinkTable,
    linkParents, setLinkParents,
    linkChildren, setLinkChildren,

    link: {
      sp: { 
        table:sp, setTable:setSP ,
        parents:spParents, setParents:setSPParents,
        children:spChildren, setChildren:setSPChildren,
      },
      pr: { 
        table:pr, setTable:setPR, 
        parents:prParents, setParents:setPRParents,
        children:prChildren, setChildren:setPRChildren,
      },
      rt: { 
        table:rt, setTable:setRT, 
        parents:rtParents, setParents:setRTParents,
        children:rtChildren, setChildren:setRTChildren,
      },
      ts: { 
        table:ts, setTable:setTS,
        parents:tsParents, setParents:setSParents,
        children:tsChildren, setChildren:setTSChildren,
      },
    },

    initialized,
    setInitialized,

    showInstructions, 
    setShowInstructions,

    ruleModule: RuleModuleState(),
    actionModule: ActionModuleState(),

    // returns the current model state of the TMI. Immutable.
    model: () => model(stateOf),

    // creates or destroys familial links between flowParts
    addLink: (parentId: string, childId: string) => addLink(stateOf,parentId,childId),
    addLink2: (parent: Item, child:Item) => addLink2(stateOf,parent,child),
    unLink: (parentId: string, childId: string) => unLink(stateOf,parentId,childId), 

    // returns the IDs of familial links
    findChildren: (identity: Item) => findChildren(stateOf,identity),
    findParents: (identity: Item) => findParents(stateOf,identity),

    // allows the client to add, remove, and rearrange flow parts
    addPart: (flowPart: string, row: number) => addPart(stateOf,flowPart,row),
    killPart: (flowPart: string, row:number) => killPart(stateOf,flowPart,row),
    moveUp: (flowPart: string, row:number) => moveUp(stateOf,flowPart,row),
    moveDown: (flowPart: string, row:number) => moveDown(stateOf,flowPart,row),
    
    // allows us to change individual key-value pairs of a flowPart
    changer: (flowPart: string, row: number, obj: object) => changer(stateOf,flowPart,row,obj),
    
    // retrieves the current name of a flow part using the flow part type and id number 
    getNameById: ( flowPart: string, id: string) => getNameById(stateOf,flowPart,id),

    // initialize creates a flow part in each bucket using the add function
    initialize: () => {
      if (stateOf.initialized==false) {
        stateOf.setInitialized(true);
        stateOf.addPart('stage',0);
        stateOf.addPart('phase',0);
        stateOf.addPart('round',0);
        stateOf.addPart('turn',0);
        stateOf.addPart('step',0);
      }
    },
    
    // sets all flow parts to a simple, default game framework
    quickStart: () => quickStart(stateOf),
    
    // removes details from one or more flow parts
    clear: (flowPart: string) => clear(stateOf,flowPart),
    clearAll: () => clearAll(stateOf),
  };
  
  // send that state object back
  return stateOf;
}

// this displays the TMI instructions when needed
function TMIInstructions(stateOf:TurnModuleParams){
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
          <div>
            <p>Every game has at least one each of Stage, Phase, Round, Turn, and Step. Yours may have multiple of any of them.</p>
            <p>Stages determine the rules in effect during gameplay. Many games have only a single stage because there is only one set of rules in play; however, inclusion of a setup stage with truncated rules is common, as is a final stage where players tally points from milestone awards or collected cards, etc.</p>
            <p>Phases broadly determine what actions are available to players and may divide play into thematic chunks. For example, your game might have planting, growing, and harvesting phases each with its own kinds of actions to be taken.</p>
            <p>Rounds are generally sequences of each player receiving one full turn in some kind of order, with a new round started once each player has acted.  There are a lot of variations and options in rounds, including some that defy "traditional" round order at all.</p>
            <p>Turns are time windows during which a player performs one or more actions sequentially before another agent is allowed to act, though options may alter this, like through <em>interrupts</em> or <em>reactions</em>.</p>
            <p>Steps, like phases, divide up when actions can be taken into a thematic order; however, steps are all still part of the same player's turn.</p>
            <p>The Quick Start button will create a simple game template for you; you can always change the names or add extra components later!</p>
          </div>
        </div>
      </Draggable>
    );
  }
}

/**
 * The Turn Module Interface (TMI) is where we draw all the selectors that 
 * control the turn module in an easy-to-user structure and export that back to 
 * the designer page
 */
export function turnModuleInterface(
  stateOf: TurnModuleParams
) {

  // initialize the state only on the browser
  if (process.browser) stateOf.initialize();

  // sets the options for our modules
  const options = {
    testing:TESTING
  }

  return (
    <div className={css.TMIContainer}>
      <div>
        <button
          onClick={()=>{
            stateOf.quickStart();
          }}
        >Quick Start</button>
        <button
          onClick={()=>{
            stateOf.clearAll();
          }}
        >Clear All</button>
        <button 
          className={css.helpButton}
          onClick={()=>{
            stateOf.setShowInstructions(!stateOf.showInstructions);
          }}
        >?</button>
      </div>
      <div className={css.cardBox}>
        <div className={css.cardTitle}>Stages:</div>
        {stateOf.stages.map((item: Stage, row:number) => drawStage(stateOf,item,row,options))}
      </div>
      <div className={css.cardBox}>
        <div className={css.cardTitle}>Phases:</div>
        {stateOf.phases.map((item: Phase, row:number) => drawPhase(stateOf,item,row,options))}
      </div>
      <div className={css.cardBox}>
        <div className={css.cardTitle}>Rounds:</div>
        {stateOf.rounds.map((item: Round, row:number) => drawRound(stateOf,item,row,options))}
      </div>
      <div className={css.cardBox}>
        <div className={css.cardTitle}>Turns:</div>
        {stateOf.turns.map((item: Turn, row:number) => drawTurn(stateOf,item,row,options))}
      </div>
      <div className={css.cardBox}>
        <div className={css.cardTitle}>Steps:</div>
        {stateOf.steps.map((item: Step, row:number) => drawStep(stateOf,item,row,options))}
      </div>
      {TMIInstructions(stateOf)}
    </div>
  );
}