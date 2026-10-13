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

	// The `v` flag makes `.` match a whole code point, where `charAt()` would split a surrogate pair and leave the first letter unuppercased. Spreading the string into an array of characters instead would use several times more memory than the string itself.
	return string.replace(/^./sv, character => character.toUpperCase());
}
