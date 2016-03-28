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

import FactionSelect from './FactionSelect';
import PlayerClassSelect from './PlayerClassSelect';
import RaceSelect from './RaceSelect';
import AttributesSelect from './AttributesSelect';

import reducer from '../redux/modules/reducer';
import {RacesState, fetchRaces, selectRace, RaceInfo} from '../redux/modules/races';
import {FactionsState, fetchFactions, selectFaction, FactionInfo} from '../redux/modules/factions';
import {PlayerClassesState, fetchPlayerClasses, selectPlayerClass, PlayerClassInfo} from '../redux/modules/playerClasses';
import {AttributesState, fetchAttributes, allocateAttributePoint, AttributeInfo, AttributeType} from '../redux/modules/attributes';
import {CharacterState, createCharacter, CharacterCreationModel} from '../redux/modules/character';
import {selectGender} from '../redux/modules/genders';

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
    atributeOffsetsState: state.attributeOffsets,
    gender: state.gender,
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
  dispatch?: (action: any) => void;
  racesState?: RacesState;
  playerClassesState?: PlayerClassesState;
  factionsState?: FactionsState;
  attributesState?: AttributesState;
  gender?: gender;
}

class CharacterCreation extends React.Component<any, any> {
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
      gender: gender.MALE,
      faction: this.props.factionsState.selected.id,
      archetype: this.props.playerClassesState.selected.id,
      shardID: this.props.shard,
      attributes: this.props.attributesState.attributes.reduce((acc: any, cur: AttributeInfo) => {
        if (cur.type !== AttributeType.Primary) return acc;
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
                        this.props.apiUrl,
                        this.props.shard,
                        this.props.apiVersion));
  }


  componentWillMount() {
    this.props.dispatch(fetchFactions());
    this.props.dispatch(fetchRaces());
    this.props.dispatch(fetchPlayerClasses());
    this.props.dispatch(fetchAttributes());
  }

  componentWillUnmount() {

  }

  render() {
    let content: any = null;
    let next: any = null;
    let back : any = null;
    let name: any = null;
    switch (this.state.page) {
      case pages.FACTION_SELECT:
        content = (
          <FactionSelect factions={this.props.factionsState.factions}
                         selectedFaction={this.props.factionsState.selected}
                         selectFaction={(selected: FactionInfo) => this.props.dispatch(selectFaction(selected))} />
        );
        next = (
          <a className='cu-btn right'
             onClick={() => {
               if (this.props.factionsState.selected == null) return;
               this.setState({page: this.state.page + 1});
             }}
             disabled={this.state.page == pages.ATTRIBUTES} >Next</a>
        );
        break;
      case pages.RACE_SELECT:
        content = (
          <RaceSelect races={this.props.racesState.races}
                      selectedRace={this.props.racesState.selected}
                      selectRace={(selected: RaceInfo) => this.props.dispatch(selectRace(selected))}
                      selectedGender={this.props.gender}
                      selectGender={(selected: gender) => this.props.dispatch(selectGender(selected))}
                      faction={this.props.factionsState.selected.id} />
        );
        back = (
          <a className='cu-btn left' 
             onClick={() => this.setState({page: this.state.page - 1})}
             disabled={this.state.page == pages.FACTION_SELECT} >Back</a>
        );
        next = (
          <a className='cu-btn right'
             onClick={() => this.setState({page: this.state.page + 1})}
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
                             faction={this.props.factionsState.selected.id} />
        );
        back = (
          <a className='cu-btn left' 
             onClick={() => this.setState({page: this.state.page - 1})}
             disabled={this.state.page == pages.FACTION_SELECT} >Back</a>
        );
        next = (
          <a className='cu-btn right'
             onClick={() => this.setState({page: this.state.page + 1})}
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
}

class Container extends React.Component<ContainerProps, any> {
  render() {
    return (
      <Provider store={store}>
        <ConnectedCharacterCreation apiKey={this.props.apiKey}
                                    apiHost={this.props.apiHost}
                                    apiVersion={this.props.apiVersion}
                                    shard={this.props.shard} />
      </Provider>
    )
  }
}

export default Container;

// import {fetchJSON} from '../utils/fetchHelpers';
// import makeReactiveClass from '../utils/RXComponent';

// const apiUrl = 'https://api.camelotunchained.com/';
// const apiVersion = 1;
// const shard = 1;

// let factions$ = Rx.Observable.fromPromise(fetchJSON(`${apiUrl}gamedata/factions?api-version=${apiVersion}`));
// let archetypes$ = Rx.Observable.fromPromise(fetchJSON(`${apiUrl}gamedata/archetypes?api-version=${apiVersion}`));
// let races$ = Rx.Observable.fromPromise(fetchJSON(`${apiUrl}gamedata/races?api-version=${apiVersion}`));
// let classes$ = Rx.Observable.fromPromise(fetchJSON(`${apiUrl}gamedata/archetypes?api-version=${apiVersion}`));
// let attributes$ = Rx.Observable.fromPromise(fetchJSON(`${apiUrl}gamedata/attributes?api-version=${apiVersion}`));
// let attributeOffsets$ = Rx.Observable.fromPromise(fetchJSON(`${apiUrl}gamedata/attributeoffsets/${shard}?api-version=${apiVersion}`));

// function attributeRemap(a: any) {
//   let o = [] as any;
//   o.push(a.name);
//   o.push(a.baseValue);
//   return o;
// }

// let mappedAttributes$ = attributes$.map((x: any) => x.map(attributeRemap).reduce((acc: any, cur: any) => {
//   if (Object.prototype.toString.call(acc) === '[object Array]') {
//     let name = acc[0];
//     let val = acc[1]
//     acc = {};
//     acc[name] = val;
//   }
//   if (typeof cur !== 'undefined') {
//     let name = cur[0];
//     let val = cur[1];
//     acc[name] = val;
//   }
//   return acc;
// }));


// let attributeAllocations$ = new Rx.BehaviorSubject({});

// let allocatedAttributes$ = attributeAllocations$.scan((acc: any, cur: any) => {
//    if (typeof acc.name !== 'undefined') {
//     let name = acc.name;
//     let val = acc.value
//     acc = {};
//     acc[name] = val;
//   }
//   if (typeof acc[cur.name] === 'undefined' || isNaN(acc[cur.name])) {
//     acc[cur.name] = cur.value;
//   } else {
//     acc[cur.name] += cur.value;
//   }
//   return acc;
// });

// mappedAttributes$.subscribe((x: any) => {
//   for(var key in x) {
//     attributeAllocations$.next({name: key, value: x[key]});
//   }
// });

// let unallocatedPoints$ = Rx.BehaviorSubject(20);


// let attributeAllocationsMap$ = Rx.Observable.flatMap

// class Attributes extends React.Component<any, any> {
//   generateAttributeContent = (attributeInfo: any) => {
//     if (attributeInfo.type !== 1) return null;
//     let allocatedCount = this.props.allocations[attributeInfo.name]
//     return (
//       <div key={attributeInfo.name} className={`cu-character-creation__attributes__attribute--${attributeInfo.name}`}>
//         <span>{attributeInfo.name} </span>
//         <span>{attributeInfo.baseValue + (typeof allocatedCount !== 'number' ? 0 : allocatedCount)}</span>
//         <button onClick={() => this.props.allocator$.next({name: attributeInfo.name, value: 1})} >+</button>
//         <button onClick={() => this.props.allocator$.next({name: attributeInfo.name, value: -1})}>-</button>
//       </div>
//     );
//   }

//   render() {
//     console.log('attributes rendered');
//     if (typeof (this.props.attributes) === 'undefined') {
//       return <div> loading attributes </div>
//     }
//     return (
//       <div className='cu-character-creation__attributes'>
//         <div>
//           <span>Remaining points to allocate</span>
//           <span>{this.props.unallocatedPoints}</span>
//         </div>
//         {this.props.attributes.map(this.generateAttributeContent)}
//       </div>
//     )
//   }
// }

// const RxAttributes = makeReactiveClass(Attributes);

