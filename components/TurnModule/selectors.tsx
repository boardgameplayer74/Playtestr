import React, { useState } from 'react';
//import flowEditor from './flowEditor';
import { TurnModuleParams } from './index';
import Select, { components } from 'react-select';
//import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import css from './turn.module.css';

/*
// helper to reorder arrays
function arrayMove(array:any, from:number, to:number) {
  array = array.slice();
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
  return array;
}

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
*/

export function familySelector(
  stateOf: TurnModuleParams,
  self: any,
  type: string,
  flowPart: string
){

  // hook for setting the selected state
  //const [selected, setSelected] = useState([]);

  //const onChange = selectedOptions => setSelected(selectedOptions);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    console.log('',);
    console.log(`oldIndex: ${oldIndex}, newIndex: ${newIndex}`);
    
/*
    const newValue = arrayMove(selected, oldIndex, newIndex);
    setSelected(newValue);
    console.log(
      'Values sorted:',
      newValue.map(i => i.value)
    );
*/
  };

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

  if (type=='parent') {
    return (
      <Select 
        className={css.selector}
        styles={customStyles}
        isMulti
        value={(()=>stateOf.findParents(self.identity))()}
        options={stateOf[`${flowPart}s`].map((thing:any)=>thing.identity)}
        onChange={(selections,type) => {
          if (type.action=='select-option') {
            stateOf.addLink(type.option.value,self.identity.value);
            stateOf.addLink2(type.option,self.identity);
          } else if (type.action=='remove-value') {
            stateOf.unLink(type.removedValue.value,self.identity.value);
            stateOf.unLink2(type.removedValue,self.identity);
          } else if (type.action=='clear') {
            stateOf.unLink(null,self.identity.value);
            stateOf.unLink2(null,self.identity);
          }
        }}
      />
    );
  }
  if (type=='child') {
    return (
      <Select 
        className={css.selector}
        styles={customStyles}
        isMulti
        /*onSortEnd={onSortEnd}*/
        options={stateOf[`${flowPart}s`].map((thing:any)=>thing.identity)}
        value={(()=>{
          let selected = stateOf.findChildren(self.identity);
          //console.log('selected: ',selected);
          return selected;
        })()}
        onChange={(selections,type) => {
          if (type.action=='select-option') {
            console.log('selected: ',type.option);
            stateOf.addLink(self.identity.value,type.option.value);
            stateOf.addLink2(self.identity,type.option);
          } else if (type.action=='remove-value') {
            stateOf.unLink(self.identity.value,type.removedValue.value);
            stateOf.unLink2(self.identity,type.removedValue);
          } else if (type.action=='clear') {
            stateOf.unLink(self.identity.value,null);
            stateOf.unLink2(self.identity,null);
          }
        }}
        /*components={{
          MultiValue: SortableMultiValue,
          MultiValueLabel: SortableMultiValueLabel,
        }}*/
      />
    );
  }
  return null;
}