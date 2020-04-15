module.exports = {
	BODYPARSER_JSON_LIMIT: process.env.BODYPARSER_JSON_LIMIT || '20mb',
	DATABASE_AUDIT: 'true',
	DOCUMENT_BASE_DIR: process.env.DOCUMENT_BASE_DIR || 'https://s3.hidrive.strato.com/schul-cloud-hpi/',
	MAXIMUM_ALLOWABLE_TOTAL_ATTACHMENTS_SIZE_BYTE: (5 * 1024 * 1024), // 5MB
	REQUEST_TIMEOUT: 8000,
	METRICS_PATH: process.env.METRICS_PATH || '/metrics',
	MONGOOSE_CONNECTION_POOL_SIZE: parseInt(process.env.MONGOOSE_CONNECTION_POOL_SIZE || '10', 10),
	STUDENT_TEAM_CREATE_DISABLED: process.env.STUDENT_TEAM_CREATE_DISABLED,
	SC_THEME: process.env.SC_THEME || 'default',
	SMTP_SENDER: process.env.SMTP_SENDER || 'noreply@schul-cloud.org',
};
