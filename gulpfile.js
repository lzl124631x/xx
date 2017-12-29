var gulp = require("gulp");
var ts = require("gulp-typescript");

gulp.task("default", function () {
    var tsResult = gulp.src("ts/**/*.ts")
        .pipe(ts({
            sourceMap: false
        }));
    return tsResult.js.pipe(gulp.dest("js"));
});

gulp.task("watch", function () {
    gulp.watch("ts/**/*.ts", ["default"]);
});