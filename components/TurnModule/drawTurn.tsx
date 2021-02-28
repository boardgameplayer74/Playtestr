import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams } from './index';
import css from './turnModule.module.css';

/**
 * Turn are the time window during which a single agent performs one or more 
 * actions sequentially before another agent is allowed to act, though 
 * interrupts and reactions may alter this. Turns have one or more steps 
 * which define a particular order that actions must be taken in. 
 * Multiple turns may be defined, typically one for each phase because the 
 * available actions are different
 * Turns are pre-defined structures that are selected by the designer 
 */

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
export interface Turn {
  id: string;                   // unique identifer for turn, generated
  name: string;                 // human friendly name for the turn
  type: string;                 // one of a pre-defined list of Turn types
  steps: Array<string>;         // list of steps taken within a Turn
  options: Array<TurnOption>;   // list of options used with this turn
}

export const NEW_TURN = {
  id: '',
  name: '',
  type: '',
  steps: [],
  options: [],
};

export function drawTurn(
  stateOf: TurnModuleParams,
  turn: Turn,
  row: number
){
  return (
  <div className={css.cardSleeve} key={`turn-${row}`}>
    <div className={`${css.card} ${css.turn}`}>
      <div></div><div>Turn</div>
      <div className={css.head}>id:</div>
      <div className={css.body}>{turn.id}</div>
      <div className={css.head}>Name:</div>
      <div className={css.body}>{turn.name}</div>
      <div className={css.head}>type:</div>
      <div className={css.body}>{turn.type}</div>
      <div className={css.head}>Steps:</div>
      <div className={css.body}>{turn.steps.join(', ')}</div>
      <div className={css.head}>Options:</div>
      <div className={css.body}>{turn.options}</div>
    </div>
    {flowEditor(stateOf,'turn',row)}
  </div>
  );
}