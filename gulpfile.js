var gulp = require('gulp'),
    concat = require('gulp-concat'),
    flatten = require('gulp-flatten'),
    runSequence = require('run-sequence'),
    minify = require('gulp-minify'),
    insert = require('gulp-insert'),
    clean = require('gulp-clean'),
    locale = 'sv';


gulp.task('default', function(done) {
    runSequence('globalize', 'pack', 'cleanup', function() {
        done();
    });
});

gulp.task("globalize", function() {

    var jsonWeNeed = [
        require('./bower_components/cldr-data/supplemental/likelySubtags.json'),
        require('./bower_components/cldr-data/supplemental/likelySubtags.json'),
        require('./bower_components/cldr-data/main/' + locale + '/ca-gregorian.json'),
        require('./bower_components/cldr-data/main/' + locale + '/timeZoneNames.json'),
        require('./bower_components/cldr-data/supplemental/timeData.json'),
        require('./bower_components/cldr-data/supplemental/weekData.json'),
        require('./bower_components/cldr-data/main/' + locale + '/numbers.json'),
        require('./bower_components/cldr-data/supplemental/numberingSystems.json')
    ];

    var jsonStringWithLoad = 'Globalize.load(' +
        jsonWeNeed.map(function(json) { return JSON.stringify(json); }).join(', ') +
        ');';

    var fs = require('fs');
    fs.writeFile('globalize.culture.' + locale + '.js', jsonStringWithLoad, function(err) {
        if (err) {
            console.log(err);
        }
    });

});

gulp.task('pack', function() {
    gulp.src(['bower_components/cldrjs/dist/cldr.js',
        'bower_components/cldrjs/dist/cldr/event.js',
        'bower_components/cldrjs/dist/cldr/supplemental.js',
        'bower_components/globalize/dist/globalize.js',
        'bower_components/globalize/dist/globalize/number.js',
        'bower_components/globalize/dist/globalize/date.js',
        'bower_components/jquery-validation/dist/jquery.validate.js',
        'bower_components/jquery-validation-unobtrusive/jquery.validate.unobtrusive.js',
        'bower_components/jquery-validation-globalize/jquery.validate.globalize.js',
        'bower_components/moment/min/moment-with-locales.min.js',
        'globalize.culture.' + locale + '.js'
    ])

    .pipe(concat('globalize.js'))
        .pipe(insert.append('\n Globalize.locale("' + locale + '"); moment.locale("' + locale + '"); $.validator.addMethod("date", function(value, element) {return this.optional(element) || moment(value, "' + locale + '").isValid();});'))
        .pipe(minify({
            min: 'min.js'
        }))
        .pipe(flatten())
        .pipe(gulp.dest('test/Scripts/External/globalize'));
});

gulp.task('cleanup', function() {
    gulp.src('globalize.culture.' + locale + '.js')
        .pipe(clean());
});