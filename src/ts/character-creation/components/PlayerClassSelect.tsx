/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';

import {archetype, faction} from 'camelot-unchained';
import {PlayerClassInfo} from '../redux/modules/playerClasses';
import {FactionInfo} from '../redux/modules/factions';
import Animate from '../utils/Animate';

const classText: any = {
  'BLACKKNIGHT': 'foo things and stuff',
}

export interface PlayerClassSelectProps {
  classes: Array<PlayerClassInfo>;
  selectedClass: PlayerClassInfo;
  selectClass: (playerClass: PlayerClassInfo) => void;
  selectedFaction: FactionInfo;
}

export interface PlayerClassSelectState {
}

class PlayerClassSelect extends React.Component<PlayerClassSelectProps, PlayerClassSelectState> {

  constructor(props: PlayerClassSelectProps) {
    super(props);
  }

  selectClass = (info: PlayerClassInfo) => {
    this.props.selectClass(info);
  }

  generateClassContent = (info: PlayerClassInfo) => {
    return (
      <a key={info.id}
              className={`thumb__${archetype[info.id]} ${this.props.selectedClass !== null ? this.props.selectedClass.id == info.id ? 'active' : '' : ''}`}
              onClick={this.selectClass.bind(this, info)}></a>
    );
  }

  render() {
    if (!this.props.classes) return <div> loading classes</div>;

    let videoTitle = this.props.selectedFaction.shortName;
    let view: any = null;
    let text: any = null;
    let name: any = null;
    if (this.props.selectedClass) {
      name = <h2 className='display-name'>{this.props.selectedClass.name}</h2>
      view = <div className={`standing__${archetype[this.props.selectedClass.id]}`}></div>
      text = <div className='selection-description'>{this.props.selectedClass.description}</div>
      switch(this.props.selectedClass.id)
      {
        case archetype.WINTERSSHADOW: videoTitle = 'archer'; break;
        case archetype.FORESTSTALKER: videoTitle = 'archer'; break;
        case archetype.BLACKGUARD: videoTitle = 'archer'; break;
        case archetype.BLACKKNIGHT: videoTitle = 'heavy'; break;
        case archetype.FIANNA: videoTitle = 'heavy'; break;
        case archetype.MJOLNIR: videoTitle = 'heavy'; break;
        case archetype.PHYSICIAN: videoTitle = 'healers'; break;
        case archetype.EMPATH: videoTitle = 'healers'; break;
        case archetype.STONEHEALER: videoTitle = 'healers'; break;
      }
    }




    return (
      <div className='page'>
        <video src={`../videos/${videoTitle}.webm`} poster={`../videos/${videoTitle}.jpg`} autoPlay loop></video>
          {name}
        <div className='selection-box'>
          <h6>Choose your class</h6>
          {this.props.classes.filter((c:any) => c.faction === this.props.selectedFaction.id || c.faction == faction.FACTIONLESS).map(this.generateClassContent)}
          {text}
        </div>
        <div className='view-content'>
          <Animate className='animate' animationEnter='fadeIn' animationLeave='fadeOut'
          durationEnter={400} durationLeave={500}>
          {view}
        </Animate>
        </div>
      </div>
    )
  }
}

export default PlayerClassSelect;
