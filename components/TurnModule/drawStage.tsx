import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams, FlowPartOptions } from './index';
import { 
  phraseFormatter, 
  phraseListFormatter, 
  capitalizeWordListByKey 
} from '../common/naming';
import Select from 'react-select';
import TextareaAutosize from 'react-textarea-autosize';
import css from './turn.module.css';

// this returns the rule module state so we can get a list of rules
import { RuleModuleParams, RuleModuleState } from '../RuleModule';

/**
 * Stages are the largest structure in game flow, and are responsible for 
 * determining the current rules set of the game. Stages frequently play very 
 * differently from each other. All games have at least one stage, with 
 * specialized "startup" and "cleanup" stages being the most common additional 
 * stages. However, games can have any positive number of stages.
 */

/**
 * a phase cycle describes how which phases repeat within a stage and what 
 * triggers the game to move on from that cycle
 */
interface PhaseCycle {
  phases: Array<string>;  // an array of phase names that repeat in sequence
  trigger: Array<string>; // an array of trigger events that will end the cycle
}

interface item {
  value: string;
  label: string;
}

export interface Stage {
  id: string;                     // unique identifier for the stage, generated
  name: string;                   // human friendly name for the stage
  description: string;            // free test to describe the stage purpose
  //phaseFreeText: string;          // free text of phase names
  phases: Array<string>;          // list of phases in the stage
  phaseCycles: Array<PhaseCycle>; // list of phase cycles in the stage
  //ruleFreeText: string;           // free text of rule names
  rules: Array<item>;             // list of rules used in this stage (?)
}

export const NEW_STAGE = {
  id: '',
  name: '',
  description: '',
  //phaseFreeText: '',
  phases: [],
  phaseCycles: [],
  //ruleFreeText: '',
  rules: [],
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

  return (
    <div className={css.cardSleeve} key={`stage-${row}`}>
      <div className={`${css.card} ${css.stage}`}>
        <label className={css.head}>Name:</label>
        <input 
          className={css.body} 
          value={stage.name}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>)=>{
            stateOf.changer('stage',row,{name:phraseFormatter(evt.target.value)});
          }}
        />

        <label className={`${css.head} ${SHOW_ID}`}>id:</label>
        <div className={`${css.identity} ${SHOW_ID}`}>{stage.id}</div>

        <label className={css.head}>Description:</label>
        <TextareaAutosize 
          className={css.body} 
          minRows={2}
          value={stage.description}
          onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>)=>{
            stateOf.changer('stage',row,{description:evt.target.value});
          }}
        />

        <label className={css.head}>Child Phases:</label>
        <Select 
          className={css.selector}
          styles={customStyles}
          isMulti
          value={(()=>{
            let childIds = stateOf.findChildren(stage.id);
            return childIds.map((childId)=>
              ({label:stateOf.getNameById('phase',childId), value:childId}));
          })()}
          options={stateOf.phases.map(phase=>{
            let phaseName = stateOf.phases.reduce((acc,curr)=>
              (curr.id==phase.id) ? curr.name : acc,'');
            return {label: phaseName, value: phase.id}
          })}
          onChange={(phases,type) => {
            if (type.action=='select-option') {
              stateOf.addLink(stage.id,type.option.value);
            } else if (type.action=='remove-value') {
              stateOf.removeLink(stage.id,type.removedValue.value);
            } else if (type.action=='clear') {
              stateOf.removeLink(stage.id,null);
            }
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
      </div>
      {flowEditor(stateOf,'stage',row)}
    </div>
  );
}