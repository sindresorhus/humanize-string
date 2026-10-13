import decamelize from 'decamelize';

export default function humanizeString(string, options = {}) {
	if (typeof string !== 'string') {
		throw new TypeError('Expected a string');
	}

	if (!options.preserveCase) {
		string = decamelize(string);
		string = string.toLowerCase();
	}

	string = string.replaceAll(/[\s\-_]+/gv, ' ').trim();

	// Destructuring iterates code points, where `charAt()` would split a surrogate pair and leave the first letter unuppercased.
	const [firstCharacter = '', ...rest] = string;

	return firstCharacter.toUpperCase() + rest.join('');
}
