import {expectType} from 'tsd';
import humanizeString = require('.');

expectType<string>(humanizeString('fooBar'));
