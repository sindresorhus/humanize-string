import decamelize from 'decamelize';

export default function humanizeString(string) {
	if (typeof string !== 'string') {
		throw new TypeError('Expected a string');
	}

	string = decamelize(string);
	string = string.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
	string = string.charAt(0).toUpperCase() + string.slice(1);

	return string;
}
