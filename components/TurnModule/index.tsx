import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Draggable from 'react-draggable';
import { capitalizeFirstLetter } from '../common/naming';
import css from './turnModule.module.css';

/**
 * The turn module is responsible for controlling the flow of the game and 
 * determining which agent acts next. Its settings are chosen from within the 
 * Turn Module Interface (TMI), but many parameters come from other modules.
 * The TMI uses four kinds of structures to coordinate the flow of the game:
 * stages, phases, rounds, turns, and steps
 */
const FLOW_PARTS = ['stage','phase','round','turn','step'];
const TESTING = true;

/**
 * Steps are sets of Actions that users are required to pick from in sequential 
 * order. Turns may have a single step with a single available action, a single 
 * step with many available actions, or many steps each with it's own distinct 
 * set of available actions.  
 * Some designers call steps "Sequential Phases" or sometimes even just phases.
 */
import { Step, NEW_STEP, drawStep } from './drawStep';
 
/**
 * Turns are the time window during which a single agent performs one or more 
 * actions sequentially before another agent is allowed to act, though 
 * interrupts and reactions may alter this. Turns have one or more steps 
 * which define a particular order that actions must be taken in. 
 * Multiple turns may be defined, typically one for each phase because the 
 * available actions are different
 * Turns are pre-defined structures that are selected by the designer 
 */
import { Turn, NEW_TURN, drawTurn } from './drawTurn';

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

  initialized: boolean;
  setInitialized: Function;

  showInstructions: boolean;
  setShowInstructions: Function;

  // functions!
  model: Function,
  add: Function,
  remove: Function,
  moveUp: Function,
  moveDown: Function,
  changer: Function,
  namesExist: Function,
  getNameById: Function,
  initialize: Function,
  quickStart: Function,
  clear: Function,
  clearAll: Function,
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
    
    initialized,
    setInitialized,

    showInstructions, 
    setShowInstructions,

    // returns the current model state of the TMI. Immutable.
    model: () => {
      return {
        stages: JSON.parse(JSON.stringify(stateOf.stages)),
        phases: JSON.parse(JSON.stringify(stateOf.phases)),
        rounds: JSON.parse(JSON.stringify(stateOf.rounds)),
        turns: JSON.parse(JSON.stringify(stateOf.turns)),
        steps: JSON.parse(JSON.stringify(stateOf.steps))
      };
    },

    // allows the client to add new flow members of the TMI state
    add: (flowPart: string, row: number) => {

      // TODO: add the new thing at a particular index location
      return new Promise<void>((resolve,reject)=>{
        if (FLOW_PARTS.indexOf(flowPart)>-1) {

          // initial immutable TMI state copy
          let flowParts = JSON.parse(JSON.stringify(stateOf[`${flowPart}s`]));

          // check for too many members
          if (flowParts.length>9) return reject(`Can't have more than 10 ${flowPart}s`);

          // create a new flow part for the TMI
          let thing = 
            flowPart=='stage' ? JSON.parse(JSON.stringify(NEW_STAGE)) : 
            flowPart=='phase' ? JSON.parse(JSON.stringify(NEW_PHASE)) : 
            flowPart=='round' ? JSON.parse(JSON.stringify(NEW_ROUND)) :
            flowPart=='turn' ? JSON.parse(JSON.stringify(NEW_TURN)) :
            flowPart=='step' ? JSON.parse(JSON.stringify(NEW_STEP)) : {};
          thing.id = uuidv4();

          // put the new flow part in the state copy
          flowParts.splice(row+1,0,thing);

          // replace the original TMI with the new version
          stateOf[`set${capitalizeFirstLetter(flowPart)}s`](flowParts);

          // return true when the function operated correctly
          return resolve();
        }
        return reject(`${flowPart} is not an approved flow mechanism`);
      });
    },
    
    // allows the client to remove a flow member from the TMI state
    remove: (flowPart: string, row:number) => {
      return new Promise<void>((resolve,reject)=>{
        if (FLOW_PARTS.indexOf(flowPart)>-1) {

          // initial immutable TMI state copy
          let flowParts = JSON.parse(JSON.stringify(stateOf[`${flowPart}s`]));
  
          // check for too many members
          if (flowParts.length==1) return reject(`Can't have less than 1 ${flowPart}s`);

          // remove the intended thing from the TNI
          flowParts.splice(row,1);

          // replace the original TMI with the new version
          stateOf[`set${capitalizeFirstLetter(flowPart)}s`](flowParts);

          // return true when the function operated correctly
          return resolve();
        }
        return reject(`${flowPart} is not an approved flow mechanism`);
      });
    },
    
    // move this thing up in the list
    moveUp: (flowPart: string, row:number) => {
      return new Promise<void>((resolve,reject)=>{
        if (FLOW_PARTS.indexOf(flowPart)>-1) {

          // initial immutable TMI state copy
          let flowParts = JSON.parse(JSON.stringify(stateOf[`${flowPart}s`]));
  
          // move the thing up a row
          flowParts.splice(row-1, 0, flowParts.splice(row, 1)[0]);
  
          // replace the original TMI with the new version
          stateOf[`set${capitalizeFirstLetter(flowPart)}s`](flowParts);

          // return true when the function operated correctly
          return resolve();
        }
        return reject(`${flowPart} is not an approved flow mechanism`);
      });
    },
    
    // move this thing down in the list
    moveDown: (flowPart: string, row:number) => {
      return new Promise<void>((resolve,reject)=>{
        if (FLOW_PARTS.indexOf(flowPart)>-1) {

          // initial immutable TMI state copy
          let flowParts = JSON.parse(JSON.stringify(stateOf[`${flowPart}s`]));
  
          // move the thing up a row
          flowParts.splice(row+1, 0, flowParts.splice(row, 1)[0]);
  
          // replace the original TMI with the new version
          stateOf[`set${capitalizeFirstLetter(flowPart)}s`](flowParts);

          // return true when the function operated correctly
          return resolve();
        }
        return reject(`${flowPart} is not an approved flow mechanism`);
      });
    },
    
    // allows us to change individual parameters of a flowPart
    changer: (
      flowPart: string,
      row: number,
      obj: object
    ) => {
      return new Promise<void>((resolve,reject)=>{
        if (FLOW_PARTS.indexOf(flowPart)>-1) {
          let flowParts = JSON.parse(JSON.stringify(stateOf[`${flowPart}s`]));
          flowParts[row] = Object.assign(flowParts[row],obj);
          stateOf[`set${capitalizeFirstLetter(flowPart)}s`](flowParts);
          return resolve();
        }
        return reject (`${flowPart} is not an approved flow mechanism`);
      });
    },
    
    // checks a particular flowPart list to see if a name if one or more names is present there
    namesExist: ( flowPart: string, names: Array<string>) => {
      return new Promise<Array<string>>((resolve,reject)=>{
        if (FLOW_PARTS.indexOf(flowPart)>-1) {
          let flowParts = JSON.parse(JSON.stringify(stateOf[`${flowPart}s`]));
          
          // returns a lowercase list of all the names within this flowPart
          let partNames = flowParts.map((thing:any)=>thing.name.toLowerCase());

          // returns a list of just the names shared in common
          let common = names.filter((s:string)=>partNames.includes(s.toLowerCase()));
          return resolve(common);
        }
        return reject(`${flowPart} is not an approved flow mechanism`);
      });
    },
    
    // retrieves the name of a flow part using the flow part type and id number 
    getNameById: ( flowPart: string, id: string) => {
      if (FLOW_PARTS.indexOf(flowPart)>-1) {
        return stateOf[`${flowPart}s`].reduce((acc,curr)=>{
            return (curr.id==id) ? curr.name : acc;
          },'');
      } else return '';
    },

    // initialize creates a flow part in each bucket using the add function
    initialize: () => {
      if (stateOf.initialized==false) {
        stateOf.setInitialized(true);
        stateOf.add('stage',0);
        stateOf.add('phase',0);
        stateOf.add('round',0);
        stateOf.add('turn',0);
        stateOf.add('step',0);
      }
    },
    
    // this resets all the flow parts and provides a simple game framework
    quickStart: () => {
      let newStage = JSON.parse(JSON.stringify(stateOf.stages[0]));
      newStage.name = 'Stage01';
      newStage.phaseFreeText = 'Phase01';
      newStage.phases = ['Phase01'];

      let newPhase = JSON.parse(JSON.stringify(stateOf.phases[0]));
      newPhase.name = 'Phase01';

      let newRound = JSON.parse(JSON.stringify(stateOf.rounds[0]));
      newRound.name = 'Round01';
      newRound.type = 'fixed';
      newPhase.roundName = newRound.name;
      newPhase.roundId = newRound.id;

      let newTurn = JSON.parse(JSON.stringify(stateOf.turns[0]));
      newTurn.name = 'Turn01';
      newPhase.turnName = newTurn.name;
      newPhase.turnId = newTurn.id;

      let newStep = JSON.parse(JSON.stringify(stateOf.steps[0]));
      newStep.name = 'Step01';

      stateOf.setStages([newStage]);
      stateOf.setPhases([newPhase]);
      stateOf.setRounds([newRound]);
      stateOf.setTurns([newTurn]);
      stateOf.setSteps([newStep]);
    },
    
    // clear removes all the details from a single flowPart except the id
    clear: (flowPart: string) => {
      return new Promise<void>((resolve,reject)=>{
        if (FLOW_PARTS.indexOf(flowPart)>-1) {
          let flowParts = JSON.parse(JSON.stringify(stateOf[`${flowPart}s`]));

          //console.log(`CLEARING ${capitalizeFirstLetter(flowPart)}s`);

          const newFlowParts = flowParts.map(thing => {
            let newThing;
            switch(flowPart) {
              case "stage":
                newThing = JSON.parse(JSON.stringify(NEW_STAGE));
                newThing.id = thing.id;
                break;
              case "phase":
                newThing = JSON.parse(JSON.stringify(NEW_PHASE));
                newThing.id = thing.id;
                break;
              case "round":
                newThing = JSON.parse(JSON.stringify(NEW_ROUND));
                newThing.id = thing.id;
                break;
              case "turn":
                newThing = JSON.parse(JSON.stringify(NEW_TURN));
                newThing.id = thing.id;
                break;
              case "step":
                newThing = JSON.parse(JSON.stringify(NEW_STEP));
                newThing.id = thing.id;
                break;
            }
            return newThing;
          });
          stateOf[`set${capitalizeFirstLetter(flowPart)}s`](newFlowParts);
          return resolve();
        }
        return reject(`${flowPart} is not an approved flow mechanism`);
      });
    },
    
    // runs the clear function on every flowPart bucket
    clearAll: () => {
      FLOW_PARTS.forEach(flowPart => {
        stateOf.clear(flowPart).catch((err)=>{
          console.log(err);
        });
      });      
    },
  };
  
  //console.log('INITIAL TMI STATE: ',stateOf.model());
  
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

/*
export async function getServerSideProps(context) {
  console.log('SERVER SIDE PROPS FIRED with',context);
  return {
    props: {}, // will be passed to the page component as props
  }
}
*/

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
  if (stateOf.initialized==true) console.log('TMI STATE: ',stateOf.model());

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
        {stateOf.stages.map((item: Stage, row:number) => drawStage(stateOf,item,row,{testing:TESTING}))}
      </div>
      <div className={css.cardBox}>
        <div className={css.cardTitle}>Phases:</div>
        {stateOf.phases.map((item: Phase, row:number) => drawPhase(stateOf,item,row,{testing:TESTING}))}
      </div>
      <div className={css.cardBox}>
        <div className={css.cardTitle}>Rounds:</div>
        {stateOf.rounds.map((item: Round, row:number) => drawRound(stateOf,item,row,{testing:TESTING}))}
      </div>
      <div className={css.cardBox}>
        <div className={css.cardTitle}>Turns:</div>
        {stateOf.turns.map((item: Turn, row:number) => drawTurn(stateOf,item,row,{testing:TESTING}))}
      </div>
      <div className={css.cardBox}>
        <div className={css.cardTitle}>Steps:</div>
        {stateOf.steps.map((item: Step, row:number) => drawStep(stateOf,item,row,{testing:TESTING}))}
      </div>
      {TMIInstructions(stateOf)}
    </div>
  );
}