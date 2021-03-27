import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams, FlowPartOptions } from './index';
import { phraseFormatter } from '../common/naming';
import { familySelector } from './selectors';
import TextareaAutosize from 'react-textarea-autosize';
import css from './turn.module.css';

/**
 * Turns are the time window during which a single agent performs one or more 
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

interface Item {
  label: string;
  value: string;
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
  //id: string;                 // unique identifer for turn, generated
  //name: string;               // human friendly name for the turn
  identity: Item;             // uniquely identifies this Turn
  description: string;        // free test to describe the turn purpose
  type: string;               // one of a pre-defined list of Turn types
  //stepFreeText: string;       // free text of step names
  //steps: Array<Item>;       // list of steps taken within a Turn
  options: Array<TurnOption>; // list of options used with this turn
}

export const NEW_TURN = {
  //id: '',
  //name: '',
  identity: null,
  description: '',
  type: '',
  //stepFreeText: '',
  //steps: [],
  options: [],
};

export function drawTurn(
  stateOf: TurnModuleParams,
  turn: Turn,
  row: number,
  options?: FlowPartOptions,
){
  // use this to hide the ID strings that appear in the TMI
  const SHOW_ID = options['testing']==true ? '' : css.noShow;

  return (
    <div className={css.cardSleeve} key={`turn-${row}`}>
      <div className={`${css.card} ${css.turn}`}>
        <label className={css.head}>Name:</label>
        <input 
          className={css.body} 
          value={turn.identity.label}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>)=>{
            let identity = JSON.parse(JSON.stringify(turn.identity));
            identity.label = phraseFormatter(evt.target.value);
            stateOf.changer('turn',row,{identity});
          }}
          onKeyDown={(evt: React.KeyboardEvent<HTMLInputElement>)=>{
            if(evt.keyCode == 13) {
              evt.preventDefault();
              let identity = JSON.parse(JSON.stringify(turn.identity));
              identity.label = turn.identity.label.trim();
              stateOf.changer('turn',row,{identity});
            }
          }}
          onBlur={()=>{
            let identity = JSON.parse(JSON.stringify(turn.identity));
            identity.label = turn.identity.label.trim();
            stateOf.changer('turn',row,{identity});
          }}        
        />
  
        <label className={css.head}>id:</label>
        <div className={css.identity}>{turn.identity.value}</div>
  
        <label className={css.head}>Description:</label>
        <TextareaAutosize 
          className={css.body} 
          minRows={2}
          value={turn.description}
          onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>)=>{
            stateOf.changer('turn',row,{description:evt.target.value});
          }}
        />

        <label className={css.head}>type:</label>
        <div className={css.body}>{turn.type}</div>
  
        <label className={css.head}>Options:</label>
        <div className={css.body}>{turn.options}</div>
  
        <label className={css.head}>Parent Rounds:</label>
        {familySelector(stateOf,turn,'parent','round')}

        <label className={css.head}>Child Steps:</label>
        {familySelector(stateOf,turn,'child','step')}

      </div>
      {flowEditor(stateOf,'turn',row)}
    </div>
    );
}