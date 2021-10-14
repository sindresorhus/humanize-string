import {expectType} from 'tsd';
import humanizeString from './index.js';

expectType<string>(humanizeString('fooBar'));
