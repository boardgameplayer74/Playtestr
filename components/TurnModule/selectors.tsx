import React, { useState, useEffect } from 'react';
import { TurnModuleParams } from './index';
import Select, { components } from 'react-select';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import css from './turn.module.css';

// helper keep menu from opening on drag-n-drop
const SortableMultiValue = SortableElement(props => {
  // this prevents the menu from being opened/closed when the user clicks
  // on a value to begin dragging it. ideally, detecting a click (instead of
  // a drag) would still focus the control and toggle the menu, but that
  // requires some magic with refs that are out of scope for this example
  const onMouseDown = e => {
    e.preventDefault();
    e.stopPropagation();
  };
  const innerProps = { ...props.innerProps, onMouseDown };
  return <components.MultiValue {...props} innerProps={innerProps} />;
});

// helper component for labels
const SortableMultiValueLabel = SortableHandle(props => (
  <components.MultiValueLabel {...props} />
));

const SortableSelect = SortableContainer(Select);


export function familySelector(
  stateOf: TurnModuleParams,
  flowPart: any,
  relationship: string,
  flowType: string
){

  // use this to hide the ID strings that appear in the TMI
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

  if (relationship=='parent') {
    return (
      <Select 
        className={css.selector}
        styles={customStyles}
        isMulti
        value={(()=>stateOf.findParents(flowPart.identity))()}
        options={stateOf[`${flowType}s`].map((thing:any)=>thing.identity)}
        onChange={(selections,actionType) => {
          if (actionType.action=='select-option') {
            stateOf.addLink(actionType.option,flowPart.identity);
          } else if (actionType.action=='remove-value') {
            stateOf.unLink(actionType.removedValue,flowPart.identity);
          } else if (actionType.action=='clear') {
            stateOf.unLink(null,flowPart.identity);
          }
        }}
      />
    );
  }
  if (relationship=='child') {
    return (
      <SortableSelect 
        className={css.selector}
        styles={customStyles}
        isMulti
        axis="xy"
        distance={4}
        getHelperDimensions={({ node }) => node.getBoundingClientRect()}
        onSortEnd={({ oldIndex, newIndex })=>{
          stateOf.reorderChildren(flowPart.identity,oldIndex,newIndex);
        }}
        options={stateOf[`${flowType}s`].map((thing:any)=>thing.identity)}
        value={(()=>stateOf.findChildren(flowPart.identity))()}
        onChange={(selections,actionType) => {
          console.log('ACTION TYPE: ',actionType);
          if (actionType.action=='select-option') {
            stateOf.addLink(flowPart.identity,actionType.option);
          } else if (actionType.action=='remove-value') {
            stateOf.unLink(flowPart.identity,actionType.removedValue);
          } else if (actionType.action=='clear') {
            stateOf.unLink(flowPart.identity,null);
          }
        }}
        components={{
          MultiValue: SortableMultiValue,
          MultiValueLabel: SortableMultiValueLabel,
        }}
      />
    );
  }
  return null;
}