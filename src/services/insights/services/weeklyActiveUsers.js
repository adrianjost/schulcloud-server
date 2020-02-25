const request = require('request-promise-native');
const hooks = require('../hooks');
const { userModel } = require('../../user/model');
const roleModel = require('../../role/model');

const cubeJsUrl = process.env.INSIGHTS_CUBEJS || 'http://localhost:4000/cubejs-api/';

const roleIdsMapping = {
	teacher: null,
	student: null,
};

// returns the mongodb _id for roles. eg 'student' or 'teacher'
const getRoleIdForName = async (roleName) => {
	if (roleIdsMapping[roleName] === null) {
		roleIdsMapping[roleName] = await roleModel.findOne({ name: roleName }).select('_id');
	}
	return roleIdsMapping[roleName];
};

// returns a count of users that matches the role _id
const getCountFromDb = async (roleId) => {
	const userCount = await userModel.countDocuments({
		roles: {
			$in: [roleId],
		},
	});
	return userCount;
};

/**
 * loops through the cubejs-response and returns an object:
 * @param cubeJsData {JSON}
 * @param totalUsers {JSON}
 * @returns data - object stripped for unnecessary data and prettified
 */
const dataMassager = (cubeJsData, totalUsers) => {
	const parsed = JSON.parse(cubeJsData);

	const [teacherUsers, studentUsers] = totalUsers;
	// grabbing the active users from cubejs or null
	const activeStudents = parsed.data[0]
		? parsed.data[0]['Events.activeUsers']
		: null;
	const activeTeachers = parsed.data[1]
		? parsed.data[1]['Events.activeUsers']
		: null;

	// converting to percentage or NaN.
	// two decimals
	const activeStudentPercentage = (
		(Number(activeStudents) / studentUsers)
		* 100
	).toFixed(2);
	const activeTeacherPercentage = (
		(Number(activeTeachers) / teacherUsers)
		* 100
	).toFixed(2);

	const data = {
		teacherUsers,
		studentUsers,
		activeStudents,
		activeTeachers,
		activeStudentPercentage,
		activeTeacherPercentage,
	};
	return data;
};

const generateUrl = (schoolId) => {
	const query = `v1/load?query={
        "measures": [
          "Events.activeUsers"
        ],
        "timeDimensions": [
          {
            "dimension": "Events.timeStamp",
            "dateRange": "Last 7 days"
          }
        ],
        "filters": [
          {
            "dimension" : "Actor.school_id",
            "operator": "contains",
            "values": ["${schoolId}"]
          }
        ],
        "dimensions": [
          "Actor.roles"
        ],
        "segments": [
          "Actor.lehrerSchueler"
        ]
      }`;

	return `${cubeJsUrl}${query}`;
};

class WeeklyActiveUsers {
	async find(data, params) {
		const { schoolId } = data.account;

		await getRoleIdForName('teacher');
		await getRoleIdForName('student');


		const options = {
			url: generateUrl(schoolId),
			method: 'GET',
		};
		const totalUsers = [
			await getCountFromDb(roleIdsMapping.teacher),
			await getCountFromDb(roleIdsMapping.student)];
		const cubeJsData = await request(options);
		const result = dataMassager(cubeJsData, totalUsers);
		return result;
	}
};

module.exports = (app) => {
	const insightRoute = '/insights/weeklyActiveUsers';
	app.use(insightRoute, new WeeklyActiveUsers());
	const insightsService = app.service('/insights/weeklyActiveUsers');
	insightsService.hooks(hooks);
};
