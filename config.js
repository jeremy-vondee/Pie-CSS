const path = require( 'path' )

const paths = {
	DIST: path.resolve( './dist' ),
	SRC: path.resolve( './src' ),
	GLOBAL_VARS: path.resolve( './src/_global' )
}

const folders = {
	DIST: 'dist',
	SRC: 'src',
	GLOBAL_VARS: '_global'
}

module.exports = { paths, folders }
