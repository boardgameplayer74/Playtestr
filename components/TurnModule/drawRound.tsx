import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams } from './index';
import css from './turnModule.module.css';

/**
 * rounds are the game structure that determines the specific order in which 
 * agents may act. Rounds have one of a predetermined list of types and may 
 * also include specific interrupts and reactions that can temporarily alter 
 * turn order. Only specific actions are allowed to interrupt or react and 
 * agents must have access to those actions as indicated by a 
 * tracking component
 * Rounds are pre-defined structures that are selected by teh designer
 */

/**
 * Options: Many rounds and turns have parameters that are set by 
 * options and flags
 */
interface RoundOption {
  key: string;              // a key that identifies a particular turn option
  value: string | boolean;  // a value that indicates which option was taken
}

export interface Round {
  id: string;                 // unique identifer for round, generated
  name: string;               // human friendly name for the round
  type: string;               // one of a pre-defined list of Round types
  interrupts: Array<string>;  // list of actions allowed to interrupt a turn
  reactions: Array<string>;   // list of actions allowed to react to a turn
  options: Array<RoundOption>; // list of options used with this round
}

export const NEW_ROUND = {
  id: '',
  name: '',
  type: '',
  interrupts: [],
  reactions: [],
  options: [],
};
 
export function drawRound(
  stateOf: TurnModuleParams,
  round: Round,
  row: number
){
  return (
  <div className={css.cardSleeve} key={`round-${row}`}>
    <div className={`${css.card} ${css.round}`}>
      <div></div><div>Round</div>
      <div className={css.head}>id:</div>
      <div className={css.body}>{round.id}</div>
      <div className={css.head}>Name:</div>
      <div className={css.body}>{round.name}</div>
      <div className={css.head}>Type:</div>
      <div className={css.body}>{round.type}</div>
      <div className={css.head}>Interrupts:</div>
      <div className={css.body}>{round.interrupts.join(', ')}</div>
      <div className={css.head}>Reactions:</div>
      <div className={css.body}>{round.reactions.join(', ')}</div>
      <div className={css.head}>Options:</div>
      <div className={css.body}></div>
    </div>
    {flowEditor(stateOf,'round',row)}
  </div>
  );
}