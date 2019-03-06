import {expectType} from 'tsd-check';
import humanizeString from '.';

expectType<string>(humanizeString('fooBar'));
