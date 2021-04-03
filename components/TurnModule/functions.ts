import { FLOW_PARTS, Item } from './index';
import { NEW_STEP } from './drawStep';
import { NEW_TURN } from './drawTurn';
import { NEW_ROUND } from './drawRound';
import { NEW_PHASE } from './drawPhase';
import { NEW_STAGE } from './drawStage';
import { v4 as uuidv4 } from 'uuid';
import { capitalizeFirstLetter } from '../common/naming';

export const model = (stateOf:any) => {
  return {
    stages: JSON.parse(JSON.stringify(stateOf.stages)),
    phases: JSON.parse(JSON.stringify(stateOf.phases)),
    rounds: JSON.parse(JSON.stringify(stateOf.rounds)),
    turns: JSON.parse(JSON.stringify(stateOf.turns)),
    steps: JSON.parse(JSON.stringify(stateOf.steps))
  };
};


// this returns the index position of a flow part
const findIndexByIdentity = (stateOf: any, identity: Item) => {
  return stateOf[`${identity.flowType}s`].reduce((acc:number,curr:any,index:number) =>
    (curr.identity.value===identity.value) ? index : acc
  ,-1);
};


// adds links between flow components
export const addLink = (stateOf:any, parent:Item, child:Item) => {
  // let's first find the index positions of the parent and child
  const pIndex = findIndexByIdentity(stateOf,parent);
  const cIndex = findIndexByIdentity(stateOf,child);

  if (pIndex==-1) throw new Error(`parent not found!`);
  if (cIndex==-1) throw new Error(`child not found!`);

  // and verify that these are allowed to be linked
  let parentPool:any, childPool:any;
  let pos:number;
  switch(true){
    case (parent.flowType==='stage' && child.flowType==='phase'):
    case (parent.flowType==='phase' && child.flowType==='round'):
    case (parent.flowType==='round' && child.flowType==='turn'):
    case (parent.flowType==='turn' && child.flowType==='step'):
      parentPool = JSON.parse(JSON.stringify(stateOf[`${parent.flowType}s`]));
      childPool = JSON.parse(JSON.stringify(stateOf[`${child.flowType}s`]));

      // add the child's ID value to the parent's child list
      pos = parentPool[pIndex].children.indexOf(child.value);
      if (pos==-1) {
        parentPool[pIndex].children.push(child.value);
        stateOf[`set${capitalizeFirstLetter(parent.flowType)}s`](parentPool);
      }

      // add the parent's ID value to the child's parent list
      pos = childPool[cIndex].parents.indexOf(parent.value);
      if (pos==-1) {
        childPool[cIndex].parents.push(parent.value);
        stateOf[`set${capitalizeFirstLetter(child.flowType)}s`](childPool);
      }

      break;
    default: throw new Error('Cannot link these flow parts');
  }
};


// removes links between flow components
export const unLink = (stateOf:any, parent:Item, child:Item) => {

  if (parent!==null && child!==null) {
    // let's first find the index positions of the parent and child
    const pIndex = findIndexByIdentity(stateOf,parent);
    const cIndex = findIndexByIdentity(stateOf,child);
  
    if (pIndex==-1) throw new Error(`parent not found!`);
    if (cIndex==-1) throw new Error(`child not found!`);
  
    // get the parent and child pools
    let parentPool = JSON.parse(JSON.stringify(stateOf[`${parent.flowType}s`]));
    let childPool = JSON.parse(JSON.stringify(stateOf[`${child.flowType}s`]));
  
    // verify that these flow parts are currently linked
    let childPos = parentPool[pIndex].children.indexOf(child.value);
    let parentPos = childPool[cIndex].parents.indexOf(parent.value);
  
    if (childPos==-1) throw new Error(`parent doesn't have this child!`);
    if (parentPos==-1) throw new Error(`child doesn't have this parent`);

    // remove the relationship
    parentPool[pIndex].children.splice(childPos,1);
    childPool[cIndex].parents.splice(parentPos,1);

    // save the results
    stateOf[`set${capitalizeFirstLetter(parent.flowType)}s`](parentPool);
    stateOf[`set${capitalizeFirstLetter(child.flowType)}s`](childPool);

  } else if (parent!==null) {// remove all children

    // let's first find the index position of the parent
    const pIndex = findIndexByIdentity(stateOf,parent);
    if (pIndex==-1) throw new Error(`parent not found!`);

    // find the child typoe
    let childType;
    switch(parent.flowType){
      case 'stage': childType='phase'; break;      
      case 'phase': childType='round'; break;      
      case 'round': childType='turn'; break;      
      case 'turn': childType='step'; break;      
      default: throw new Error(`${parent.flowType} has no children`);
    }

    // get the list of parents and children in each pool
    let parentPool = JSON.parse(JSON.stringify(stateOf[`${parent.flowType}s`]));
    let childPool = JSON.parse(JSON.stringify(stateOf[`${childType}s`]));
    
    // verify that the parent has at least one child
    if (parentPool[pIndex].children.length==0) throw new Error(`${parent.flowType} has no children`);

    // loop through and remove this parent from all children
    parentPool[pIndex].children.forEach((childValue:string)=>{
      childPool.forEach((child:any,index:number)=>{
        if (child.identity.value===childValue) {
          let parentPos = childPool[index].parents.indexOf(parent.value);
          if (parentPos===-1) throw new Error(`Child missing parent value`);
          childPool[index].parents.splice(parentPos,1);
        }
      });
    });

    // empty the parent's child list
    parentPool[pIndex].children = [];

    // save the results
    stateOf[`set${capitalizeFirstLetter(parent.flowType)}s`](parentPool);
    stateOf[`set${capitalizeFirstLetter(childType)}s`](childPool);

  } else if (child!==null) {

    // let's first find the index position of the child
    const cIndex = findIndexByIdentity(stateOf,child);
    if (cIndex==-1) throw new Error(`child not found!`);

    // find the child typoe
    let parentType;
    switch(child.flowType){
      case 'phase': parentType='stage'; break;      
      case 'round': parentType='phase'; break;      
      case 'turn': parentType='round'; break;      
      case 'step': parentType='turn'; break;      
      default: throw new Error(`${child.flowType} has no parents`);
    }

    // get the list of parents and children in each pool
    let parentPool = JSON.parse(JSON.stringify(stateOf[`${parentType}s`]));
    let childPool = JSON.parse(JSON.stringify(stateOf[`${child.flowType}s`]));
    
    // verify that the child has at least one parent
    if (childPool[cIndex].parents.length==0) throw new Error(`${child.flowType} has no parents`);

    // loop through and remove this parent from all children
    childPool[cIndex].parents.forEach((parentValue:string)=>{
      parentPool.forEach((parent:any,index:number)=>{
        if (parent.identity.value===parentValue) {
          let childPos = parentPool[index].children.indexOf(child.value);
          if (childPos===-1) throw new Error(`Parent missing child value`);
          parentPool[index].children.splice(childPos,1);
        }
      });
    });

    // empty the child's parent list
    childPool[cIndex].parents = [];

    // save the results
    stateOf[`set${capitalizeFirstLetter(parentType)}s`](parentPool);
    stateOf[`set${capitalizeFirstLetter(child.flowType)}s`](childPool);
  } else throw new Error(`Can't unlink nothing`);
  
};


// removes all relationships from a flow part
export const unLinkAll = (stateOf:any, identity:Item) => {
  // remove all children
  
};


// returns the full identity of the parents of any flow part
export const findParents = (stateOf:any, identity: Item) => {
  let parents = [];

  // find this flow part's index
  let index = stateOf[`${identity.flowType}s`].reduce((acc,curr,index)=>
    (curr.identity.value===identity.value) ? index : acc, -1);

  // make sure we are working with a valid flow part
  if (index==-1) throw new Error(`Flow part not found!`);

  // determine the parent flowType:
  let parentType;
  switch(identity.flowType){
    case 'phase': parentType='stage'; break;
    case 'round': parentType='phase'; break;
    case 'turn': parentType='round'; break;
    case 'step': parentType='turn'; break;
    default: throw new Error(`Cannot get parent for ${identity.flowType}`);
  }

  // loop through each of the flow parts listed parents
  stateOf[`${identity.flowType}s`][index].parents.forEach((parent:string) => {
    stateOf[`${parentType}s`].forEach((item:any) => {
      if (item.identity.value===parent) parents.push(item.identity);
    });
  });

  return parents;
};


// returns the children of any flow Part
export const findChildren = (stateOf:any, identity: Item) => {
  let children = [];
  
  // find this flow part's index
  let index = stateOf[`${identity.flowType}s`].reduce((acc,curr,index)=>
    (curr.identity.value===identity.value) ? index : acc, -1);

  // make sure we are working with a valid flow part
  if (index==-1) throw new Error(`Flow part not found!`);

  // determine the child flowType:
  let childType;
  switch(identity.flowType){
    case 'stage': childType='phase'; break;
    case 'phase': childType='round'; break;
    case 'round': childType='turn'; break;
    case 'turn': childType='step'; break;
    default: throw new Error(`Cannot get child for ${identity.flowType}`);
  }

  // loop through each of the flow parts listed childs
  stateOf[`${identity.flowType}s`][index].children.forEach((child:string) => {
    stateOf[`${childType}s`].forEach((item:any) => {
      if (item.identity.value===child) children.push(item.identity);
    });
  });

  return children;
};


// adds a new flow part ot the turn module
export const addPart = (stateOf:any, flowType: string, row: number) => {
  if (FLOW_PARTS.indexOf(flowType)>-1) {
    let flowParts = JSON.parse(JSON.stringify(stateOf[`${flowType}s`]));
    if (flowParts.length>9) throw new Error(`Can't have more than 10 ${flowType}s`);
    let thing = 
      flowType=='stage' ? JSON.parse(JSON.stringify(NEW_STAGE)) : 
      flowType=='phase' ? JSON.parse(JSON.stringify(NEW_PHASE)) : 
      flowType=='round' ? JSON.parse(JSON.stringify(NEW_ROUND)) :
      flowType=='turn' ? JSON.parse(JSON.stringify(NEW_TURN)) :
      flowType=='step' ? JSON.parse(JSON.stringify(NEW_STEP)) : {};
    thing.identity = {label:'', value:uuidv4(), flowType};
    flowParts.splice(row+1,0,thing);
    stateOf[`set${capitalizeFirstLetter(flowType)}s`](flowParts);
  }
  else throw new Error(`${flowType} is not an approved flow mechanism`);
};


// allows the client to remove a flow member from the TMI state
export const killPart = (stateOf:any, flowType: string, row:number) => {
  if (FLOW_PARTS.indexOf(flowType)>-1) {
    let flowParts = JSON.parse(JSON.stringify(stateOf[`${flowType}s`]));
    if (flowParts.length==1) throw new Error(`Can't have less than 1 ${flowType}s`);
    let thing = JSON.parse(JSON.stringify(flowParts[row]));
    flowParts.splice(row,1);
    stateOf[`set${capitalizeFirstLetter(flowType)}s`](flowParts);
  }
  else throw new Error(`${flowType} is not an approved flow mechanism`);
};

// move this thing up in the list
export const moveUp = (stateOf:any, flowPart: string, row:number) => {
  if (FLOW_PARTS.indexOf(flowPart)>-1) {
    let flowParts = JSON.parse(JSON.stringify(stateOf[`${flowPart}s`]));
    flowParts.splice(row-1, 0, flowParts.splice(row, 1)[0]);
    stateOf[`set${capitalizeFirstLetter(flowPart)}s`](flowParts);
  }
  else throw new Error(`${flowPart} is not an approved flow mechanism`);
};

// move this thing down in the list
export const moveDown = (stateOf:any, flowPart: string, row:number) => {
  if (FLOW_PARTS.indexOf(flowPart)>-1) {
    let flowParts = JSON.parse(JSON.stringify(stateOf[`${flowPart}s`]));
    flowParts.splice(row+1, 0, flowParts.splice(row, 1)[0]);
    stateOf[`set${capitalizeFirstLetter(flowPart)}s`](flowParts);
  }
  else throw new Error(`${flowPart} is not an approved flow mechanism`);
};

export const changer = (stateOf:any, flowPart: string, row: number, obj: object) => {
  if (FLOW_PARTS.indexOf(flowPart)>-1) {
    let flowParts = JSON.parse(JSON.stringify(stateOf[`${flowPart}s`]));
    flowParts[row] = Object.assign(flowParts[row],obj);
    stateOf[`set${capitalizeFirstLetter(flowPart)}s`](flowParts);
  }
  else throw new Error(`${flowPart} is not an approved flow mechanism`);
};

// this resets all the flow parts and provides a simple game framework
export const quickStart = (stateOf:any) => {
  let newStage = JSON.parse(JSON.stringify(stateOf.stages[0]));
  newStage.identity.label = 'Stage01';
  newStage.description = 'This game has only one stage';

  let newPhase = JSON.parse(JSON.stringify(stateOf.phases[0]));
  newPhase.identity.label = 'Phase01';
  newPhase.description = 'This game has only one phase';
  newStage.children = [newPhase.identity.value];
  newPhase.parents = [newStage.identity.value];

  let newRound = JSON.parse(JSON.stringify(stateOf.rounds[0]));
  newRound.identity.label = 'Round01';
  newRound.description = 'This game has only one kind of Round';
  newRound.type = 'fixed';
  newPhase.children = [newRound.identity.value];
  newRound.parents = [newPhase.identity.value];

  let newTurn = JSON.parse(JSON.stringify(stateOf.turns[0]));
  newTurn.identity.label = 'Turn01';
  newTurn.description = 'This game has only one type of turn';
  newRound.children = [newTurn.identity.value];
  newTurn.parents = [newRound.identity.value];

  let newStep = JSON.parse(JSON.stringify(stateOf.steps[0]));
  newStep.identity.label = 'Step01';
  newStep.description = `This game's turns have only one step`
  newTurn.children = [newStep.identity.value];
  newStep.parents = [newTurn.identity.value];

  stateOf.setStages([newStage]);
  stateOf.setPhases([newPhase]);
  stateOf.setRounds([newRound]);
  stateOf.setTurns([newTurn]);
  stateOf.setSteps([newStep]);
};

// clear removes all the details from a single flowPart except the id
export const clear = (stateOf:any, flowPart: string) => {
  if (FLOW_PARTS.indexOf(flowPart)>-1) {
    let flowParts = JSON.parse(JSON.stringify(stateOf[`${flowPart}s`]));

    const newFlowParts = flowParts.map((thing:any) => {
      let newThing:any;
      switch(flowPart) {
        case "stage": newThing = JSON.parse(JSON.stringify(NEW_STAGE)); break;
        case "phase": newThing = JSON.parse(JSON.stringify(NEW_PHASE)); break;
        case "round": newThing = JSON.parse(JSON.stringify(NEW_ROUND)); break;
        case "turn": newThing = JSON.parse(JSON.stringify(NEW_TURN)); break;
        case "step": newThing = JSON.parse(JSON.stringify(NEW_STEP)); break;
      }
      newThing.identity = {
        label:'', 
        flowType:thing.identity.flowType, 
        value:thing.identity.value
      };
      return newThing;
    });
    stateOf[`set${capitalizeFirstLetter(flowPart)}s`](newFlowParts);
  }
  else throw new Error(`${flowPart} is not an approved flow mechanism`);
};

// runs the clear function on every flowPart bucket
export const clearAll = (stateOf:any) => {
  FLOW_PARTS.forEach(flowPart => {
    stateOf.clear(flowPart).catch((err:any)=>{
      console.log(err);
    });
  });      
};
