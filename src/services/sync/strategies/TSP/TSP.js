const rp = require('request-promise-native');
const url = require('url');
const moment = require('moment');
const { JWE, JWK, JWS } = require('jose');
const uuid = require('uuid/v4');

const ENTITY_SOURCE = 'tsp'; // used as source attribute in created users and classes
const SOURCE_ID_ATTRIBUTE = 'tspUid'; // name of the uid attribute within sourceOptions

const TSP_ENCRYPTION_KEY = process.env.TSP_ENCRYPTION_KEY || '';
const TSP_SIGNATURE_KEY = process.env.TSP_SIGNATURE_KEY || '';
const TSP_API_CLIENT_SECRET = process.env.TSP_API_CLIENT_SECRET || '';
const TSP_TOKEN_ISS = process.env.SC_DOMAIN || 'https://schulcloud-thueringen.de';
const TSP_TOKEN_SUB = process.env.HOST || 'schulcloud-thueringen.de';

const TSP_ENCRYPTION_OPTIONS = { alg: 'dir', enc: 'A128CBC-HS256' };
const TSP_SIGNATURE_OPTIONS = { alg: 'HS512' };

/**
 * Converts a string to a jose-compatible base64url string
 * @param {String} string a string
 * @returns {String} the converted string
 */
const toBase64Url = (string) => Buffer.from(string, 'utf-8')
	.toString('base64')
	.replace(/=/g, '')
	.replace(/\+/g, '-')
	.replace(/\//g, '_');

/**
 * Generates a username for a given user-like object
 * @param {User|TSP-User} user Schul-Cloud user or TSP user object
 * @throws {Error} if user is not a valid user object
 */
const getUsername = (user) => {
	let username = '';
	if (user.sourceOptions) {
		// user is a Schul-Cloud user or behaves like it
		username = `${ENTITY_SOURCE}/${user.sourceOptions[SOURCE_ID_ATTRIBUTE]}`;
	} else if (user.authUID) {
		// user is a TSP user (e.g. during authentication)
		username = `${ENTITY_SOURCE}/${user.authUID}`;
	} else {
		throw new Error('Invalid user object.', user);
	}
	return username.toLowerCase();
};

/**
 * Generate an email address for a given user-like object
 * @param {User|TSP-User} user Schul-Cloud user or TSP user object
 */
const getEmail = (user) => `${getUsername(user)}@schul-cloud.org`;

const getEncryptionKey = () => JWK.asKey({
	kty: 'oct', k: TSP_ENCRYPTION_KEY, alg: TSP_ENCRYPTION_OPTIONS.alg, use: 'enc',
});
const encryptToken = (payload) => JWE.encrypt(payload, getEncryptionKey, TSP_ENCRYPTION_OPTIONS);
const decryptToken = (payload) => JWE.decrypt(payload, getEncryptionKey, TSP_ENCRYPTION_OPTIONS);

const getSignKey = () => JWK.asKey({
	kty: 'oct', k: toBase64Url(TSP_SIGNATURE_KEY), alg: TSP_SIGNATURE_OPTIONS.alg, use: 'sig',
});
const signToken = (token) => JWS.sign(token, getSignKey(), TSP_SIGNATURE_OPTIONS);
const verifyToken = (token) => JWS.verify(token, getSignKey(), TSP_SIGNATURE_OPTIONS);

/**
 * TSP API wrapper
 * @class TspApi
 */
class TspApi {
	constructor({ baseUrl, clientId }) {
		this.baseUrl = baseUrl;
		this.clientId = clientId;
	}

	getJwt() {
		const issueDate = Math.floor(Date.now() / 1000);
		const payload = JSON.stringify({
			apiClientSecret: TSP_API_CLIENT_SECRET,
			iss: TSP_TOKEN_ISS,
			aud: this.baseUrl,
			sub: TSP_TOKEN_SUB,
			exp: issueDate + 300000,
			iat: issueDate,
			jti: uuid(),
		});

		const jwt = signToken(encryptToken(payload));
		return jwt;
	}

	getHeaders() {
		return {
			Authorization: `AUTH-JWT apiClientId=${this.clientId},jwt=${this.getJwt()}`,
		};
	}

	async request(path, lastChange = new Date(0)) {
		const lastChangeDate = moment(lastChange).format('YYYY-MM-DD HH:mm:ss.SSS');

		const requestUrl = url.resolve(this.baseUrl, path);
		const response = await rp(requestUrl, {
			headers: this.getHeaders(),
			qs: {
				dtLetzteAenderung: lastChangeDate,
			},
		});
		return JSON.parse(response);
	}
}

module.exports = {
	ENTITY_SOURCE,
	SOURCE_ID_ATTRIBUTE,
	TspApi,
	getUsername,
	getEmail,
	encryptToken,
	decryptToken,
	signToken,
	verifyToken,
};
