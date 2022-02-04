const fs = require( 'fs' )
const path = require( 'path' )

const buildEvents = {
	READY: 'ready',
	ADD: 'add',
	CHANGE: 'change',
	UNLINK: 'unlink'
}

const buildPathDenoter = 'PATHS:'

const buildPaths = {
	ALL_FILES: `${buildPathDenoter}BUILD_ALL`,
	TO_FILE_PATH: ( filePath ) => `${buildPathDenoter}${filePath}`,
	FROM_PATH: ( buildPath ) => path.join( __dirname, buildPath.replace( buildPathDenoter, '' ) ),
	IS_VALID_PATH: ( buildPath ) => {
		return (
			buildPath === buildPaths.ALL_FILES ||
			( buildPath.length > buildPathDenoter.length &&
				buildPath.substring( 0, buildPathDenoter.length ) === buildPathDenoter &&
				fs.existsSync( buildPath.replace( buildPathDenoter, '' ) ) )
		)
	}
}

module.exports = { buildEvents, buildPaths }
