/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
var Rx = require('rxjs/Rx');

export function pickProps(props: any, validator: any) {
  const picked = {} as any;
  Object.keys(props).forEach(key => {
    const value = props[key];
    if (validator(key, value)) {
      picked[key] = value;
    }
  });
  return picked;
}

export function isRxObservable(o:any) {
  return typeof o === 'object' && typeof o.subscribe === 'function';
}

export default function makeReactiveClass(component: any) {
  class RXComponent extends React.Component<any, any> {
    private rxProps: any;
    constructor(props: any) {
      super(props);
      this.rxProps = null;
      this.state = pickProps(props, (key: any, val: any) => !isRxObservable(val));
      this.state.mount = true;
    }
    
    componentWillMount() {
      this.subscribeRxProps(this.props.subscribeTo);
    }
    
    componentWillUnmount() {
      this.unsubscribeRxProps();
    }
    
    componentWillReceiveProps(nextProps: any) {
      this.subscribeRxProps(nextProps.subscribeTo);
    }
    
    private subscribeRxProps = (props: any) => {
      if (!props) return;
      if (this.rxProps) this.unsubscribeRxProps();
      this.rxProps = [];
      Object.keys(props).forEach(key => {
        const val = props[key];
        if (!isRxObservable(val)) return;
        this.rxProps.push(this.addRxPropListener(key, val));
      });
    }
    
    private unsubscribeRxProps = () => {
      if (!this.rxProps) return;
      this.rxProps.forEach((p: any) => p.unsubscribe());
      this.rxProps = null;
    }
    
    private addRxPropListener = (name: any, prop$: any) => {
      return prop$.subscribe((v: any) => {
          const prop = {} as any;
          prop[name] = v;
          this.setState(prop);
      });
    }
    
    render() {
      if (!this.state.mount) return null;
      const subProps = pickProps(this.state, (key: string) => key !== 'mount');
      // TODO: filter subscribeTo?
      const finalProps = Object.assign({}, this.props, subProps);
      return React.createElement(component, finalProps);
    }
  }
  return RXComponent;
}

