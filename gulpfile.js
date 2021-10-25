const { src, dest, series, watch } = require('gulp');
const del = require('del')
const njk = require('gulp-nunjucks-render')
const beautify = require('gulp-beautify')

const configuration = {
    paths: {
        src: {
            html: 'src/html',
            css: 'src/css',
            js: 'src/js'
        },
        assets: 'assets',
        dist: 'dist'
    }
};

function clean() {
    return del([configuration.paths.dist])
}

function html() {
    return src(configuration.paths.src.html + '/pages/*.+(html|njk)')
        .pipe(
            njk({
                path: [configuration.paths.src.html],
            })
        )
        .pipe(beautify.html({ indent_size: 4, preserve_newlines: false }))
        .pipe(dest(configuration.paths.dist))
}

function css() {
    return src(configuration.paths.src.css + '/**')
        .pipe(dest(configuration.paths.dist + '/css'))
}

function js() {
    return src(configuration.paths.src.js + '/**')
        .pipe(dest(configuration.paths.dist + '/js'))
}

function assets() {
    return src(configuration.paths.assets + '/**')
        .pipe(dest(configuration.paths.dist + '/img'))
}

function watchFiles() {
    watch('src/**/*', series(html, css, js))
}

exports.build = series(clean, html, css, js, assets)
exports.default = series(clean, html, css, js, assets, watchFiles)
