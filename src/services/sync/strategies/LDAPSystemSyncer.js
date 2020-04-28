const Syncer = require('./Syncer');
const LDAPSyncer = require('./LDAPSyncer');

/**
 * Implements syncing from multiple LDAP servers based on the Syncer interface
 * @class LDAPSystemSyncer
 * @implements {Syncer}
 */
class LDAPSystemSyncer extends Syncer {
	constructor(app, stats, logger) {
		super(app, stats, logger);
		Object.assign(this.stats, {
			systems: {},
		});
	}

	/**
     * @see {Syncer#respondsTo}
     */
	static respondsTo(target) {
		return target === 'ldap';
	}

	static params(params, data) {
		return [true];
	}

	/**
     * @see {Syncer#steps}
     */
	async steps() {
		await super.steps();
		const systems = await this.getSystems();
		const jobs = systems.map(async (system) => {
			this.stats.systems[system.alias] = {};
			await new LDAPSyncer(this.app, this.stats.systems[system.alias], this.logger, system).sync();
			await this.app.service('ldap').disconnect(system.ldapConfig);
		});
		return Promise.all(jobs);
	}

	getSystems() {
		return this.app.service('systems').find({ query: { type: 'ldap', 'ldapConfig.active': true }, paginate: false })
			.then((systems) => {
				this.logInfo(`Found ${systems.length} LDAP configurations.`);
				return systems;
			});
	}
}

module.exports = LDAPSystemSyncer;
