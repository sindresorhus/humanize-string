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

## API

### humanizeString(input, options?)

#### input

Type: `string`

The string to humanize.

#### options

Type: `object`

##### preserveCase

Type: `boolean`\
Default: `false`

Preserve the original case instead of lowercasing.

```js
import humanizeString from 'humanize-string';

humanizeString('The-NetApp-Guide-to-Kubernetes');
//=> 'The net app guide to kubernetes'

humanizeString('The-NetApp-Guide-to-Kubernetes', {preserveCase: true});
//=> 'The NetApp Guide to Kubernetes'
```

## Related

- [camelcase](https://github.com/sindresorhus/camelcase) - Convert a dash/dot/underscore/space separated string to camelcase
