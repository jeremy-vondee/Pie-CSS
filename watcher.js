const chokidar = require( 'chokidar' )
const { spawn } = require( 'child_process' )
const colors = require( 'colors/safe' )

// Start watching `src` folder
const watcher = chokidar.watch( './src', { ignored: /((^|[/\\])\.. | _variables.scss)/, persistent: true } )
let isBuilding = false

console.log( colors.blue( '\nWatching directory `src`...\n' ) )

const buildDev = ( path ) => {
	const devBuildProcess = spawn( 'yarn', [ 'build:dev', '--files', path ], { cwd: process.cwd(), shell: true } )

	devBuildProcess.stdout.on( 'data', ( data ) => {
		console.log( data.toString() )
	} )

	devBuildProcess.stderr.on( 'data', ( data ) => {
		console.log( colors.yellow( data.toString() ) )
	} )

	devBuildProcess.on( 'error', ( error ) => {
		console.log( colors.red( error.message ) )
		throw error
	} )

	const onFinishBuild = ( callback ) => {
		return devBuildProcess.on( 'close', ( code ) => {
			if ( code === 0 ) {
				console.log( colors.green( 'Build successful!' ) )
				console.log( colors.green( '-------------------------------------------------' ) )
			} else {
				console.log( `child process exited with code ${code}` )
			}

			callback( code )
			isBuilding = false
		} )
	}

	return { onFinishBuild }
}

const buildProd = ( path ) => {
	const prodBuildProcess = spawn( 'yarn', [ 'build:prod', '--files', path ], { cwd: process.cwd(), shell: true } )

	prodBuildProcess.stdout.on( 'data', ( data ) => {
		console.log( data.toString() )
	} )

	prodBuildProcess.stderr.on( 'data', ( data ) => {
		console.log( colors.yellow( data.toString() ) )
	} )

	prodBuildProcess.on( 'error', ( error ) => {
		console.log( colors.red( error.message ) )
		throw error
	} )

	const onFinishBuild = ( callback ) => {
		return prodBuildProcess.on( 'close', ( code ) => {
			if ( code === 0 ) {
				console.log( colors.green( 'Build successful!' ) )
				console.log( colors.green( '-------------------------------------------------' ) )
			} else {
				console.log( `child process exited with code ${code}` )
			}

			callback( code )
			isBuilding = false
		} )
	}

	return { onFinishBuild }
}

const runBuildOnEvent = ( event, path ) => {
	if ( !isBuilding ) {
		isBuilding = true

		if ( event === 'add' ) {
			console.log( colors.green( '\nBuilding all files. Please wait...\n' ) )
		} else {
			console.log( colors.green( '\nBuilding. Please wait...\n' ) )
		}

		buildDev( event === 'add' ? 'all' : path ).onFinishBuild( () => {
			buildProd( event === 'add' ? 'all' : path ).onFinishBuild( ( code ) => {
				if ( code === 0 ) {
					console.log( colors.blue( '\nWatching directory `src`...\n' ) )
				}
			} )
		} )
	}
}

const buildEvents = [ 'add', 'change', 'unlink' ]

buildEvents.forEach( ( event ) => {
	watcher.on( event, ( path ) => {
		runBuildOnEvent( event, path )
	} )
} )

watcher.on( 'error', function ( error ) {
	console.error( colors.red( error.message ) )
} )
