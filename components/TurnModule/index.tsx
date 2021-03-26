import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Draggable from 'react-draggable';
import { capitalizeFirstLetter } from '../common/naming';
import css from './turn.module.css';

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

// this returns the rule module state so we can get a list of rules
import { RuleModuleParams, RuleModuleState } from '../RuleModule';

// this returns the action module state so we can get a list of actions
import { ActionModuleParams, ActionModuleState } from '../ActionModule';

// this interface holds the list of acceptable options for flowPart
export interface FlowPartOptions {
  testing?: boolean;
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
  removeLink: Function;
  findChildren: Function;
  findParents: Function;
  addPart: Function;
  killPart: Function;
  moveUp: Function;
  moveDown: Function;
  changer: Function;
  namesExist: Function;
  ItemsExistIn: Function;
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

  const [linkTable,setLinkTable] = useState([]);
  const [linkParents, setLinkParents] = useState([]);
  const [linkChildren, setLinkChildren] = useState([]);

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

    initialized,
    setInitialized,

    showInstructions, 
    setShowInstructions,

    ruleModule: RuleModuleState(),
    actionModule: ActionModuleState(),

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

    // creates a link between flowTypes, designating one as the parent and the other as the child
    addLink: (parentId: string, childId: string) => {
      let linkTable = JSON.parse(JSON.stringify(stateOf.linkTable));
      let linkParents = stateOf.linkParents.slice();
      let linkChildren = stateOf.linkChildren.slice();
      let parentRow = linkParents.indexOf(parentId);
      let childCol = linkChildren.indexOf(childId);
  
      // if the parent row doesn't exist on table, add it
      if (parentRow==-1){
        parentRow = linkParents.length;
        linkParents[parentRow] = parentId;
        linkTable[parentRow] = Array(linkChildren.length).fill(false);
      }

      // if the child column doesn't exist on table, add it
      if (childCol==-1){
        childCol = linkChildren.length;
        linkChildren[childCol] = childId;
        for (let r=0;r<linkParents.length;r++) linkTable[r][childCol] = false;
      }

      linkTable[parentRow][childCol] = true;

      console.log('PARENTS: ',linkParents);
      console.log('CHILDREN: ',linkChildren);
      console.log('LINKTABLE: ',linkTable);

      // save the updated link data
      stateOf.setLinkTable(linkTable);
      stateOf.setLinkParents(linkParents);
      stateOf.setLinkChildren(linkChildren);
    },

    removeLink: (parentId: string, childId: string) => {
      let linkTable = JSON.parse(JSON.stringify(stateOf.linkTable));
      let linkParents = stateOf.linkParents.slice();
      let linkChildren = stateOf.linkChildren.slice();
      let parentRow = linkParents.indexOf(parentId);
      let childCol = linkChildren.indexOf(childId);

      // Set the corresponding links to false
      if (parentRow>-1 && childCol>-1) {
        linkTable[parentRow][childCol] = false;
      } else if (parentRow>-1) {
        // remove all children of this row
        for (let c=0;c<linkChildren.length;c++) linkTable[parentRow][c]=false;
      } else if (childCol>-1) {
        // remove all parents of this column
        for (let r=0;r<linkParents.length;r++) linkTable[r][childCol]=false;
      }

      // trim rows where necessary
      for (let r=linkParents.length-1;r>-1;r--) {
        let empty=true;
        for (let c=0;c<linkChildren.length;c++) {
          if (linkTable[r][c]==true) empty=false;
        }
        if (empty) {
          linkParents.splice(r,1);
          linkTable.splice(r,1);
        }
      }

      // trim columns where necessary
      for (let c=linkChildren.length-1;c>-1;c--) {
        let empty=true;
        for (let r=0;r<linkParents.length;r++) {
          if (linkTable[r][c]==true) empty=false;
        }
        if (empty) {
          linkChildren.splice(c,1);
          for (let r=0;r<linkParents.length;r++) {
            linkTable[r].splice(c,1);
          }
        }
      }

      console.log('PARENTS: ',linkParents);
      console.log('CHILDREN: ',linkChildren);
      console.log('LINKTABLE: ',linkTable);

      // save the updated link data
      stateOf.setLinkTable(linkTable);
      stateOf.setLinkParents(linkParents);
      stateOf.setLinkChildren(linkChildren);
    },

    // returns the children IDs of the given parent
    findChildren: (parentId:string) => {
      //console.log('LINK TABLE: ',stateOf.linkTable);
      let r = stateOf.linkParents.reduce((acc,curr,index)=>{
        if (curr==parentId) return index;
        return acc;
      },-1);
      let children=[];
      if (r>-1) {
        stateOf.linkChildren.forEach((child,c)=>{
          if (stateOf.linkTable[r][c]==true) children.push(child);
        });
      }
      return children;
    },

    // returns the parent ID's of the given child
    findParents: (childId: string) => {
      let c = stateOf.linkChildren.reduce((acc,curr,index)=>{
        if (curr==childId) return index;
        return acc;
      },-1);
      let parents=[];
      if (c>-1) {
        stateOf.linkParents.forEach((parent,r)=>{
          if (stateOf.linkTable[r][c]==true) parents.push(parent);
        });
      }
      return parents;
    },

    // allows the client to add new flow members of the TMI state
    addPart: (flowPart: string, row: number) => {

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
    killPart: (flowPart: string, row:number) => {
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

    // checks a particular kind of flowpart to see if 
    ItemsExistIn: ( flowPart: string, items: Array<any>) => {
      return new Promise<Array<any>>((resolve,reject)=>{
        if (FLOW_PARTS.indexOf(flowPart)>-1) {
          let flowParts = JSON.parse(JSON.stringify(stateOf[`${flowPart}s`]));

          // returns a list of the IDs from the mebmers of this flowPart list
          let IDs = flowParts.map((flowPart:any)=>flowPart.id);

          // creates a list of the id's in common
          let common = items.filter((item:any) => IDs.includes(item.value));

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
        stateOf.addPart('stage',0);
        stateOf.addPart('phase',0);
        stateOf.addPart('round',0);
        stateOf.addPart('turn',0);
        stateOf.addPart('step',0);
      }
    },
    
    // this resets all the flow parts and provides a simple game framework
    quickStart: () => {
      let newStage = JSON.parse(JSON.stringify(stateOf.stages[0]));
      newStage.name = 'Stage01';
      newStage.description = 'This game has only one stage';

      let newPhase = JSON.parse(JSON.stringify(stateOf.phases[0]));
      newPhase.name = 'Phase01';
      newPhase.description = 'This game has only one phase';
//      stateOf.addLink(newStage.id,newPhase.id);

      let newRound = JSON.parse(JSON.stringify(stateOf.rounds[0]));
      newRound.name = 'Round01';
      newRound.description = 'This game has only one kind of Round';
      newRound.type = 'fixed';
//      stateOf.addLink(newPhase.id,newRound.id);

      let newTurn = JSON.parse(JSON.stringify(stateOf.turns[0]));
      newTurn.name = 'Turn01';
      newTurn.description = 'This game has only one type of turn';
      //stateOf.addLink(newPhase.id,newTurn.id);

      let newStep = JSON.parse(JSON.stringify(stateOf.steps[0]));
      newStep.name = 'Step01';

      stateOf.setStages([newStage]);
      stateOf.setPhases([newPhase]);
      stateOf.setRounds([newRound]);
      stateOf.setTurns([newTurn]);
      stateOf.setSteps([newStep]);

      stateOf.addLink(newStage.id,newPhase.id);
      stateOf.addLink(newPhase.id,newRound.id);

    },
    
    // clear removes all the details from a single flowPart except the id
    clear: (flowPart: string) => {
      return new Promise<void>((resolve,reject)=>{
        if (FLOW_PARTS.indexOf(flowPart)>-1) {
          let flowParts = JSON.parse(JSON.stringify(stateOf[`${flowPart}s`]));

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