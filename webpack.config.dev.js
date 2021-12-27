const glob = require( 'glob' )
const path = require( 'path' )
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )
const FixStyleOnlyEntriesPlugin = require( 'webpack-fix-style-only-entries' )
const postcssPresetEnv = require( 'postcss-preset-env' )

const createEntriesByPath = ( envPath ) => {
	if ( envPath === 'all' ) {
		return glob.sync( './src/**/*.{scss,sass}' ).reduce( function ( entryObject, selectedPath ) {
			if ( /[a-z]\.(sa|sc)ss$/.test( selectedPath ) && !selectedPath.includes( '_variables' ) ) {
				const exportPath = path.parse( selectedPath.replace( './src', '' ).replace( /\.(sa|sc)ss$/, '' ) )
				entryObject[`${exportPath.dir}/${exportPath.name}`] = selectedPath
			}

			return entryObject
		}, {} )
	} else {
		const exportPath = path.parse( envPath.replace( './src', '' ).replace( /\.(sa|sc)ss$/, '' ) )
		return { [`${exportPath.dir}/${exportPath.name}`]: envPath }
	}
}

module.exports = ( env ) => {
	return {
		mode: 'development',
		entry: createEntriesByPath( env.PATH ),
		output: {
			path: path.resolve( __dirname, 'dist' )
		},
		module: {
			rules: [
				{
					test: /\.(sa|sc)ss$/,
					use: [
						{ loader: MiniCssExtractPlugin.loader },
						{ loader: 'css-loader', options: { sourceMap: true } },
						{
							loader: 'postcss-loader',
							options: {
								sourceMap: true,
								postcssOptions: {
									plugins: [
										postcssPresetEnv( {
											stage: 3,
											features: {
												'nesting-rules': true,
												'color-mod-function': { unresolved: 'warn' },
												'all-property': true,
												'overflow-property': true
											},
											autoprefixer: { grid: 'autoplace', flexbox: true }
										} )
									]
								}
							}
						},
						{
							loader: 'sass-loader',
							options: {
								sourceMap: true,
								sassOptions: {
									outputStyle: 'expanded'
								}
							}
						},
						{
							loader: 'sass-resources-loader',
							options: {
								resources: glob.sync( './src/_variables/**.scss' ).reduce( function ( resourcesArray, selectedPath ) {
									resourcesArray.push( path.resolve( __dirname, selectedPath ) )
									return resourcesArray
								}, [] )
							}
						}
					],
					exclude: /node_modules/
				}
			]
		},
		optimization: {
			minimize: false
		},
		plugins: [
			new MiniCssExtractPlugin( {
				filename: '[name].css'
			} ),
			new FixStyleOnlyEntriesPlugin()
		]
	}
}
