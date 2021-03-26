import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams, FlowPartOptions } from './index';
import { phraseFormatter, phraseListFormatter, capitalizeWordListByKey } from '../common/naming';
import Select from 'react-select';
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
  id: string;             // unique identifer for the phase, generated
  name: string;           // human friendly name for the phase
  description: string;    // free test to describe the phase purpose
  //stageFreeText: string;  // free text of the stages this phase can be found in
  stages: Array<string>;  // list of stages this phase can be found in
  actions: Array<Item>; // list of actions available in the phase
  //roundName: string;      // the human-readable name of the round definition
  //roundId: string;        // the id of the round definition
  round: Item;            // holds the chosen round type
  //turnName: string;       // human readable turn name
  //turnId: string;         // type of turn used in this phase
  turn: Item;             // holds the chosen turn type
}

export const NEW_PHASE = {
  id: '',
  name: '',
  description: '',
  //stageFreeText: '',
  stages: [],
  actions: [],
  //roundName: '',
  //roundId: '',
  round: null,
  //turnName: '',
  //turnId: '',
  turn: null,
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
          value={phase.name}
          autoComplete="off"
          onChange={(evt: React.ChangeEvent<HTMLInputElement>)=>{
            stateOf.changer('phase',row,{name:phraseFormatter(evt.target.value)});
          }}
          onKeyDown={(evt: React.KeyboardEvent<HTMLInputElement>)=>{
            if(evt.keyCode == 13) {
              evt.preventDefault();
              stateOf.changer('phase',row,{name:phase.name.trim()});
            }
          }}
          onBlur={()=>{
            stateOf.changer('phase',row,{name:phase.name.trim()});
          }}        
        />
        <label className={`${css.head} ${SHOW_ID}`}>id:</label>
        <div className={`${css.identity} ${SHOW_ID}`}>{phase.id}</div>
  
        <label className={css.head}>Description:</label>
        <TextareaAutosize 
          className={css.body} 
          minRows={2}
          value={phase.description}
          onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>)=>{
            stateOf.changer('phase',row,{description:evt.target.value});
          }}
        />
  
        <label className={css.head}>Parent Stages:</label>
        <Select 
          className={css.selector}
          classNamePrefix={'selector'}
          styles={customStyles}
          isMulti
          value={(()=>{
            let parentIds = stateOf.findParents(phase.id);
            return parentIds.map((parentId)=>
              ({label:stateOf.getNameById('stage',parentId), value:parentId}));
          })()}
          options={stateOf.stages.map(stage=>{
            let stageName = stateOf.stages.reduce((acc,curr)=>
              (curr.id==stage.id) ? curr.name : acc,'');
            return {label: stageName, value: stage.id}
          })}
          onChange={(stages,type) => {
            if (type.action=='select-option') {
              stateOf.addLink(type.option.value,phase.id);
            } else if (type.action=='remove-value') {
              stateOf.removeLink(type.removedValue.value,phase.id);
            } else if (type.action=='clear') {
              stateOf.removeLink(null,phase.id);
            }
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

        <label className={css.head}>Round Name:</label>
        <Select
          className={css.selector}
          styles={customStyles}
          isClearable
          value={(()=>{
            let childIds = stateOf.findChildren(phase.id);
            return childIds.map((childId)=>
              ({label:stateOf.getNameById('round',childId), value:childId}));
          })()}
          options={stateOf.rounds.map((round)=>
            ({label:round.name, value:round.id}))
          }          
          onChange={(round,type)=>{
            //stateOf.changer('phase',row,{round});
            stateOf.removeLink(phase.id,null);
            if (type.action=='select-option') {
              stateOf.addLink(phase.id,round.value);
            }
          }}
        />

        <label className={`${css.head} ${SHOW_ID}`}>Round Id:</label>
        <div className={`${css.identity} ${SHOW_ID}`}>{phase.round && phase.round.value}</div>
  
        <label className={css.head}>Turn Name:</label>
        <Select
          className={css.selector}
          styles={customStyles}
          isClearable
          value={(()=>{
            let childIds = stateOf.findChildren(phase.id);
            return childIds.map((childId)=>
              ({label:stateOf.getNameById('turn',childId), value:childId}));
          })()}
          options={stateOf.turns.map((turn)=>
            ({label:turn.name, value:turn.id}))
          }          
          onChange={(turn,type)=>{
            stateOf.changer('phase',row,{turn});
            stateOf.removeLink(phase.id,null);
            if (type.action=='select-option') {
              stateOf.addLink(phase.id,turn.value);
            }
          }}
        />

        <label className={`${css.head} ${SHOW_ID}`}>Turn Id:</label>
        <div className={`${css.identity} ${SHOW_ID}`}>{phase.turn && phase.turn.value}</div>
  
      </div>
      {flowEditor(stateOf,'phase',row)}
    </div>
    );
}