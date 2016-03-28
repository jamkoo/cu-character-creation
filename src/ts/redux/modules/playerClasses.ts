/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Promise} from 'es6-promise';
import 'isomorphic-fetch';

import {fetchJSON} from '../../utils/fetchHelpers';
import ResponseError from '../../utils/ResponseError';

import {archetype, faction} from 'camelot-unchained';

const apiUrl = 'https://api.camelotunchained.com/';
const apiVersion = 1;
const shard = 1;

export interface PlayerClassInfo {
  name: string,
  description: string,
  faction: faction,
  id: archetype
}

const FETCH_PLAYER_CLASS = 'cu-character-creation/player-class/FETCH_PLAYER_CLASS';
const FETCH_PLAYER_CLASS_SUCCESS = 'cu-character-creation/player-class/FETCH_PLAYER_CLASS_SUCCESS';
const FETCH_PLAYER_CLASS_FAILED = 'cu-character-creation/player-class/FETCH_PLAYER_CLASS_FAILED';
const SELECT_CLASS = 'cu-character-creation/player-class/SELECT_CLASS';

export function requestPlayerClasses() {
  return {
    type: FETCH_PLAYER_CLASS
  }
}

export function fetchPlayerClassesSuccess(playerClasses: Array<PlayerClassInfo>) {
  return {
    type: FETCH_PLAYER_CLASS_SUCCESS,
    playerClasses: playerClasses,
    receivedAt: Date.now()
  }
}

export function fetchPlayerClassesFailed(error: ResponseError) {
  return {
    type: FETCH_PLAYER_CLASS_FAILED,
    error: error.message
  }
}

export function selectPlayerClass(selected: PlayerClassInfo) {
  return {
    type: SELECT_CLASS,
    selected: selected
  }
}

export function fetchPlayerClasses() {
  return (dispatch: (action: any) => any) => {
    dispatch(requestPlayerClasses());
    return fetchJSON(`${apiUrl}gamedata/archetypes?api-version=${apiVersion}`)
      .then((playerClasses: Array<PlayerClassInfo>) => dispatch(fetchPlayerClassesSuccess(playerClasses)))
      .catch((error: ResponseError) => dispatch(fetchPlayerClassesFailed(error)));
  }
}

export interface PlayerClassesState {
  isFetching?: boolean;
  lastUpdated?: Date;
  playerClasses?: Array<PlayerClassInfo>;
  selected?: PlayerClassInfo;
  error?: string;
}

const initialState: PlayerClassesState  = {
  isFetching: false,
  lastUpdated: <Date>null,
  playerClasses: <Array<PlayerClassInfo>>[],
  selected: null,
  error: null
}

export default function reducer(state: PlayerClassesState = initialState, action: any = {}) {
  switch(action.type) {
    case FETCH_PLAYER_CLASS:
      return Object.assign({}, state, {
        isFetching: true
      });
    case FETCH_PLAYER_CLASS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        lastUpdated: action.receivedAt,
        playerClasses: action.playerClasses
      });
    case FETCH_PLAYER_CLASS_FAILED:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      });
    case SELECT_CLASS:
      return Object.assign({}, state, {
        selected: action.selected
      });
    default: return state;
  }
}
