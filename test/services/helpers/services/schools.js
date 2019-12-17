const School = require('../../../../src/services/school/model').schoolModel;

let createdSchoolIds = [];

const create = (app) => async ({
	name = `HPI-Testschule-${new Date().getTime()}`,
	address = {},
	fileStorageType,
	systems = [],
	federalState,
	ldapSchoolIdentifier,
	createdAt = Date.now(),
	updatedAt = Date.now(),
	experimental = false,
	pilot = false,
	currentYear,
	schoolGroupId,
	documentBaseDirType,
	// eslint-disable-next-line camelcase
	logo_dataUrl,
	purpose = 'test',
	rssFeeds = [],
	features = [],
	customYears = [],
	inMaintenanceSince = undefined,
} = {}) => {
	const school = await School.create({
		name,
		address,
		fileStorageType,
		systems,
		federalState,
		ldapSchoolIdentifier,
		documentBaseDirType,
		createdAt,
		schoolGroupId,
		customYears,
		updatedAt,
		experimental,
		pilot,
		currentYear,
		// eslint-disable-next-line camelcase
		logo_dataUrl,
		purpose,
		rssFeeds,
		features,
		inMaintenanceSince,
	});
	createdSchoolIds.push(school._id);
	return school;
};

const cleanup = async () => {
	await School.deleteMany({ _id: { $in: createdSchoolIds } });
	createdSchoolIds = [];
};

module.exports = (app) => ({
	create: create(app),
	cleanup,
	info: createdSchoolIds,
});
