/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';

import {race, faction, gender} from 'camelot-unchained';

import {RaceInfo} from '../redux/modules/races';
import {FactionInfo} from '../redux/modules/factions';

const raceText: any = {
  'STRM': 'The scaly St’rm are one of the most enigmatic races in all the Realms. Their origins are clouded in rumor and mystery, and the St’rm are only too happy to keep it that way. It is known that the St’rm have a matriarchal society, and their most famous warriors are female–perhaps partly because of unusual differences between the sexes. The St’rm are elegant and graceful, and very proud of the power that lies in their rhythmic movements. They form strong alliances and friendships, for the St’rm are also famous for honoring other races. To the St’rm, to battle is to dance, and their graceful steps are a form of magic themselves.',


}

export interface RaceSelectProps {
  selectedFaction: FactionInfo;
  races: Array<RaceInfo>;
  selectedRace: RaceInfo;
  selectRace: (race: RaceInfo) => void;
  selectedGender: gender;
  selectGender: (selected: gender) => void;
}

export interface RaceSelectState {
}

class RaceSelect extends React.Component<RaceSelectProps, RaceSelectState> {

  constructor(props: RaceSelectProps) {
    super(props);
  }

  selectRace = (race: RaceInfo) => {
    this.props.selectRace(race);
  }

  generateRaceContent = (info: RaceInfo) => {
    return (
      <a key={info.id}
         className={`cu-character-creation__race-select__${race[info.id]}__thumbnail ${this.props.selectedRace !== null ? this.props.selectedRace.id == info.id ? 'active' : '' : ''}`}
         onClick={this.selectRace.bind(this, info)}></a>
    );
  }

  render() {
    if (!this.props.races) return <div>loading races</div>;

    let view: any = null;
    let text: any = null;
    let name: any = null;
    if (this.props.selectedRace) {
      name = <h2 className={`cu-character-creation__race-select_name`}>{this.props.selectedRace.name}</h2>
      view = <div className={`cu-character-creation__race-select__view-area__${race[this.props.selectedRace.id]}`}></div>
      text = <div className='cu-character-creation__race-select__text'>{raceText[race[this.props.selectedRace.id]]}</div>
    }

    return (
      <div className='cu-character-creation__race-select'>
          {name}
        <video src={`../videos/${this.props.selectedFaction.shortName}.webm`} poster={`../videos/${this.props.selectedFaction.shortName}-bg.jpg`} autoPlay loop></video>
        <div className='cu-character-creation__race-select__selection-area'>
          <h6>Choose your race</h6>
          {this.props.races.filter((r: any) => r.faction === this.props.selectedFaction.id).map(this.generateRaceContent)}
          <h6>Choose your gender</h6>
          <a className={`gender-btn ${this.props.selectedGender == gender.MALE ? 'selected' : ''}`}
             onClick={() => this.props.selectGender(gender.MALE)}>Male</a>
          <a className={`gender-btn ${this.props.selectedGender == gender.FEMALE ? 'selected' : ''}`}
             onClick={() => this.props.selectGender(gender.FEMALE)}>Female</a>
          {text}
        </div>
        <div className='cu-character-creation__race-select__view-area'>
          {view}
        </div>
      </div>
    )
  }
}

export default RaceSelect;
