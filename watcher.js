const chokidar = require( 'chokidar' )
const fs = require( 'fs' )
const { printDivider, printErrorMessage, printActionMessage, printMessage } = require( './print-utilities' )
const builder = require( './builder' )
const runPostBuild = require( './post-build' )
const { paths, folders } = require( './config' )
const { buildPaths, buildEvents } = require( './constants' )

// Start watching `src` folder
const watcher = chokidar.watch( './src', { persistent: true } )
const fileBuilder = builder( { stderr: false } )

let devBuild, prodBuild
let isBuilding = false
let isRestarting = false
let currentBuildPath = null

const removeDistDirectory = () => {
	try {
		printActionMessage( 'info', 'remove', 'Removing `dist` folder...' )
		fs.rmSync( paths.DIST, { recursive: true, force: true } )
		printActionMessage( 'success', 'done', 'Successfully removed `dist` folder!' )
		printDivider( '•', 70, { textColor: 'grey' } )
	} catch ( error ) {
		printActionMessage( 'error', 'error', error.message )
		printActionMessage( 'error', 'error', 'Could not remove `dist` folder. Exiting...' )
	}
}

const printHelpMessage = () => {
	printDivider( '•', 70, { textColor: 'grey' } )
	printMessage( 'The available commands are: ', { startLine: true, endLine: true } )
	printActionMessage( 'info', 'command', 'Type `help` to display this message.' )
	printActionMessage( 'info', 'command', 'Type `rs` or `restart` to restart the watcher.' )
	printActionMessage( 'info', 'command', 'Type `die`, `bye` or `exit` to exit the watcher.' )
	printDivider( '•', 70, { textColor: 'grey' } )
}

const buildAll = ( buildPath ) => {
	isBuilding = true
	devBuild = fileBuilder.startBuild( fileBuilder.modes.dev, buildPath )
	prodBuild = fileBuilder.startBuild( fileBuilder.modes.prod, buildPath )

	devBuild.onExit( ( code ) => {
		if ( code === 0 ) {
			printActionMessage( 'info', 'exit', 'Expanded build exited.' )
		}

		isRestarting = false
		isBuilding = false
		devBuild = undefined
	} )

	prodBuild.onExit( ( code ) => {
		if ( code === 0 ) {
			printActionMessage( 'info', 'exit', 'Minified build exited.' )

			printDivider( '•', 70, { textColor: 'grey' } )
			printActionMessage( 'info', 'post-build', 'Running post-build at `dist`...' )
			runPostBuild( paths.DIST )
			printActionMessage( 'success', 'done', 'Post-build successful!' )
			printDivider( '•', 70, { textColor: 'grey' } )
			printAfterBuildMessage()

			fileBuilder.onGetUserInput( ( data ) => {
				const command = data.toString().trim()

				switch ( command ) {
					case 'rs':
					case 'restart': {
						isBuilding = false
						printActionMessage( 'info', 'restart', 'Restarting. Please wait...' )
						return buildAll( buildPath )
					}
					case 'die':
					case 'bye':
					case 'exit':
						printActionMessage( 'info', 'exit', 'Exiting...' )
						printDivider( '•', 70, { textColor: 'grey' } )
						return process.exit( 0 )
					case 'help':
						return printHelpMessage()
					default:
						printActionMessage( 'error', 'invalid', `Invalid command "${command}" entered.` )
						return printHelpMessage()
				}
			} )
		}

		isRestarting = false
		isBuilding = false
		prodBuild = undefined
	} )
}

const printAfterBuildMessage = () => {
	printActionMessage( 'info', 'info', 'Type `help` to show the show the available commands.' )
	printActionMessage( 'info', 'info', 'Type `rs` or `restart` to restart the watcher.' )
	printActionMessage( 'info', 'info', 'Type `die`, `bye` or `exit` to exit the watcher.' )
	printDivider( '•', 70, { textColor: 'grey' } )
	printActionMessage( 'custom', 'watch', 'Watching directory `src`...' )
}

const runBuildOnEvent = ( buildPath ) => {
	if ( buildPaths.IS_VALID_PATH( buildPath ) ) {
		if ( isRestarting ) {
			printActionMessage( 'info', 'restart', 'Restarting. Please wait...' )

			if ( !devBuild && !prodBuild ) {
				return buildAll( buildPath )
			}
		} else {
			if ( buildPath === buildPaths.ALL_FILES ) {
				removeDistDirectory()
				printActionMessage( 'info', 'build', 'Building all files. Please wait...' )
			} else {
				printActionMessage( 'info', 'build', 'Building. Please wait...' )
			}

			return buildAll( buildPath )
		}
	}
}

for ( let eventKey in buildEvents ) {
	const event = buildEvents[eventKey]
	if ( event === buildEvents.ADD ) continue

	if ( event === buildEvents.READY ) {
		watcher.on( event, () => {
			// Build all files when the watcher is ready
			runBuildOnEvent( buildPaths.ALL_FILES )

			watcher.addListener( buildEvents.ADD, async ( filePath ) => {
				if ( isBuilding ) {
					isRestarting = true

					try {
						if ( devBuild ) {
							await devBuild.endBuild( 0 )
						}
						if ( prodBuild ) {
							await prodBuild.endBuild( 0 )
						}
					} catch ( error ) {
						// Ignore error
					}

					if ( buildPaths.TO_FILE_PATH( filePath ) !== currentBuildPath ) {
						currentBuildPath = buildPaths.ALL_FILES
						return runBuildOnEvent( currentBuildPath )
					}
				}

				if ( filePath.includes( folders.GLOBAL_VARS ) ) {
					currentBuildPath = buildPaths.ALL_FILES
					return runBuildOnEvent( currentBuildPath )
				} else {
					currentBuildPath = buildPaths.TO_FILE_PATH( filePath )
					return runBuildOnEvent( currentBuildPath )
				}
			} )
		} )
	} else {
		watcher.on( event, async ( filePath ) => {
			if ( isBuilding ) {
				isRestarting = true

				try {
					if ( devBuild ) {
						await devBuild.endBuild( 0 )
					}
					if ( prodBuild ) {
						await prodBuild.endBuild( 0 )
					}
				} catch ( error ) {
					// Ignore error
				}

				if ( buildPaths.TO_FILE_PATH( filePath ) !== currentBuildPath ) {
					currentBuildPath = buildPaths.ALL_FILES
					return runBuildOnEvent( currentBuildPath )
				}
			}

			if ( event === buildEvents.UNLINK ) {
				currentBuildPath = buildPaths.ALL_FILES
				return runBuildOnEvent( currentBuildPath )
			} else {
				if ( filePath.includes( folders.GLOBAL_VARS ) ) {
					currentBuildPath = buildPaths.ALL_FILES
					return runBuildOnEvent( currentBuildPath )
				} else {
					currentBuildPath = buildPaths.TO_FILE_PATH( filePath )
					return runBuildOnEvent( currentBuildPath )
				}
			}
		} )
	}
}

watcher.on( 'error', ( error ) => {
	printErrorMessage( error.message )
} )
