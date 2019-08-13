module.exports = function(grunt) {
    grunt.initConfig(
        {
            copy: {
                main:{
                    src: 'node_modules/jquery/dist/jquery.js',
                    dest: 'dist/jquery.js',
                }    
            },
        }
    );
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', ['copy'])
};
