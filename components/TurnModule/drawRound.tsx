import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams } from './index';
import { camelToTitle } from '../../scripts/naming';
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
  interruptFreeText: string;
  interrupts: Array<string>;  // list of actions allowed to interrupt a turn
  reactionFreeText: string;
  reactions: Array<string>;   // list of actions allowed to react to a turn
  options: Array<RoundOption>; // list of options used with this round
}

export const NEW_ROUND = {
  id: '',
  name: '',
  type: '',
  interruptFreeText: '',
  interrupts: [],
  reactionFreeText: '',
  reactions: [],
  options: [],
};

const ROUND_TYPES = {
  fixed: {},
  progressive: {},
  lastFirst: {},
  randomStart: {},
  randomTurn: {},
  staticStat: {},
  dynamicStat: {},
  passOrder: {},
  bidStart: {},
  bidTurn: {},
  actionStart: {},
  actionTurn: {},
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
      <label className={css.head}>Name:</label>
      <input 
        className={css.body} 
        value={round.name}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>)=>{
          let rounds = JSON.parse(JSON.stringify(stateOf.rounds));
          rounds[row].name = evt.target.value;
          stateOf.setRounds(rounds);
        }}
      />
      <label className={css.head}>id:</label>
      <div className={css.identity}>{round.id}</div>
      <label className={css.head}>Type:</label>
      <select 
        className={css.body} 
        value={round.type}
        onChange={(evt: React.ChangeEvent<HTMLSelectElement>)=>{
          let rounds = JSON.parse(JSON.stringify(stateOf.rounds));
          rounds[row].type = evt.target.value;
          stateOf.setRounds(rounds);
        }}
      >
        <option value="Please Choose">Please Choose</option>
        {Object.keys(ROUND_TYPES).map(type=>{
          return (<option value={type}>{camelToTitle(type)}</option>);
        })}
      </select>

      <label className={css.head}>Interrupts:</label>
      <div className={css.body}>{round.interrupts.join(', ')}</div>

      <label className={css.head}>Reactions:</label>
      <div className={css.body}>{round.reactions.join(', ')}</div>

      <label className={css.head}>Options:</label>
      <div className={css.body}></div>
    </div>
    {flowEditor(stateOf,'round',row)}
  </div>
  );
}