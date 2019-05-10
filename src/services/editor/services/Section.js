const { request } = require('../helper/');

const uri = 'sections';

class Section {
	constructor(options) {
		this.options = options || {};
		// this.docs = {};
	}

	/**
	 * @param {object} lesson It create one new template. The owner is take from the lesson.
	 */
	create({ lesson, position }, params) {
		return request(uri, params, {
			data: { lesson, position },
		});
	}

	get(sectionId, params) {
		return request(uri, params);
	}

	remove(sectionId, params) {
		return request(uri, params);
	}

	// title as docValue ? wenn nicht dann als db model, würde das data handling für find erleichtern
	patch(sectionId, {
		state,
		title,
		note,
		visible,
	}, params) {
		return request(uri, params, {
			data: {
				state,
				title,
				note,
				visible,
			},
		});
	}

	setup(app) {
		this.app = app;
	}
}

module.exports = Section;