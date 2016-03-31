/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import CharacterCreation from './character-creation/CharacterCreation';

const host = 'https://api.camelotunchained.com/';
//const host = 'http://localhost:1337/';
const version = 1;
const apiKey = 'NPcL6l5mmh6R0plqdDU911';
const shard = 1;

ReactDOM.render(<CharacterCreation apiHost={host}
                                   apiVersion={version}
                                   apiKey={apiKey}
                                   shard={shard}
                                   created={() => alert('created!')} />,
                document.getElementById('cu-character-creation')
);
