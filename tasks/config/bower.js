module.exports = function (grunt) {
	grunt.config.set('bower_concat', {
		all: {
			dest: '.tmp/public/js/vendor.js',
			cssDest: '.tmp/public/styles/vendor.css'
		}
	});
	grunt.loadNpmTasks('grunt-bower-concat');
};
