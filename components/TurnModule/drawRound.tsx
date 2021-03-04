import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams } from './index';
import { capitalize, camelToTitle, phraseFormatter } from '../../scripts/naming';
import TextareaAutosize from 'react-textarea-autosize';
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

// helper to handle change events
function changer(
  stateOf: TurnModuleParams, 
  flowPart: string,
  row: number,
  key: string,
  value: string | number,
) {
  let things = JSON.parse(JSON.stringify(stateOf[flowPart]));
  things[row][key] = value;
  stateOf[`set${capitalize(flowPart)}`](things);
}
 
export function drawRound(
  stateOf: TurnModuleParams,
  round: Round,
  row: number
){
  return (
  <div className={css.cardSleeve} key={`round-${row}`}>
    <div className={`${css.card} ${css.round}`}>
      <label className={css.head}>Name:</label>
      <input 
        className={css.body} 
        value={round.name}
        autoComplete="off"
        onChange={(evt: React.ChangeEvent<HTMLInputElement>)=>{
          stateOf.changer('rounds',row,'name',evt.target.value);
        }}
      />
      <label className={css.head}>id:</label>
      <div className={css.identity}>{round.id}</div>
      <label className={css.head}>Type:</label>
      <select 
        className={css.body} 
        value={round.type}
        onChange={(evt: React.ChangeEvent<HTMLSelectElement>)=>{
          stateOf.changer('rounds',row,'type',evt.target.value);
        }}
      >
        <option value="Please Choose" key={'round-00'}>Please Choose</option>
        {Object.keys(ROUND_TYPES).map((type:string,index:number)=>{
          return (<option value={type} key={`round-${index}`}>{camelToTitle(type)}</option>);
        })}
      </select>

      <label className={css.head}>Interrupts:</label>
      <TextareaAutosize 
        className={css.body} 
        minRows={2}
        value={round.interruptFreeText}
        onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>)=>{
          stateOf.changer('rounds',row,'interruptFreeText',evt.target.value);
        }}
        onKeyDown={(evt: React.KeyboardEvent<HTMLTextAreaElement>)=>{
          if(evt.keyCode == 13) {
            evt.preventDefault();
            let interrupts = phraseFormatter(round.interruptFreeText);
            stateOf.changer('rounds',row,'interrupts',interrupts);
            stateOf.changer('rounds',row,'interruptFreeText',interrupts.join(', '));
          }
        }}
        onBlur={()=>{
          let interrupts = phraseFormatter(round.interruptFreeText);
          stateOf.changer('rounds',row,'interrupts',interrupts);
          stateOf.changer('rounds',row,'interruptFreeText',interrupts.join(', '));
        }}
      />
      
      <label className={css.head}>Reactions:</label>
      <TextareaAutosize 
        className={css.body}
        minRows={2}
        value={round.reactionFreeText}
        onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>)=>{
          stateOf.changer('rounds',row,'reactionFreeText',evt.target.value);
        }}
        onKeyDown={(evt: React.KeyboardEvent<HTMLTextAreaElement>)=>{
          if(evt.keyCode == 13) {
            evt.preventDefault();
            let reactions = phraseFormatter(round.reactionFreeText);
            stateOf.changer('rounds',row,'reactions',reactions);
            stateOf.changer('rounds',row,'reactionFreeText',reactions.join(', '));
          }
        }}
        onBlur={()=>{
          let reactions = phraseFormatter(round.reactionFreeText);
          stateOf.changer('rounds',row,'reactions',reactions);
          stateOf.changer('rounds',row,'reactionFreeText',reactions.join(', '));
        }}
      />

      <label className={css.head}>Options:</label>
      <div className={css.body}></div>
    </div>
    {flowEditor(stateOf,'round',row)}
  </div>
  );
}