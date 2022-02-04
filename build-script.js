const builder = require( './builder' )

const fileBuilder = builder( { stderr: false } )

// Use the builder as a runnable script
fileBuilder.useAsScript()
