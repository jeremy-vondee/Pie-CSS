const chokidar = require( 'chokidar' )
const { spawn } = require( 'child_process' )
const colors = require( 'colors/safe' )

// Start watching `src` folder
const watcher = chokidar.watch( './src', { ignored: /(^|[/\\])\../, persistent: true } )
let isBuilding = false

console.log( colors.blue( 'Watching directory `src`...' ) )

const runBuildOnEvent = () => {
	if ( !isBuilding ) {
		isBuilding = true
		console.log( colors.green( '\nBuilding...\n' ) )

		const childProcessSpawn = spawn( 'yarn', [ 'build' ], { cwd: process.cwd(), shell: true } )

		childProcessSpawn.stdout.on( 'data', ( data ) => {
			console.log( data.toString() )
		} )

		childProcessSpawn.stderr.on( 'data', ( data ) => {
			console.log( colors.yellow( data.toString() ) )
		} )

		childProcessSpawn.on( 'error', ( error ) => {
			console.log( colors.red( error.message ) )
			throw error
		} )

		childProcessSpawn.on( 'close', ( code ) => {
			if ( code === 0 ) {
				console.log( colors.green( 'Build successful!' ) )
				console.log( colors.green( '-------------------------------------------------' ) )
				console.log( colors.blue( 'Watching directory `src`...' ) )
			} else {
				console.log( `child process exited with code ${code}` )
			}
			isBuilding = false
		} )
	}
}

const buildEvents = [ 'add', 'change', 'unlink' ]

buildEvents.forEach( ( event ) => {
	watcher.on( event, function () {
		runBuildOnEvent()
	} )
} )

watcher.on( 'error', function ( error ) {
	console.error( colors.red( error.message ) )
} )
