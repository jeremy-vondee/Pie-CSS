const chokidar = require( 'chokidar' )
const { spawn } = require( 'child_process' )
const colors = require( 'colors/safe' )
const path = require( 'path' )
const fs = require( 'fs' )
const runPostBuild = require( './post-build' )

// Start watching `src` folder
const watcher = chokidar.watch( './src', { ignored: './src/_variables', persistent: true } )
let isBuilding = false

console.log( colors.blue( '\nWatching directory `src`...\n' ) )
console.log( colors.blue( '-------------------------------------------------' ) )

try {
	console.log( colors.blue( '\nRemoving `dist` folder...' ) )
	fs.rmSync( path.resolve( __dirname, 'dist' ), { recursive: true, force: true } )
	console.log( colors.blue( 'Success!\n' ) )
	console.log( colors.blue( '-------------------------------------------------' ) )
} catch ( error ) {
	console.error( colors.red( 'Could not remove `dist` folder. Exiting...' ) )
	console.error( colors.red( error ) )
	process.exit( 1 )
}

const buildDev = ( filePath ) => {
	const devBuildProcess = spawn( 'yarn', [ 'build:dev', '--files', filePath ], { cwd: process.cwd(), shell: true } )

	devBuildProcess.stdout.on( 'data', ( data ) => {
		console.log( data.toString() )
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

const buildProd = ( filePath ) => {
	const prodBuildProcess = spawn( 'yarn', [ 'build:prod', '--files', filePath ], { cwd: process.cwd(), shell: true } )

	prodBuildProcess.stdout.on( 'data', ( data ) => {
		console.log( data.toString() )
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

const runBuildOnEvent = ( event, filePath ) => {
	if ( !isBuilding ) {
		isBuilding = true

		if ( event === 'add' ) {
			console.log( '\n', colors.bgBlue( 'build' ), colors.yellow( 'Building all files. Please wait...' ), '\n' )
		} else {
			console.log( colors.blue( '\nBuilding. Please wait...\n' ) )
		}

		buildDev( event === 'add' ? 'all' : filePath ).onFinishBuild( () => {
			buildProd( event === 'add' ? 'all' : filePath ).onFinishBuild( ( code ) => {
				if ( code === 0 ) {
					console.log( colors.green( '\nRunning post-build at `dist`...\n' ) )
					runPostBuild( path.resolve( __dirname, 'dist' ) )
					console.log( colors.green( 'Post-build successful!\n' ) )
					console.log( colors.green( '-------------------------------------------------' ) )
					console.log( colors.blue( '\nWatching directory `src`...\n' ) )
					console.log( colors.blue( '-------------------------------------------------' ) )
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
