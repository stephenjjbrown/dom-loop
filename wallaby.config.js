/* globals module */
module.exports = function () {
	return {
		autoDetect: true,
		
		files: [
			'lib/**/*.js'
		],
	
		tests: [
			'test/**/*test.js'
		],

		env: {type: 'node'}
	};
};