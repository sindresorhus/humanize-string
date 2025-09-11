import decamelize from 'decamelize';

export default function humanizeString(string, options = {}) {
	if (typeof string !== 'string') {
		throw new TypeError('Expected a string');
	}

	if (!options.preserveCase) {
		string = decamelize(string);
		string = string.toLowerCase();
	}

	string = string.replace(/[_-]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
	string = string.charAt(0).toUpperCase() + string.slice(1);

	return string;
}
