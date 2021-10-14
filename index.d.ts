/**
Convert a camelized/dasherized/underscored string into a humanized one: `fooBar-Baz_Faz` → `Foo bar baz faz`.

@param text - The string to make human readable.

@example
```
import humanizeString from 'humanize-string';

humanizeString('fooBar');
//=> 'Foo bar'

humanizeString('foo-bar');
//=> 'Foo bar'

humanizeString('foo_bar');
//=> 'Foo bar'
```
*/
export default function humanizeString(text: string): string;
