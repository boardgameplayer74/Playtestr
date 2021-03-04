import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams } from './index';
import { phraseFormatter } from '../../scripts/naming';
import TextareaAutosize from 'react-textarea-autosize';
import css from './turnModule.module.css';

/**
 * Steps are sets of Actions that users are required to pick from in sequential 
 * order. Turns may have a single step with a single available action, a single 
 * step with many available actions, or many steps each with it's own distinct 
 * set of available actions.  
 * Some designers call steps "Sequential Phases" or sometimes even just phases.
 */
export interface Step {
  id: string;             // unique identifier for the Step, generated
  name: string;           // human friendly name for the Step, changeable
  actionFreeText;         // free text of action names
  actions: Array<string>; // a list of Actions permitted during the step
}

export const NEW_STEP = {
  id: '',
  name: '',
  actionFreeText: '',
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
      <label className={css.head}>Name:</label>
      <input 
        className={css.body}
        value={step.name}
        autoComplete="off"
        onChange={(evt: React.ChangeEvent<HTMLInputElement>)=>{
          stateOf.changer('steps',row,'name',evt.target.value);
        }}
      />
      <label className={css.head}>id:</label>
      <div className={css.identity}>{step.id}</div>
      <label className={css.head}>Actions:</label>
      <TextareaAutosize
        className={css.body}
        minRows={2}
        value={step.actionFreeText}
        onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>)=>{
          stateOf.changer('steps',row,'actionFreeText',evt.target.value);
        }}
        onKeyDown={(evt: React.KeyboardEvent<HTMLTextAreaElement>)=>{
          if(evt.keyCode == 13) {
            evt.preventDefault();
            let actions = phraseFormatter(step.actionFreeText);
            stateOf.changer('steps',row,'actions',actions);
            stateOf.changer('steps',row,'actionFreeText',actions.join(', '));
          }
        }}
        onBlur={()=>{
          let actions = phraseFormatter(step.actionFreeText);
          stateOf.changer('steps',row,'actions',actions);
          stateOf.changer('steps',row,'actionFreeText',actions.join(', '));
        }}
      />
    </div>
    {flowEditor(stateOf,'step',row)}
  </div>
  );
}