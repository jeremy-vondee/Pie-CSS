const { spawn } = require( 'child_process' )
const { paths } = require( './config' )
const { buildPaths } = require( './constants' )
const runPostBuild = require( './post-build' )
const { printActionMessage, printWarningMessage, printMessage, printDivider } = require( './print-utilities' )

const builder = ( options = { stdout: true, stderr: true, error: true } ) => {
	const modes = {
		dev: 'development',
		prod: 'production'
	}

	const startBuild = ( mode, buildPath ) => {
		const combinedOptions = Object.assign( {}, { stdout: true, stderr: true, error: true }, options )

		const buildProcess = spawn(
			'yarn',
			[ 'webpack', `--env=MODE=${mode}`, `--env=PATH=${buildPath}`, '--config', 'webpack.config.js' ],
			{
				cwd: process.cwd(),
				shell: true
			}
		)

		let stdoutHandler, stderrHandler, errorHandler

		if ( combinedOptions.stdout ) {
			stdoutHandler = ( data ) => {
				const stringifiedData = data.toString().trim()

				if ( /^info/i.test( stringifiedData ) ) {
					printActionMessage( 'info', 'info', stringifiedData.substring( 'info'.length + 1 ) )
				} else {
					printMessage( stringifiedData, { startLine: true, endLine: true } )
				}
			}

			buildProcess.stdout.on( 'data', stdoutHandler )
		}

		if ( combinedOptions.stderr ) {
			stderrHandler = ( data ) => {
				const stringifiedData = data.toString().trim()

				if ( /^warning/i.test( stringifiedData ) ) {
					printActionMessage( 'warn', 'warning', stringifiedData.substring( 'warning'.length + 1 ) )
				} else if ( /^error/i.test( stringifiedData ) ) {
					printActionMessage( 'error', 'error', stringifiedData.substring( 'error'.length + 1 ) )
				} else {
					printWarningMessage( stringifiedData, { startLine: true } )
				}
			}

			buildProcess.stderr.on( 'data', stderrHandler )
		}

		if ( combinedOptions.error ) {
			errorHandler = ( error ) => {
				printActionMessage( 'error', 'error', error.toString().trim() )
			}

			buildProcess.on( 'error', errorHandler )
		}

		function onExit( callback ) {
			return buildProcess.on( 'exit', ( code, signal ) => {
				if ( typeof callback === 'function' ) callback( code, signal )

				if ( code !== 0 ) {
					printActionMessage( 'error', 'exit', `The child process exited with code ${code} and signal ${signal}.` )
				}
			} )
		}

		function endBuild( signal = 'SIGKILL' ) {
			const normalizeHeaders = ( columns ) => {
				return columns.map( ( title ) => {
					switch ( title ) {
						case 'Name':
						case 'COMM':
							return 'COMMAND'
						case 'ParentProcessId':
							return 'PPID'
						case 'ProcessId':
							return 'PID'
						case 'Status':
							return 'STAT'
						default:
							return ''
					}
				} )
			}

			const getChildProcesses = ( callback ) => {
				if ( typeof callback !== 'function' ) {
					throw Error( 'Callback must be a function.' )
				}

				let processesQuery
				let parentPid = buildProcess.pid.toString()
				let parentProcesses = {}
				let headers = null

				if ( /^win/i.test( process.platform ) ) {
					processesQuery = spawn( 'wmic.exe', [ 'PROCESS', 'GET', 'Name,ProcessId,ParentProcessId,Status' ] )
				}

				parentProcesses[parentPid] = {
					childProcesses: []
				}

				processesQuery.stdout.on( 'data', function ( data ) {
					const strigifiedData = data.toString().trim()
					const lines = strigifiedData.split( /\n/ )

					lines.forEach( function ( line ) {
						const columns = line.trim().split( /\s+/ )
						if ( !headers ) {
							headers = normalizeHeaders( columns )
							return
						}

						let row = {}
						let copiedHeaders = headers.slice()

						while ( copiedHeaders.length ) {
							row[copiedHeaders.shift()] = copiedHeaders.length ? columns.shift() : columns.join( ' ' )
						}

						if ( row.PPID === parentPid ) {
							if ( parentProcesses[parentPid] ) {
								parentProcesses[parentPid].childProcesses.push( row.PID )
							}
						}
					} )

					if ( parentProcesses[parentPid].childProcesses.length ) {
						callback( parentProcesses[parentPid].childProcesses )
					}
				} )
			}

			if ( buildProcess.kill( signal ) ) {
				return getChildProcesses( buildProcess.pid, ( childPids ) => {
					childPids.forEach( ( pid ) => {
						return process.kill( pid, signal )
					} )
				} )
			}
		}

		return {
			onExit,
			endBuild
		}
	}

	const onGetUserInput = ( callback ) => {
		process.stdin.on( 'data', ( data ) => {
			callback( data )
		} )
	}

	const useAsScript = () => {
		const args = process.argv
		const flag = args[2]

		const validFlags = {
			filePath: [ '-f', '--files' ]
		}

		const validFlagsArray = [ ...validFlags.filePath ]

		const isValidFlag = ( flag ) => {
			let value
			for ( value of validFlagsArray ) {
				if ( flag === value ) return true
			}

			return false
		}

		if ( isValidFlag( flag ) ) {
			const recievedPaths =
				args[3] === '*' ? [ buildPaths.ALL_FILES ] : args.slice( 3 ).map( ( filePath ) => buildPaths.TO_FILE_PATH( filePath ) )

			recievedPaths.forEach( ( buildPath ) => {
				const devBuild = startBuild( modes.dev, buildPath )
				const prodBuild = startBuild( modes.prod, buildPath )

				devBuild.onExit( ( code ) => {
					if ( code === 0 ) {
						printActionMessage( 'exit', 'info', 'Expanded build exited.' )
					}
				} )

				prodBuild.onExit( ( code ) => {
					if ( code === 0 ) {
						printActionMessage( 'exit', 'info', 'Minified build exited.' )
						printDivider( '•', 70, { textColor: 'grey' } )
						printActionMessage( 'post-build', 'info', 'Running post-build at `dist`...' )
						runPostBuild( paths.DIST )
						printActionMessage( 'done', 'success', 'Post-build successful!' )
						printDivider( '•', 70, { textColor: 'grey' } )
						printActionMessage( 'exit', 'info', 'Exiting...' )
					}
				} )
			} )
		} else {
			printActionMessage(
				'error',
				'error',
				`Invalid flag: ${flag}\nAccepted flags are: ${validFlagsArray.map( ( value ) => value ).join( ', ' )}`
			)
			process.exit( 1 )
		}
	}

	return { modes, startBuild, onGetUserInput, useAsScript }
}

module.exports = builder
