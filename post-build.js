const fs = require( 'fs' )
const path = require( 'path' )
const glob = require( 'glob' )

const getDirectoryPaths = ( root ) => {
	return glob.sync( path.join( root, '/**/' ) )
}

const runPostBuild = ( rootPath, options ) => {
	const appliedOptions = {
		rootFile: { name: 'index', expanded: { ext: '.css' }, compressed: { prefix: '.min' } },
		subDirFile: { name: 'index', expanded: { ext: '.css' }, compressed: { prefix: '.min' } },
		...options
	}

	const { rootFile, subDirFile } = appliedOptions

	if ( fs.existsSync( rootPath ) ) {
		const pathStats = fs.statSync( rootPath )
		if ( pathStats.isDirectory() ) {
			// Get all sub directories
			const subDirPaths = getDirectoryPaths( rootPath )

			subDirPaths.forEach( ( dirPath ) => {
				const { expanded, compressed } = glob.sync( path.join( dirPath, `/**/*${subDirFile.expanded.ext}` ) ).reduce(
					( allContent, filePath ) => {
						const fileContents = fs.readFileSync( filePath )

						if ( !filePath.includes( subDirFile.name ) ) {
							if ( filePath.includes( '.min.css' ) ) {
								allContent.compressed += fileContents
							} else {
								allContent.expanded += fileContents
							}
						}

						return allContent
					},
					{ expanded: '', compressed: '' }
				)

				fs.writeFileSync( path.join( dirPath, subDirFile.name + subDirFile.expanded.ext ), expanded )
				fs.writeFileSync( path.join( dirPath, subDirFile.name + subDirFile.compressed.prefix + subDirFile.expanded.ext ), compressed )
			} )

			const { expanded, compressed } = glob
				.sync(
					path.join(
						rootPath,
						`*/${subDirFile.name}.{${subDirFile.expanded.ext.replace( '.', '' )},${
							subDirFile.compressed.prefix.replace( '.', '' ) + subDirFile.expanded.ext
						}}`
					)
				)
				.reduce(
					( allContent, filePath ) => {
						const fileContents = fs.readFileSync( filePath )

						if ( filePath.includes( '.min.css' ) ) {
							allContent.compressed += fileContents
						} else {
							allContent.expanded += fileContents
						}

						return allContent
					},
					{ expanded: '', compressed: '' }
				)

			fs.writeFileSync( path.join( rootPath, rootFile.name + rootFile.expanded.ext ), expanded )
			fs.writeFileSync( path.join( rootPath, rootFile.name + rootFile.compressed.prefix + rootFile.expanded.ext ), compressed )
		}
	}
}

module.exports = runPostBuild
