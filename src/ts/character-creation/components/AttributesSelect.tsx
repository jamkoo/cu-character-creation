/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import {race, gender} from 'camelot-unchained';
import {AttributeInfo, attributeType} from '../redux/modules/attributes';
import {AttributeOffsetInfo} from '../redux/modules/attributeOffsets';


export interface AttributesSelectProps {
  attributes: Array<AttributeInfo>;
  attributeOffsets: Array<AttributeOffsetInfo>;
  selectedRace: race;
  selectedGender: gender;
  remainingPoints: number;
  allocatePoint: (name: string, value: number) => void;
}

export interface AttributesSelectState {
}

class AttributesSelect extends React.Component<AttributesSelectProps, AttributesSelectState> {

  private maxAllotments: any;
  private allotments: any;

  constructor(props: AttributesSelectProps) {
    super(props);
    this.allotments = [] as any;
  }

  componentWillMount() {

  }

  componentWillUnmount() {

  }

  generateAttributeContent = (attributeInfo: AttributeInfo, offset: AttributeOffsetInfo) => {
    if (attributeInfo.type !== attributeType.PRIMARY) return null;
    let allocatedCount = 0;//this.props.allocations[attributeInfo.name]
    let offsetValue = offset == null ? 0 : typeof offset.attributeOffsets[attributeInfo.name] === 'undefined' ? 0 : offset.attributeOffsets[attributeInfo.name];
    return (
      <div key={attributeInfo.name} className='attribute-row'>
        <span>{attributeInfo.name} </span>
        <button className='rightarrow right' onClick={() => this.props.allocatePoint(attributeInfo.name, 1)} ></button>
        <span className='attribute-points right'>{attributeInfo.baseValue + attributeInfo.allocatedPoints + offsetValue}</span>
        <button className='leftarrow right' onClick={() => this.props.allocatePoint(attributeInfo.name, -1)}></button>
      </div>
    );
  }

  generateAttributeView = (info: AttributeInfo, value: number) => {
    return (
      <div key={info.name} className='attribute-row row'>
        <div className='col s10'>
        {info.name}
        <div className='attribute-description'>
        {info.description}
        </div>
        </div>
        <div className='col s2 attribute-points'>
          {value}
        </div>
      </div>
    )
  }

  calculateDerivedValue = (info: AttributeInfo, offset: AttributeOffsetInfo) => {
    let primaryInfo = this.props.attributes.find((a: AttributeInfo) => a.name == info.derivedFrom);
    let primaryOffsetValue = offset == null ? 0 : typeof offset.attributeOffsets[primaryInfo.name] === 'undefined' ? 0 : offset.attributeOffsets[primaryInfo.name];
    let primaryValue = primaryInfo.baseValue + primaryInfo.allocatedPoints + primaryOffsetValue;

    //let derived = (info.baseValue * info.)

  }

  render() {
    if (typeof (this.props.attributes) === 'undefined') {
      return <div> loading attributes </div>
    }
    let offset = this.props.attributeOffsets.find((o: AttributeOffsetInfo) => o.gender == this.props.selectedGender && o.race == this.props.selectedRace);
    if (typeof offset === 'undefined') offset = null;

    let primaries = this.props.attributes.filter((a: AttributeInfo) => a.type == attributeType.PRIMARY);
    let secondaries = this.props.attributes.filter((a: AttributeInfo) => a.type == attributeType.SECONDARY);
    let derived = this.props.attributes.filter((a: AttributeInfo) => a.type == attributeType.DERIVED);

    return (
      <div className='page'>
        <video src={`../videos/paper-bg.webm`} poster={`../videos/paper-bg.jpg`} autoPlay loop></video>
        <div className='selection-box'>
          <h6>Distribute attribute points  <span className='points'>(Remaining {this.props.remainingPoints})</span></h6>
          {this.props.attributes.map((a: AttributeInfo) => this.generateAttributeContent(a, offset))}
        </div>
        <div className='view-content row attributes-view'>
          <div className='col s6'>
            <h4>Primary</h4>
            {primaries.map((a: AttributeInfo) => this.generateAttributeView(a, a.baseValue))}
            <div className='row'>
              <h4>Secondary</h4>
              {secondaries.map((a: AttributeInfo) => this.generateAttributeView(a, a.baseValue))}
            </div>
          </div>
          <div className='col s6'>
            <h4>Derived</h4>
            {derived.map((a: AttributeInfo) => this.generateAttributeView(a, a.baseValue))}
          </div>
        </div>
      </div>
    )
  }
}

export default AttributesSelect;
