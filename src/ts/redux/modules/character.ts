/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Promise} from 'es6-promise';
import 'isomorphic-fetch';

import {checkStatus, parseJSON} from '../../utils/fetchHelpers';
import ResponseError from '../../utils/ResponseError';

import {race, faction, gender, archetype} from 'camelot-unchained';

const defaultBanes = {
  "5429de13da9beb2c3c3dd450":3,
  "5429de13da9beb2c3c3dd451":1,
  "5429de13da9beb2c3c3dd452":1,
};

const defaultBoons = {"5429de0eda9beb2c3c3dd32b":1};

export interface CharacterCreationModel {
  name: string;
  race: race;
  gender: gender;
  faction: faction;
  archetype: archetype;
  shardID: number;
  attributes: {}; // primary attributes
  banes?: {};
  boons?: {};
}

const CREATE_CHARACTER = 'cu-character-creation/character/CREATE_CHARACTER';
const CREATE_CHARACTER_SUCCESS = 'cu-character-creation/character/CREATE_CHARACTER_SUCCESS';
const CREATE_CHARACTER_FAILED = 'cu-character-creation/character/CREATE_CHARACTER_FAILED';

export function createCharacter(model: CharacterCreationModel,
                                apiKey: string,
                                //apiUrl: string = 'https://api.camelotunchained.com/',
                                apiUrl: string = 'http://localhost:1337/',
                                shard: number = 1,
                                apiVersion: number = 1) {
  model.banes = defaultBanes;
  model.boons = defaultBoons;
  return (dispatch: (action: any) => any) => {
    dispatch(createCharacterStarted());
    return fetch(`${apiUrl}characters/${shard}`,
      {
        method: 'post',
        body: JSON.stringify(model),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-version': apiVersion,
          'loginToken': apiKey
        }
      })
      .then(checkStatus).then(() => createCharacterSuccess())
      .catch((error: ResponseError) => createCharacterFailed(error))
  }
}

export function createCharacterStarted() {
  return {
    type: CREATE_CHARACTER,
  }
}

export function createCharacterSuccess() {
  return {
    type: CREATE_CHARACTER_SUCCESS,
  }
}

export function createCharacterFailed(error: ResponseError) {
  return {
    type: CREATE_CHARACTER_FAILED,
    error: error.message,
  }
}

export interface CharacterState {
  isFetching?: boolean,
  success?: boolean,
  error?: string,
}

const initialState: CharacterState = {
  isFetching: false,
  success: false,
  error: null,
}

export default function reducer(state: CharacterState = initialState, action: any = {}) {
  switch(action.type) {
    case CREATE_CHARACTER:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case CREATE_CHARACTER_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        success: true,
      });
    case CREATE_CHARACTER_FAILED:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error,
      });
    default: return state;
  }
}