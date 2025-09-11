import {expectType} from 'tsd';
import humanizeString from './index.js';

expectType<string>(humanizeString('fooBar'));
expectType<string>(humanizeString('fooBar', {}));
expectType<string>(humanizeString('fooBar', {preserveCase: true}));
expectType<string>(humanizeString('fooBar', {preserveCase: false}));
