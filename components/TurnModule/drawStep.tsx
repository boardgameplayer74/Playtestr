import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams, FlowPartOptions } from './index';
import { phraseFormatter, phraseListFormatter } from '../common/naming';
//import Select from 'react-select';
import { familySelector } from './selectors';
import TextareaAutosize from 'react-textarea-autosize';
import css from './turn.module.css';

/**
 * Steps are sets of Actions that users are required to pick from in sequential 
 * order. Turns may have a single step with a single available action, a single 
 * step with many available actions, or many steps each with it's own distinct 
 * set of available actions.  
 * Some designers call steps "Sequential Phases" or sometimes even just phases.
 */
 
interface Item {
  label: string;
  value: string;
}

export interface Step {
  identity: Item;         // uniquely identifies this step
  description: string;    // free test to describe the stage purpose
  actionFreeText;         // free text of action names
  actions: Array<string>; // a list of Actions permitted during the step
}

export const NEW_STEP = {
  identity: null,
  description: '',
  actionFreeText: '',
  actions: [],
};


export function drawStep(
  stateOf: TurnModuleParams,
  step: Step,
  row: number,
  options?: FlowPartOptions,
){
  // use this to hide the ID strings that appear in the TMI
  const SHOW_ID = options['testing']==true ? '' : css.noShow;

  return (
    <div className={css.cardSleeve} key={`step-${row}`}>
      <div className={`${css.card} ${css.step}`}>
        <label className={css.head}>Name:</label>
        <input 
          className={css.body}
          value={step.identity.label}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>)=>{
            let identity = JSON.parse(JSON.stringify(step.identity));
            identity.label = phraseFormatter(evt.target.value);
            stateOf.changer('step',row,{identity});
          }}
          onKeyDown={(evt: React.KeyboardEvent<HTMLInputElement>)=>{
            if(evt.keyCode == 13) {
              evt.preventDefault();
              let identity = JSON.parse(JSON.stringify(step.identity));
              identity.label = step.identity.label.trim();
              stateOf.changer('step',row,{identity});
            }
          }}
          onBlur={()=>{
            let identity = JSON.parse(JSON.stringify(step.identity));
            identity.label = step.identity.label.trim();
            stateOf.changer('step',row,{identity});
          }}        
        />
  
        <label className={css.head}>id:</label>
        <div className={css.identity}>{step.identity.value}</div>

        <label className={css.head}>Description:</label>
        <TextareaAutosize 
          className={css.body} 
          minRows={2}
          value={step.description}
          onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>)=>{
            stateOf.changer('step',row,{description:evt.target.value});
          }}
        />

        <label className={css.head}>Actions:</label>
        <TextareaAutosize
          className={css.body}
          minRows={2}
          value={step.actionFreeText}
          onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>)=>{
            stateOf.changer('step',row,{actionFreeText:evt.target.value});
          }}
          onKeyDown={(evt: React.KeyboardEvent<HTMLTextAreaElement>)=>{
            if(evt.keyCode == 13) {
              evt.preventDefault();
              let actions = phraseListFormatter(step.actionFreeText);
              stateOf.changer('step',row,{actions,actionFreeText:actions.join(', ')});
            }
          }}
          onBlur={()=>{
            let actions = phraseListFormatter(step.actionFreeText);
            stateOf.changer('step',row,{actions,actionFreeText:actions.join(', ')});
          }}
        />

        <label className={css.head}>Parent Turns:</label>
        {familySelector(stateOf,step,'parent','turn')}

      </div>
      {flowEditor(stateOf,'step',row)}
    </div>
    );
}