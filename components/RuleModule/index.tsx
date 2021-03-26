import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import css from './rule.module.css';

interface item {
  label: string;
  value: string;
}

export interface RuleModuleParams {
  rules: Array<item>;

  getRules: Function;
}

export function RuleModuleState(){
  // set initial state values

  // create a state modeul
  const stateOf = {
    rules: [
      {label:'Rule01',value:uuidv4()},
      {label:'Rule02',value:uuidv4()},
      {label:'Rule03',value:uuidv4()},
      {label:'Rule04',value:uuidv4()},
      {label:'Rule05',value:uuidv4()},
      {label:'Rule06',value:uuidv4()},
      {label:'Rule07',value:uuidv4()},
      {label:'Rule08',value:uuidv4()},
      {label:'Rule09',value:uuidv4()},
      {label:'Rule10',value:uuidv4()},
    ],

    // functions
    getRules: () => {
      return JSON.parse(JSON.stringify(stateOf.rules));
    }
  };
  
  // send the state object to the client
  return stateOf;
}

export function ruleModuleInterface(
  stateOf: RuleModuleParams
){
  return (
    <div className={css.RMIContainer}>
      <div>Welcome to the Rule Module Interface (stub)!</div>
    </div>
  );
}