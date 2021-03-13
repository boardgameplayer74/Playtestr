import React, { useState } from 'react';
import { render, fireEvent, getByTestId} from "@testing-library/react";
import { TurnModuleState, turnModuleInterface } from '../components/TurnModule/index';
import { NEW_STAGE, drawStage } from '../components/TurnModule/drawStage';

// this tests the hello API
describe("Check TurnModule functions:", () => {


  // TODO: test the state component functions
  //const TMP = TurnModuleState();
/*
  test("TurnModuleParams returns object", () => {
    expect(typeof tpm).toBe('object');
  });
*/

  test("NEW_STAGE is an object", () => {
    expect(typeof NEW_STAGE == 'Object');
  });
  
  
});