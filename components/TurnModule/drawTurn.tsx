import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams } from './index';
import { phraseFormatter, phraseListFormatter } from '../common/naming';
import TextareaAutosize from 'react-textarea-autosize';
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
  id: string;                 // unique identifer for turn, generated
  name: string;               // human friendly name for the turn
  type: string;               // one of a pre-defined list of Turn types
  stepFreeText: string;       // free text of step names
  steps: Array<string>;       // list of steps taken within a Turn
  options: Array<TurnOption>; // list of options used with this turn
}

export const NEW_TURN = {
  id: '',
  name: '',
  type: '',
  stepFreeText: '',
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
      <label className={css.head}>Name:</label>
      <input 
        className={css.body} 
        value={turn.name}
        autoComplete="off"
        onChange={(evt: React.ChangeEvent<HTMLInputElement>)=>{
          stateOf.changer('turn',row,'name',phraseFormatter(evt.target.value));
        }}
      />
      <label className={css.head}>id:</label>
      <div className={css.identity}>{turn.id}</div>
      <label className={css.head}>type:</label>
      <div className={css.body}>{turn.type}</div>
      <label className={css.head}>Steps:</label>
      <TextareaAutosize 
        className={css.body} 
        minRows={2}
        value={turn.stepFreeText}
        onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>)=>{
          stateOf.changer('turn',row,'stepFreeText',evt.target.value);
        }}
        onKeyDown={(evt: React.KeyboardEvent<HTMLTextAreaElement>)=>{
          if(evt.keyCode == 13) {
            evt.preventDefault();
            let steps = phraseListFormatter(turn.stepFreeText);
            stateOf.changer('turn',row,'steps',steps);
            stateOf.changer('turn',row,'stepFreeText',steps.join(', '));
          }
        }}
        onBlur={()=>{
          let steps = phraseListFormatter(turn.stepFreeText);
          stateOf.changer('turn',row,'steps',steps);
          stateOf.changer('turn',row,'stepFreeText',steps.join(', '));
        }}
      />
      <label className={css.head}>Options:</label>
      <div className={css.body}>{turn.options}</div>
    </div>
    {flowEditor(stateOf,'turn',row)}
  </div>
  );
}