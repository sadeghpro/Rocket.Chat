import { Mongo } from 'meteor/mongo';

import { API } from '../api';

const versionCollection = new Mongo.Collection('appVersion');

API.v1.addRoute('checkAppUpdate', { authRequired: false }, {
	post() {
		if (this.bodyParams.version) {
			const response = {
				update: false,
			};
			const query = {
				force: true,
				buildNumber: {
					$gt: this.bodyParams.version,
				},
			};
			const options = {
				sort: { date: -1 },
				limit: 1,
			};
			let versions = versionCollection.find(query, options).fetch();
			response.force = !!versions.length;
			delete query.force;
			versions = versionCollection.find(query, options).fetch();
			if (versions.length) {
				response.update = true;
				delete versions[0]._id;
				delete versions[0].force;
				response.details = versions[0];
			}
			return API.v1.success(response);
		}
		return API.v1.failure("Parameter 'version' is required");
	},
});
