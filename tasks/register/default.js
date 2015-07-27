module.exports = function (grunt) {
	grunt.registerTask('default', ['bower_concat', 'compileAssets', 'linkAssets', 'watch']);
};