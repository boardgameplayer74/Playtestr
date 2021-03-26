import { FLOW_PARTS } from './index';
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

// creates a link between flowTypes, designating one as the parent and the other as the child
export const addLink = (stateOf:any, parentId: string, childId: string) => {
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

  //console.log('PARENTS: ',linkParents);
  //console.log('CHILDREN: ',linkChildren);
  //console.log('LINKTABLE: ',linkTable);

  // save the updated link data
  stateOf.setLinkTable(linkTable);
  stateOf.setLinkParents(linkParents);
  stateOf.setLinkChildren(linkChildren);
};

export const unLink = (stateOf: any, parentId: string, childId: string) => {
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

  //console.log('PARENTS: ',linkParents);
  //console.log('CHILDREN: ',linkChildren);
  //console.log('LINKTABLE: ',linkTable);

  // save the updated link data
  stateOf.setLinkTable(linkTable);
  stateOf.setLinkParents(linkParents);
  stateOf.setLinkChildren(linkChildren);
};


// returns the child ID's of the given parent
export const findChildren = (stateOf:any, parentId:string) => {
  //console.log('LINK TABLE: ',stateOf.linkTable);
  let r = stateOf.linkParents.reduce((acc:number,curr:string,index:number)=>{
    if (curr==parentId) return index;
    return acc;
  },-1) as number;
  let children=[];
  if (r>-1) {
    stateOf.linkChildren.forEach((child:string,c:number)=>{
      if (stateOf.linkTable[r][c]==true) children.push(child);
    });
  }
  return children;
};


// returns the parent ID's of the given child
export const findParents = (stateOf:any, childId: string) => {
  let c = stateOf.linkChildren.reduce((acc:number,curr:string,index:number)=>{
    if (curr==childId) return index;
    return acc;
  },-1) as number;
  let parents=[];
  if (c>-1) {
    stateOf.linkParents.forEach((parent:string,r:number)=>{
      if (stateOf.linkTable[r][c]==true) parents.push(parent);
    });
  }
  return parents;
};



export const addPart = (stateOf:any, flowPart: string, row: number) => {
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
      thing.identity = {label:'', value:uuidv4()};

      // put the new flow part in the state copy
      flowParts.splice(row+1,0,thing);

      // replace the original TMI with the new version
      stateOf[`set${capitalizeFirstLetter(flowPart)}s`](flowParts);

      // return true when the function operated correctly
      return resolve();
    }
    return reject(`${flowPart} is not an approved flow mechanism`);
  });
};


// allows the client to remove a flow member from the TMI state
export const killPart = (stateOf:any, flowPart: string, row:number) => {
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
};

// move this thing up in the list
export const moveUp = (stateOf:any, flowPart: string, row:number) => {
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
};

// move this thing down in the list
export const moveDown = (stateOf:any, flowPart: string, row:number) => {
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
};

export const changer = (stateOf:any, flowPart: string, row: number, obj: object) => {
  return new Promise<void>((resolve,reject)=>{
    if (FLOW_PARTS.indexOf(flowPart)>-1) {
      let flowParts = JSON.parse(JSON.stringify(stateOf[`${flowPart}s`]));
      flowParts[row] = Object.assign(flowParts[row],obj);
      stateOf[`set${capitalizeFirstLetter(flowPart)}s`](flowParts);
      return resolve();
    }
    return reject (`${flowPart} is not an approved flow mechanism`);
  });
};

// retrieves the name of a flow part using the flow part type and id number 
export const getNameById = (stateOf:any, flowPart: string, value: string) => {
  if (FLOW_PARTS.indexOf(flowPart)>-1) {
    return stateOf[`${flowPart}s`].reduce((acc:string,curr:any)=>{
        return (curr.identity.value==value) ? curr.identity : acc;
      },null);
  } else return '';
};

// this resets all the flow parts and provides a simple game framework
export const quickStart = (stateOf:any) => {
  let newStage = JSON.parse(JSON.stringify(stateOf.stages[0]));
  newStage.identity.label = 'Stage01';
  newStage.description = 'This game has only one stage';

  let newPhase = JSON.parse(JSON.stringify(stateOf.phases[0]));
  newPhase.identity.label = 'Phase01';
  newPhase.description = 'This game has only one phase';
  //stateOf.addLink(newStage.identity.value,newPhase.identity.value);

  let newRound = JSON.parse(JSON.stringify(stateOf.rounds[0]));
  newRound.identity.label = 'Round01';
  newRound.description = 'This game has only one kind of Round';
  newRound.type = 'fixed';
  //stateOf.addLink(newPhase.identity.value,newRound.identity.value);

  let newTurn = JSON.parse(JSON.stringify(stateOf.turns[0]));
  newTurn.identity.label = 'Turn01';
  newTurn.description = 'This game has only one type of turn';
  //stateOf.addLink(newRound.identity.value,newTurn.identity.value);

  let newStep = JSON.parse(JSON.stringify(stateOf.steps[0]));
  newStep.identity.label = 'Step01';

  stateOf.setStages([newStage]);
  stateOf.setPhases([newPhase]);
  stateOf.setRounds([newRound]);
  stateOf.setTurns([newTurn]);
  stateOf.setSteps([newStep]);

  //stateOf.addLink(newStage.identity.value,newPhase.identity.value);
  //stateOf.addLink(newPhase.identity.value,newRound.identity.value);
};

// clear removes all the details from a single flowPart except the id
export const clear = (stateOf:any, flowPart: string) => {
  return new Promise<void>((resolve,reject)=>{
    if (FLOW_PARTS.indexOf(flowPart)>-1) {
      let flowParts = JSON.parse(JSON.stringify(stateOf[`${flowPart}s`]));

      const newFlowParts = flowParts.map((thing:any) => {
        let newThing:any;
        switch(flowPart) {
          case "stage":
            newThing = JSON.parse(JSON.stringify(NEW_STAGE));
            newThing.identity.value = thing.identity.value;
            break;
          case "phase":
            newThing = JSON.parse(JSON.stringify(NEW_PHASE));
            newThing.identity.value = thing.identity.value;
            break;
          case "round":
            newThing = JSON.parse(JSON.stringify(NEW_ROUND));
            newThing.identity.value = thing.identity.value;
            break;
          case "turn":
            newThing = JSON.parse(JSON.stringify(NEW_TURN));
            newThing.identity.value = thing.identity.value;
            break;
          case "step":
            newThing = JSON.parse(JSON.stringify(NEW_STEP));
            newThing.identity.value = thing.identity.value;
            break;
        }
        return newThing;
      });
      stateOf[`set${capitalizeFirstLetter(flowPart)}s`](newFlowParts);
      return resolve();
    }
    return reject(`${flowPart} is not an approved flow mechanism`);
  });
};

// runs the clear function on every flowPart bucket
export const clearAll = (stateOf:any) => {
  FLOW_PARTS.forEach(flowPart => {
    stateOf.clear(flowPart).catch((err:any)=>{
      console.log(err);
    });
  });      
};
