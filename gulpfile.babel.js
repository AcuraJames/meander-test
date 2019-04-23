import gulp from 'gulp'
import sass from 'gulp-sass'
import rev from 'gulp-rev'
import revReplace from 'gulp-rev-replace'
import autoprefixer from 'gulp-autoprefixer'
import del from 'del'
import {argv} from 'yargs'
import _if from 'gulp-if' 
import cssnano from 'gulp-cssnano'
import {create as bsCreate} from 'browser-sync'

const browserSync = bsCreate()

const prod = argv.env === 'production'

gulp.task('clean', () => {
    return del(['manifest', 'public/styles'])
})

gulp.task('styles', () => {
    return gulp.src('src/styles/main.scss')
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(_if(prod, cssnano()))
        .pipe(_if(prod, rev()))
        .pipe(gulp.dest('public/styles'))
        .pipe(_if(prod, rev.manifest('css.json')))
        .pipe(gulp.dest('manifest'))
})

gulp.task('index', () => {
    return gulp.src('src/index.html')
        .pipe(_if(prod, revReplace({
            manifest: gulp.src('manifest/css.json', {allowEmpty: true})
        })))
        .pipe(gulp.dest('public'))
})

// gulp.task('js', () => {
//     return gulp.src('src/js/**/*.js')
//         .pipe(_if(prod, babel({
//             presets: ['@babel/env']
//         })))
//         .pipe(_if(prod, uglify()))
//         .pipe(gulp.dest('public/js'))
// })

gulp.task('fonts', () => {
    return gulp.src('src/styles/fonts/*.*')
        .pipe(gulp.dest('public/fonts'))
})

gulp.task('img', () => {
    return gulp.src('src/img/**/*.*')
        // .pipe(_if(prod, imagemin([
        //     imagemin.jpegtran({progressive: true}),
        //     imagemin.optipng({optimizationLevel: 5})
        // ])))
        .pipe(gulp.dest('public/img'))
})

gulp.task('build', gulp.series('styles', 'index', 'fonts', 'img'))

gulp.task('watch', () => {
    gulp.watch('src/styles/**/*.scss', gulp.series('styles'))
    gulp.watch('src/index.html', gulp.series('index'))
    gulp.watch('src/index.html', gulp.series('fonts'))
    gulp.watch('src/index.html', gulp.series('img'))
})

gulp.task('serve', () => {
    browserSync.init({
        server: 'public'
    })
    browserSync.watch('public/**/*.*').on('change', browserSync.reload)
})

gulp.task('dev', gulp.series('clean', 'build', gulp.parallel('watch', 'serve')))

