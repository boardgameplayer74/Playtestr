import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import css from './action.module.css';

interface item {
  label: string;
  value: string;
}

export interface ActionModuleParams {
  actions: Array<item>;
  
  getActions: Function;
}

export function ActionModuleState(){
  // set initial state values

  // create a state modeul
  const stateOf = {
    actions: [
      {label:'Action01',value:uuidv4()},
      {label:'Action02',value:uuidv4()},
      {label:'Action03',value:uuidv4()},
      {label:'Action04',value:uuidv4()},
      {label:'Action05',value:uuidv4()},
      {label:'Action06',value:uuidv4()},
      {label:'Action07',value:uuidv4()},
      {label:'Action08',value:uuidv4()},
      {label:'Action09',value:uuidv4()},
      {label:'Action10',value:uuidv4()},
    ],

    getActions: () => {
      return JSON.parse(JSON.stringify(stateOf.actions));
    }
  };
  
  // send the state object to the client
  return stateOf;
}

export function actionModuleInterface(
  stateOf: ActionModuleParams
){
  return (
    <div className={css.AMIContainer}>
      <div>Welcome to the Action Module Interface (stub)!</div>
    </div>
  );
}