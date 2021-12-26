const { spawn } = require( 'child_process' )
const colors = require( 'colors' )
const fs = require( 'fs' )

const validFlags = {
	filePath: [ '-f', '--files' ]
}

const validFlagsArray = Object.values( validFlags ).flat()

const build = ( buildPath = 'all' ) => {
	if ( typeof buildPath !== 'string' || ( buildPath !== 'all' && !fs.existsSync( buildPath ) ) ) {
		return console.log( colors.red( 'The supplied path is invalid.' ) )
	}

	const buildProcess = spawn( 'yarn', [ 'webpack', `--env=PATH=${buildPath}`, '--config', 'webpack.config.dev.js' ], { cwd: process.cwd(), shell: true } )

	buildProcess.stdout.on( 'data', ( data ) => {
		console.log( data.toString() )
	} )

	buildProcess.stderr.on( 'data', ( data ) => {
		console.log( colors.yellow( data.toString() ) )
	} )

	buildProcess.on( 'error', ( error ) => {
		console.log( colors.red( error.message ) )
		throw error
	} )
}

const isValidFlag = ( flag ) => {
	let value
	for ( value of validFlagsArray ) {
		if ( flag === value ) return true
	}

	return false
}

const args = process.argv
const flag = args[2]
const firstPath = args[3]

if ( isValidFlag( flag ) ) {
	if ( firstPath === 'all' ) {
		build( firstPath )
	} else {
		build( './' + firstPath.replace( /(\\)+/g, '/' ) )
	}
} else {
	console.log( colors.red( `Invalid flag: ${flag}\nAccepted flags are: ${validFlagsArray.map( ( value ) => value ).join( ', ' )}\n` ) )
	process.exit( 1 )
}
