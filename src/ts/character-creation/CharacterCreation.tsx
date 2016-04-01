/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import 'es6-promise';
import 'isomorphic-fetch';
import * as React from 'react';
import {createStore, applyMiddleware} from 'redux';
import {connect, Provider} from 'react-redux';
import * as thunkMiddleware from 'redux-thunk';

import {gender} from 'camelot-unchained';

import FactionSelect from './components/FactionSelect';
import PlayerClassSelect from './components/PlayerClassSelect';
import RaceSelect from './components/RaceSelect';
import AttributesSelect from './components/AttributesSelect';
import Animate from './utils/Animate';

import reducer from './redux/modules/reducer';
import {RacesState, fetchRaces, selectRace, RaceInfo} from './redux/modules/races';
import {FactionsState, fetchFactions, selectFaction, FactionInfo} from './redux/modules/factions';
import {PlayerClassesState, fetchPlayerClasses, selectPlayerClass, PlayerClassInfo} from './redux/modules/playerClasses';
import {AttributesState, fetchAttributes, allocateAttributePoint, AttributeInfo, attributeType, resetAttributes} from './redux/modules/attributes';
import {AttributeOffsetsState, fetchAttributeOffsets, AttributeOffsetInfo} from './redux/modules/attributeOffsets';
import {CharacterState, createCharacter, CharacterCreationModel, resetCharacter} from './redux/modules/character';
import {selectGender} from './redux/modules/genders';

declare var Materialize: any;

const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware
)(createStore);

let store = createStoreWithMiddleware(reducer);

function select(state: any): any {
  return {
    racesState: state.races,
    playerClassesState: state.playerClasses,
    factionsState: state.factions,
    attributesState: state.attributes,
    attributeOffsetsState: state.attributeOffsets,
    gender: state.gender,
    characterState: state.character,
  }
}

export enum pages {
  FACTION_SELECT,
  RACE_SELECT,
  CLASS_SELECT,
  ATTRIBUTES
}

export interface CharacterCreationProps {
  apiKey: string;
  apiHost: string;
  apiVersion: number;
  shard: number;
  created: () => void;
  dispatch?: (action: any) => void;
  racesState?: RacesState;
  playerClassesState?: PlayerClassesState;
  factionsState?: FactionsState;
  attributesState?: AttributesState;
  attributeOffsetsState?: AttributeOffsetsState;
  gender?: gender;
  characterState?: CharacterState;
}

class CharacterCreation extends React.Component<CharacterCreationProps, any> {
  private faction$: any;
  private race$: any;
  private class$: any;

  constructor(props: any) {
    super(props);
    this.state = {page: pages.FACTION_SELECT}
  }

  create = () => {
    // try to create...
    let model: CharacterCreationModel = {
      name: (this.refs['name-input'] as any).value,
      race: this.props.racesState.selected.id,
      gender: this.props.gender,
      faction: this.props.factionsState.selected.id,
      archetype: this.props.playerClassesState.selected.id,
      shardID: this.props.shard,
      attributes: this.props.attributesState.attributes.reduce((acc: any, cur: AttributeInfo) => {
        if (cur.type !== attributeType.PRIMARY) return acc;
        if (typeof acc.name !== 'undefined') {
          let name = acc.name;
          let val = acc.allocatedPoints;
          acc = {};
          acc[name] = val;
        }
        if (typeof acc[cur.name] === 'undefined' || isNaN(acc[cur.name])) {
          acc[cur.name] = cur.allocatedPoints;
        } else {
          acc[cur.name] += cur.allocatedPoints;
        }
        return acc;
      }),
    }
    this.props.dispatch(createCharacter(model,
                        this.props.apiKey,
                        this.props.apiHost,
                        this.props.shard,
                        this.props.apiVersion));
  }


  componentWillMount() {
    this.props.dispatch(resetCharacter());
    this.props.dispatch(fetchFactions(this.props.apiHost, this.props.shard, this.props.apiVersion));
    this.props.dispatch(fetchRaces(this.props.apiHost, this.props.shard, this.props.apiVersion));
    this.props.dispatch(fetchPlayerClasses(this.props.apiHost, this.props.shard, this.props.apiVersion));
    this.props.dispatch(fetchAttributes(this.props.apiHost, this.props.shard, this.props.apiVersion));
    this.props.dispatch(fetchAttributeOffsets(this.props.apiHost, this.props.shard, this.props.apiVersion));
  }

  componentDidUpdate() {
    if (this.props.characterState.success) {
      this.props.created();
    }
  }

  selectFaction = (selected: FactionInfo) => {
    this.props.dispatch(selectFaction(selected));

    let factionRaces = this.props.racesState.races.filter((r: RaceInfo) => r.faction == selected.id);
    let factionClasses = this.props.playerClassesState.playerClasses.filter((c: PlayerClassInfo) => c.faction == selected.id);
    this.props.dispatch(selectPlayerClass(factionClasses[0]))
    this.props.dispatch(selectRace(factionRaces[0]))

    // reset race & class if they are not of the selected faction
    if (this.props.racesState.selected && this.props.racesState.selected.faction != selected.id) {
      this.props.dispatch(selectRace(null));
      this.props.dispatch(selectPlayerClass(null));
    }
  }

  render() {
    if (this.props.characterState.success) {
      this.props.created();
      this.props.dispatch(resetAttributes());
      this.props.dispatch(resetCharacter());
    }

    let content: any = null;
    let next: any = null;
    let back : any = null;
    let name: any = null;
    switch (this.state.page) {
      case pages.FACTION_SELECT:
        content = (
          <FactionSelect factions={this.props.factionsState.factions}
                         selectedFaction={this.props.factionsState.selected}
                         selectFaction={this.selectFaction} />
        );
        next = (
          <a className='cu-btn right'
             onClick={() => {
               if (this.props.factionsState.selected == null) {
                 Materialize.toast('Choose a faction to continue.', 3000)
                 return;
               }
               let factionRaces = this.props.racesState.races.filter((r: RaceInfo) => r.faction == this.props.factionsState.selected.id);
               let factionClasses = this.props.playerClassesState.playerClasses.filter((c: PlayerClassInfo) => c.faction == this.props.factionsState.selected.id);
               this.props.dispatch(selectPlayerClass(factionClasses[0]))
               this.props.dispatch(selectRace(factionRaces[0]))
               this.setState({page: this.state.page + 1});
             }}
             disabled={this.state.page == pages.ATTRIBUTES} >Next</a>
        );
        break;
      case pages.RACE_SELECT:
        content = (
          <RaceSelect races={this.props.racesState.races}
                      selectedRace={this.props.racesState.selected}
                      selectRace={(selected: RaceInfo) => {
                          this.props.dispatch(selectRace(selected));
                        }}
                      selectedGender={this.props.gender}
                      selectGender={(selected: gender) => this.props.dispatch(selectGender(selected))}
                      selectedFaction={this.props.factionsState.selected} />
        );
        back = (
          <a className='cu-btn left'
             onClick={() => this.setState({page: this.state.page - 1})}
             disabled={this.state.page == pages.FACTION_SELECT} >Back</a>
        );
        next = (
          <a className='cu-btn right'
             onClick={() => {
                if (this.props.racesState.selected == null) {
                  Materialize.toast('Choose a race to continue.', 3000)
                  return;
                }
                if (this.props.gender == 0) {
                  Materialize.toast('Choose a gender to continue.', 3000)
                  return;
                }
                this.setState({page: this.state.page + 1})
              }}
             disabled={this.state.page == pages.ATTRIBUTES} >Next</a>
        );
        name = (
          <div className='cu-character-creation__name'>
            <input type='text' ref='name-input' placeholder='Character Name'/>
          </div>
        );
        break;
      case pages.CLASS_SELECT:
       content = (
          <PlayerClassSelect classes={this.props.playerClassesState.playerClasses}
                             selectedClass={this.props.playerClassesState.selected}
                             selectClass={(selected: PlayerClassInfo) => this.props.dispatch(selectPlayerClass(selected))}
                             selectedFaction={this.props.factionsState.selected} />
        );
        back = (
          <a className='cu-btn left'
             onClick={() => this.setState({page: this.state.page - 1})}
             disabled={this.state.page == pages.FACTION_SELECT} >Back</a>
        );
        next = (
          <a className='cu-btn right'
             onClick={() => {
                if (this.props.playerClassesState.selected == null) {
                  Materialize.toast('Choose a class to continue.', 3000)
                  return;
                }
                this.setState({page: this.state.page + 1});
              }}
             disabled={this.state.page == pages.ATTRIBUTES} >Next</a>
        );
        name = (
          <div className='cu-character-creation__name'>
            <input type='text' ref='name-input' placeholder='Character Name'/>
          </div>
        );
        break;
      case pages.ATTRIBUTES:
        content = (
          <AttributesSelect attributes={this.props.attributesState.attributes}
                            attributeOffsets={this.props.attributeOffsetsState.offsets}
                            selectedGender={this.props.gender}
                            selectedRace={this.props.racesState.selected.id}
                            allocatePoint={(name: string, value: number) => this.props.dispatch(allocateAttributePoint(name, value))}
                            remainingPoints={this.props.attributesState.maxPoints - this.props.attributesState.pointsAllocated} />
        );
        back = (
          <a className='cu-btn left'
             onClick={() => this.setState({page: this.state.page - 1})}
             disabled={this.state.page == pages.FACTION_SELECT} >Back</a>
        );
        next = (
          <a className='cu-btn right' onClick={this.create} >Create</a>
        );
        name = (
          <div className='cu-character-creation__name'>
            <input type='text' ref='name-input' placeholder='Character Name'/>
          </div>
        );
        break;
    }

    return (
      <div className='cu-character-creation'>
        <div className='cu-character-creation__content'>
          {content}
        </div>
        {name}
        <div className='cu-character-creation__navigation'>
          {back}
          {next}
        </div>
      </div>
    )
  }
}

const ConnectedCharacterCreation = connect(select)(CharacterCreation);

export interface ContainerProps {
  apiKey: string;
  apiHost: string;
  apiVersion: number;
  shard: number;
  created: () => void;
}

class Container extends React.Component<ContainerProps, any> {
  render() {
    return (
      <div id='cu-character-creation'>
        <Provider store={store}>
          <ConnectedCharacterCreation apiKey={this.props.apiKey}
                                      apiHost={this.props.apiHost}
                                      apiVersion={this.props.apiVersion}
                                      shard={this.props.shard}
                                      created={this.props.created} />
        </Provider>
        <div className='preloader' ></div>
      </div>
    )
  }
}

export default Container;
