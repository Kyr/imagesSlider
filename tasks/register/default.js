module.exports = function (grunt) {
	grunt.registerTask('default', ['compileAssets', 'linkAssets', 'bower_concat', 'watch']);
};
