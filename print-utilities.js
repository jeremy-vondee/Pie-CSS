const colors = require( 'colors/safe' )

const getBgColorFromBgOption = ( bg ) => {
	return 'bg' + bg.replace( bg[0], bg[0].toUpperCase() )
}

const printNewLine = () => printMessage( '\n' )

const printMessage = ( message, options ) => {
	const appliedOptions = Object.assign(
		{},
		{
			bg: null,
			textColor: null,
			startLine: false,
			endLine: false
		},
		options
	)

	process.stdout.write( formatMessage( message, appliedOptions ) )
}

const printInfoMessage = ( message, options ) => {
	return printMessage( message, { ...options, textColor: 'blue' } )
}

const printWarningMessage = ( message, options ) => {
	return printMessage( message, { ...options, textColor: 'yellow' } )
}

const printErrorMessage = ( message, options ) => {
	return printMessage( message, { ...options, textColor: 'red' } )
}

const printSuccessMessage = ( message, options ) => {
	return printMessage( message, { ...options, textColor: 'green' } )
}

const printDivider = ( character = '-', count = 20, options ) => {
	let divider = ''
	for ( let i = 0; i < count; i += 1 ) divider += character
	return printMessage( divider, { ...options, startLine: true, endLine: true } )
}

const formatMessage = ( message, options ) => {
	const { textColor, bg, startLine, endLine } = options

	let finalMessage

	if ( startLine ) {
		finalMessage = '\n' + message
	} else {
		finalMessage = message
	}

	if ( textColor in colors ) {
		finalMessage = colors[textColor]( finalMessage )
	}

	if ( bg in colors ) {
		finalMessage = colors[getBgColorFromBgOption( bg )]( finalMessage )
	}

	if ( endLine ) {
		finalMessage += '\n'
	}

	return finalMessage
}

const joinMessages = ( ...messages ) => ( separator ) => {
	const formattedMessagesList = messages.map( ( msg ) => {
		const { body, ...rest } = msg
		return formatMessage( body, rest )
	} )

	return formattedMessagesList.join( separator || '' )
}

const printActionMessage = ( type, title, message = '' ) => {
	switch ( type ) {
		case 'success':
			return printMessage(
				joinMessages(
					{ bg: 'green', textColor: 'black', body: ` ${title + ' \u2713'} `, startLine: true },
					{ textColor: 'green', body: message, endLine: true }
				)( ' ' )
			)
		case 'info':
			return printMessage(
				joinMessages(
					{ bg: 'blue', textColor: 'white', body: ` ${title} `, startLine: true },
					{ body: message, endLine: true }
				)( ' ' )
			)

		case 'warn':
			return printMessage(
				joinMessages(
					{ bg: 'yellow', textColor: 'black', body: ` ${title} `, startLine: true },
					{ textColor: 'yellow', body: message, endLine: true }
				)( ' ' )
			)
		case 'error':
			return printMessage(
				joinMessages(
					{ bg: 'red', textColor: 'white', body: ` ${title + ' \u2A2F'} `, startLine: true },
					{ textColor: 'red', body: message, endLine: true }
				)( ' ' )
			)
		default:
			return printMessage(
				joinMessages(
					{ bg: 'grey', textColor: 'black', body: ` ${title} `, startLine: true },
					{ body: message, endLine: true }
				)( ' ' )
			)
	}
}

module.exports = {
	printActionMessage,
	printMessage,
	printDivider,
	printNewLine,
	printInfoMessage,
	printWarningMessage,
	printSuccessMessage,
	printErrorMessage,
	joinMessages,
	formatMessage
}
