import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams } from './index';
import { phraseFormatter } from '../common/naming';
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
  id: string;               // unique identifer for the phase, generated
  name: string;             // human friendly name for the phase
  actions: Array<string>;   // list of actions available in the phase
  roundId: string;          // type of round used in this phase
  turnId: string;           // type of turn used in this phase
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
      <label className={css.head}>Name:</label>
      <input 
        className={css.body} 
        value={phase.name}
        autoComplete="off"
        onChange={(evt: React.ChangeEvent<HTMLInputElement>)=>{
          stateOf.changer('phase',row,'name',phraseFormatter(evt.target.value));
        }}
        onKeyDown={(evt: React.KeyboardEvent<HTMLInputElement>)=>{
          if(evt.keyCode == 13) {
            evt.preventDefault();
            stateOf.changer('phase',row,'name',phase.name.trim());
          }
        }}
        onBlur={()=>{
          stateOf.changer('phase',row,'name',phase.name.trim());
        }}        
      />
      <label className={css.head}>id:</label>
      <div className={css.identity}>{phase.id}</div>
      <label className={css.head}>Actions:</label>
      <div className={css.body}>{phase.actions.join(', ')}</div>
      <label className={css.head}>RoundID:</label>
      <input 
        className={css.body} 
        value={phase.roundId}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>)=>{
          stateOf.changer('phase',row,'roundId',evt.target.value);
        }}
      />
      <label className={css.head}>TurnID:</label>
      <input 
        className={css.body} 
        value={phase.turnId}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>)=>{
          stateOf.changer('phase',row,'turnId',evt.target.value);
        }}
      />
    </div>
    {flowEditor(stateOf,'phase',row)}
  </div>
  );
}