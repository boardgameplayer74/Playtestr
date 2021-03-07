import React, { useState } from 'react';
import css from './actionModule.module.css';

export interface ActionModuleParams {
  
}

export function ActionModuleState(){
  // set initial state values

  // create a state modeul
  const stateOf = {
    
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