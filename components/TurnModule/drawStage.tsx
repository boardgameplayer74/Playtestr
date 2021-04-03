import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams, FlowPartOptions, Item } from './index';
import { phraseFormatter } from '../common/naming';
import Select from 'react-select';
import { familySelector } from './selectors';
import TextareaAutosize from 'react-textarea-autosize';
import css from './turn.module.css';

// this returns the rule module state so we can get a list of rules
//import { RuleModuleParams, RuleModuleState } from '../RuleModule';

/**
 * Stages are the largest structure in game flow, and are responsible for 
 * determining the current rules set of the game. Stages frequently play very 
 * differently from each other. All games have at least one stage, with 
 * specialized "startup" and "cleanup" stages being the most common additional 
 * stages. However, games can have any positive number of stages.
 */

export interface Stage {
  flowType: string;
  identity: Item;           // identifies this stage uniquely
  description: string;      // free test to describe the stage purpose
  rules: Array<Item>;       // list of rules used in this stage (?)
  children: Array<string>;  // a list of the phase IDs this tage is linked to
}

export const NEW_STAGE = {
  flowType: 'stage',
  identity: null,
  description: '',
  rules: [],
  children: [],
};

export function drawStage(
  stateOf: TurnModuleParams,
  stage: Stage,
  row: number,
  options?: FlowPartOptions,
){
  // use this to hide the ID strings that appear in the TMI
  const SHOW_ID = options['testing']==true ? '' : css.noShow;
  const customStyles = {
    control: (provided:any, state:any) => {
      //console.log('CONTROL: ',provided);
      return Object.assign(provided,{
        border: 'none',
        backgroundColor: 'rgba(255,255,255,.4)'
      });
    },
    option: (provided:any, state:any) => {
      //console.log('OPTION: ',provided);
      return Object.assign(provided,{
        backgroundColor:'rgba(255,255,255,.4)'
      });
    },
    singleValue: (provided:any, state:any) => {
      //console.log('SINGLE_VALUE: ',provided);
      return provided;
    }
  };

  //console.log('MODEL: ',stateOf.model());

  return (
    <div className={css.cardSleeve} key={`stage-${row}`}>
      <div className={`${css.card} ${css.stage}`}>
        <label className={css.head}>Name:</label>
        <input 
          className={css.body} 
          value={stage.identity.label}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>)=>{
            let identity = JSON.parse(JSON.stringify(stage.identity));
            identity.label = phraseFormatter(evt.target.value);
            stateOf.changer('stage',row,{identity});
          }}
          onKeyDown={(evt: React.KeyboardEvent<HTMLInputElement>)=>{
            if(evt.keyCode == 13) {
              evt.preventDefault();
              let identity = JSON.parse(JSON.stringify(stage.identity));
              identity.label = stage.identity.label.trim();
              stateOf.changer('stage',row,{identity});
            }
          }}
          onBlur={()=>{
            let identity = JSON.parse(JSON.stringify(stage.identity));
            identity.label = stage.identity.label.trim();
            stateOf.changer('stage',row,{identity});
          }}        
        />

        <label className={`${css.head} ${SHOW_ID}`}>id:</label>
        <div className={`${css.identity} ${SHOW_ID}`}>{stage.identity.value}</div>

        <label className={css.head}>Description:</label>
        <TextareaAutosize 
          className={css.body} 
          minRows={2}
          value={stage.description}
          onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>)=>{
            stateOf.changer('stage',row,{description:evt.target.value});
          }}
        />

        <label className={css.head}>Rules:</label>
        <Select
          className={css.selector}
          styles={customStyles}
          isMulti
          value={stage.rules}
          options={stateOf.ruleModule.getRules()}
          onChange={(rules,type)=>{
            stateOf.changer('stage',row,{rules});
            if (type.action=='select-option') {
            } else if (type.action=='remove-value') {
            } else if (type.action=='clear') {
            }
          }}
        />

        <label className={css.head}>Child Phases:</label>
        {familySelector(stateOf,stage,'child','phase')}

       </div>
     {flowEditor(stateOf,'stage',row)}
    </div>
  );
}