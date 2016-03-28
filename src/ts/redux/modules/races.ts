/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Promise} from 'es6-promise';
import 'isomorphic-fetch';

import {fetchJSON} from '../../utils/fetchHelpers';
import ResponseError from '../../utils/ResponseError';

import {race, faction} from 'camelot-unchained';

const apiUrl = 'https://api.camelotunchained.com/';
const apiVersion = 1;
const shard = 1;

export interface RaceInfo {
  name: string,
  description: string,
  faction: faction,
  id: race
}

const FETCH_RACES = 'cu-character-creation/races/FETCH_RACES';
const FETCH_RACES_SUCCESS = 'cu-character-creation/races/FETCH_RACES_SUCCESS';
const FETCH_RACES_FAILED = 'cu-character-creation/races/FETCH_RACES_FAILED';
const SELECT_RACE = 'cu-character-creation/races/SELECT_RACE';

export function requestRaces() {
  return {
    type: FETCH_RACES
  }
}

export function fetchRacesSuccess(races: Array<RaceInfo>) {
  return {
    type: FETCH_RACES_SUCCESS,
    races: races,
    receivedAt: Date.now()
  }
}

export function fetchRacesFailed(error: ResponseError) {
  return {
    type: FETCH_RACES_FAILED,
    error: error.message
  }
}

export function selectRace(selected: RaceInfo) {
  return {
    type: SELECT_RACE,
    selected: selected
  }
}

export function fetchRaces() {
  return (dispatch: (action: any) => any) => {
    dispatch(requestRaces());
    return fetchJSON(`${apiUrl}gamedata/races?api-version=${apiVersion}`)
      .then((races: Array<RaceInfo>) => dispatch(fetchRacesSuccess(races)))
      .catch((error: ResponseError) => dispatch(fetchRacesFailed(error)));
  }
}

export interface RacesState {
  isFetching?: boolean;
  lastUpdated?: Date;
  races?: Array<RaceInfo>;
  selected?: RaceInfo;
  error?: string;
}

const initialState: RacesState  = {
  isFetching: false,
  lastUpdated: <Date>null,
  races: <Array<RaceInfo>>[],
  selected: null,
  error: null
}

export default function reducer(state: RacesState = initialState, action: any = {}) {
  switch(action.type) {
    case FETCH_RACES:
      return Object.assign({}, state, {
        isFetching: true
      });
    case FETCH_RACES_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        lastUpdated: action.receivedAt,
        races: action.races
      });
    case FETCH_RACES_FAILED:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      });
    case SELECT_RACE:
      return Object.assign({}, state, {
        selected: action.selected
      });
    default: return state;
  }
}
