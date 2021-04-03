import React from 'react';
import { TurnModuleParams } from './index';
import css from './turn.module.css';
import ReactTooltip from 'react-tooltip';

export default function flowEditor(
  stateOf: TurnModuleParams,
  thing: string,
  row: number
){
  let things = stateOf[`${thing}s`];

  const killShow = things.length<2 ? css.noShow : '';
  const upShow = row==0 ? css.noShow : '';
  const downShow = things.length-1==row ? css.noShow : '';

  return (
    <div className={css.flowEditor}>
      <ReactTooltip />
      <button 
        className={css.add}
        data-tip={`Add another ${thing} after this one`}
        data-place="right"
        data-type="light"
        data-border="true"
        data-border-color="black"
        tabIndex={-1}
        onClick={()=>{
          let timer = setTimeout(() => {
            ReactTooltip.hide();
            clearTimeout(timer);
          }, 6000);
          stateOf.addPart(thing,row);
        }}
      >+</button>
      <button 
        className={`${css.kill} ${killShow}`}
        data-tip={`delete the current ${thing}`}
        data-place="right"
        data-type="light"
        data-border="true"
        data-border-color="black"
        tabIndex={-1}
        onClick={()=>{
          let timer = setTimeout(() => {
            ReactTooltip.hide();
            clearTimeout(timer);
          }, 6000);
          stateOf.killPart(thing,row);
        }}
      >-</button>
      <button 
        className={`${css.up} ${upShow}`}
        data-tip="move up one"
        data-place="right"
        data-type="light"
        data-border="true"
        data-border-color="black"
        tabIndex={-1}
        onClick={()=>{
          let timer = setTimeout(() => {
            ReactTooltip.hide();
            clearTimeout(timer);
          }, 6000);
          stateOf.moveUp(thing,row);
        }}
      >&uarr;</button>
      <button 
        className={`${css.down} ${downShow}`}
        data-tip="move down one"
        data-place="right"
        data-type="light"
        data-border="true"
        data-border-color="black"
        tabIndex={-1}
        onClick={()=>{
          let timer = setTimeout(() => {
            ReactTooltip.hide();
            clearTimeout(timer);
          }, 6000);
          stateOf.moveDown(thing,row);
        }}
      >&darr;</button>
    </div>
  );
}