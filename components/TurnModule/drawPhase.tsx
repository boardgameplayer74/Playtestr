import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams, FlowPartOptions } from './index';
import { phraseFormatter } from '../common/naming';
import Select from 'react-select';
import { familySelector } from './selectors';
import TextareaAutosize from 'react-textarea-autosize';
import css from './turn.module.css';

/**
 * Phases are the game structure that broadly determine which actions are 
 * available to the agents; these sets of actions may be reduced by the 
 * current component state, but will never be increased. In other words: 
 * if an agent can do it, it must be listed in the phase definition first.
 * Phases are repeatable, both individually and in cycles; that is recorded 
 * in the stage definition
 * It's possible that phases get their actions from the embedded turns
 */

interface Item {
  label: string;
  value: string;
}

export interface Phase {
  identity: Item;         //  uniquely identifies this phase
  description: string;    // free test to describe the phase purpose
  actions: Array<Item>; // list of actions available in the phase
}

export const NEW_PHASE = {
  identity: null,
  description: '',
  actions: [],
};
 
export function drawPhase(
  stateOf: TurnModuleParams,
  phase: Phase,
  row: number,
  options?: FlowPartOptions,
){
  // use this to hide the ID strings that appear in the TMI
  const SHOW_ID = options['testing']==true ? '' : css.noShow;
  const customStyles = {
    control: (provided, state) => {
      //console.log('CONTROL: ',provided);
      return Object.assign(provided,{
        border: 'none',
        backgroundColor: 'rgba(255,255,255,.4)'
      });
    },
    option: (provided, state) => {
      //console.log('OPTION: ',provided);
      return Object.assign(provided,{
        backgroundColor:'rgba(255,255,255,.4)'
      });
    },
    singleValue: (provided, state) => {
      //console.log('SINGLE_VALUE: ',provided);
      return provided;
    }
  };

  return (
    <div className={css.cardSleeve} key={`phase-${row}`}>
      <div className={`${css.card} ${css.phase}`}>
        <label className={css.head}>Name:</label>
        <input 
          className={css.body} 
          value={phase.identity.label}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>)=>{
            let identity = JSON.parse(JSON.stringify(phase.identity));
            identity.label = phraseFormatter(evt.target.value);
            stateOf.changer('phase',row,{identity});
          }}
          onKeyDown={(evt: React.KeyboardEvent<HTMLInputElement>)=>{
            if(evt.keyCode == 13) {
              evt.preventDefault();
              let identity = JSON.parse(JSON.stringify(phase.identity));
              identity.label = phase.identity.label.trim();
              stateOf.changer('phase',row,{identity});
            }
          }}
          onBlur={()=>{
            let identity = JSON.parse(JSON.stringify(phase.identity));
            identity.label = phase.identity.label.trim();
            stateOf.changer('phase',row,{identity});
          }}        
        />
        <label className={`${css.head} ${SHOW_ID}`}>id:</label>
        <div className={`${css.identity} ${SHOW_ID}`}>{phase.identity.value}</div>
  
        <label className={css.head}>Description:</label>
        <TextareaAutosize 
          className={css.body} 
          minRows={2}
          value={phase.description}
          onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>)=>{
            stateOf.changer('phase',row,{description:evt.target.value});
          }}
        />
  
        <label className={css.head}>Actions:</label>
        <Select
          className={css.selector}
          styles={customStyles}
          isMulti
          value={phase.actions}
          options={stateOf.actionModule.getActions()}
          onChange={(actions,type)=>{
            stateOf.changer('phase',row,{actions});
            if (type.action=='select-option') {
            } else if (type.action=='remove-value') {
            } else if (type.action=='clear') {
            }
          }}
        />

        <label className={css.head}>Parent Stages:</label>
        {familySelector(stateOf,phase,'parent','stage')}

        <label className={css.head}>Child Rounds:</label>
        {familySelector(stateOf,phase,'child','round')}

      </div>
      {flowEditor(stateOf,'phase',row)}
    </div>
    );
}