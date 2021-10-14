# humanize-string

> Convert a camelized/dasherized/underscored string into a humanized one
> Example: `fooBar-Baz_Faz` → `Foo bar baz faz`

## Install

```sh
npm install humanize-string
```

## Usage

```js
import humanizeString from 'humanize-string';

humanizeString('fooBar');
//=> 'Foo bar'

humanizeString('foo-bar');
//=> 'Foo bar'

humanizeString('foo_bar');
//=> 'Foo bar'
```

## Related

- [camelcase](https://github.com/sindresorhus/camelcase) - Convert a dash/dot/underscore/space separated string to camelcase
