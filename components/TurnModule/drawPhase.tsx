import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams } from './index';
import css from './turnModule.module.css';

/**
 * Phases are the game structure that broadly determine which actions are 
 * available to the agents; these sets of actions may be reduced by the 
 * current component state, but will never be increased. In other words: 
 * if an agent can do it, it must be listed in the phase definition first.
 * Phases are repeatable, both individually and in cycles; that is recorded 
 * in the stage definition
 * It's possible that phases get their actions from the embedded turns
 */

export interface Phase {
  id: string;             // unique identifer for the phase, generated
  name: string;           // human friendly name for the phase
  actions: Array<string>; // list of actions available in the phase
  roundId: string;        // type of round used in this phase
  turnId: string;         // type of turn used in this phase
}

export const NEW_PHASE = {
  id: '',
  name: '',
  actions: [],
  roundId: '',
  turnId: '',
};
 
export function drawPhase(
  stateOf: TurnModuleParams,
  phase: Phase,
  row: number
){
  return (
  <div className={css.cardSleeve} key={`phase-${row}`}>
    <div className={`${css.card} ${css.phase}`}>
      <div></div><div>Phase</div>
      <div className={css.head}>id:</div>
      <div className={css.body}>{phase.id}</div>
      <div className={css.head}>Name:</div>
      <div className={css.body}>{phase.name}</div>
      <div className={css.head}>Actions:</div>
      <div className={css.body}>{phase.actions.join(', ')}</div>
      <div className={css.head}>RoundID:</div>
      <div className={css.body}>{phase.roundId}</div>
      <div className={css.head}>TurnID:</div>
      <div className={css.body}>{phase.turnId}</div>
    </div>
    {flowEditor(stateOf,'phase',row)}
  </div>
  );
}