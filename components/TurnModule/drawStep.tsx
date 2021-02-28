import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams } from './index';
import css from './turnModule.module.css';

/**
 * Steps are sets of Actions that users are required to pick from in sequential 
 * order. Turns may have a single step with a single available action, a single 
 * step with many available actions, or many steps each with it's own distinct 
 * set of available actions.  
 * Some designers call steps "Sequential Phases" or sometimes even just phases.
 */
export interface Step {
  id: string;   // unique identifier for the Step, generated
  name: string; // human friendly name for the Step, changeable
  actions: Array<string>; // a list of Actions permitted during the step
}

export const NEW_STEP = {
  id: '',
  name: '',
  actions: [],
};

export function drawStep(
  stateOf: TurnModuleParams,
  step: Step,
  row: number
){
  return (
  <div className={css.cardSleeve} key={`step-${row}`}>
    <div className={`${css.card} ${css.step}`}>
      <div></div><div>Step</div>
      <div className={css.head}>id:</div>
      <div className={css.body}>{step.id}</div>
      <div className={css.head}>Name:</div>
      <div className={css.body}>{step.name}</div>
      <div className={css.head}>Actions:</div>
      <div className={css.body}>{step.actions.join(', ')}</div>
    </div>
    {flowEditor(stateOf,'step',row)}
  </div>
  );
}