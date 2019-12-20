const roles = { MODERATOR: 'moderator', ATTENDEE: 'attendee' };
exports.ROLES = roles;

const returnCodes = { SUCCESS: 'SUCCESS', FAILED: 'FAILED' };
exports.RETURN_CODES = returnCodes;

const messageKeys = { NOT_FOUND: 'notFound' };
exports.MESSAGE_KEYS = messageKeys;

const permissions = { CREATE_MEETING: 'CREATE_MEETING', JOIN_MEETING: 'JOIN_MEETING' };
exports.PERMISSIONS = permissions;

const guestPolicies = {
	ALWAYS_ACCEPT: 'ALWAYS_ACCEPT',
	ALWAYS_DENY: 'ALWAYS_DENY',
	ASK_MODERATOR: 'ASK_MODERATOR',
};
exports.GUEST_POLICIES = guestPolicies;