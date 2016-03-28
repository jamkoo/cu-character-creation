/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';

import {AttributeInfo} from '../redux/modules/attributes';

export interface AttributesSelectProps {
  attributes: Array<AttributeInfo>;
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

  generateAttributeContent = (attributeInfo: AttributeInfo) => {
    if (attributeInfo.type !== 1) return null;
    let allocatedCount = 0;//this.props.allocations[attributeInfo.name]
    return (
      <div key={attributeInfo.name} className={`cu-character-creation__attributes__attribute-select--${attributeInfo.name}`}>
        <span>{attributeInfo.name} </span>
        <button onClick={() => this.props.allocatePoint(attributeInfo.name, -1)}>-</button>
        <span>{attributeInfo.baseValue + attributeInfo.allocatedPoints}</span>
        <button onClick={() => this.props.allocatePoint(attributeInfo.name, 1)} >+</button>
      </div>
    );
  }

  render() {
    if (typeof (this.props.attributes) === 'undefined') {
      return <div> loading attributes </div>
    }
    return (
      <div className='cu-character-creation__attribute-select'>
        <div className='cu-character-creation__attribute-select__selection-area'>
          <h6>Distribute attribute points  (Remaining {this.props.remainingPoints})</h6>
          {this.props.attributes.map(this.generateAttributeContent)}
        </div>
        <div>
        </div>
      </div>
    )
  }
}

export default AttributesSelect;
