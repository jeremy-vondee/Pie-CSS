const glob = require( 'glob' )
const path = require( 'path' )
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )
const FixStyleOnlyEntriesPlugin = require( 'webpack-fix-style-only-entries' )
const CssMinimizerPlugin = require( 'css-minimizer-webpack-plugin' )
const postcssPresetEnv = require( 'postcss-preset-env' )
const { paths, folders } = require( './config' )
const { buildPaths } = require( './constants' )

const createEntryPathKey = ( originalEntryPath ) => {
	let exportPath
	if ( path.isAbsolute( originalEntryPath ) ) {
		exportPath = path.parse( originalEntryPath.replace( /\.(scss|js)$/, '' ) )
		return `${exportPath.dir.substring( exportPath.dir.indexOf( folders.SRC ) + folders.SRC.length + path.sep.length )}/${
			exportPath.name
		}`
	} else {
		exportPath = path.parse( originalEntryPath.replace( `./${folders.SRC}`, '' ).replace( /\.(scss|js)$/, '' ) )
		return `${exportPath.dir}/${exportPath.name}`
	}
}

const createEntriesByPath = ( envPath ) => {
	if ( buildPaths.IS_VALID_PATH( envPath ) ) {
		if ( envPath === buildPaths.ALL_FILES ) {
			return glob
				.sync( `./${folders.SRC}/**/*.{scss,js}`, { ignore: `./${folders.SRC}/${folders.GLOBAL_VARS}/*.scss` } )
				.reduce( function ( entryObject, selectedPath ) {
					if ( /[a-z0-9A-Z]\.(scss|js)$/.test( selectedPath ) ) {
						const originalPath = buildPaths.FROM_PATH( selectedPath )
						entryObject[createEntryPathKey( originalPath )] = originalPath
					}

					return entryObject
				}, {} )
		} else {
			const originalPath = buildPaths.FROM_PATH( envPath )
			return { [createEntryPathKey( originalPath )]: originalPath }
		}
	}
}

const optimizeByMode = ( isProduction ) => {
	const optimization = { minimize: isProduction }
	if ( isProduction ) {
		optimization.minimizer = [
			new CssMinimizerPlugin( { minimizerOptions: { preset: [ 'default', { discardComments: { removeAll: true } } ] } } )
		]
	}

	return optimization
}

module.exports = ( env ) => {
	const isProduction = env.MODE === 'production'

	return {
		mode: env.MODE,
		entry: createEntriesByPath( env.PATH ),
		output: {
			path: paths.DIST
		},
		module: {
			rules: [
				{
					test: /\.scss$/,
					use: [
						{ loader: MiniCssExtractPlugin.loader },
						{ loader: 'css-loader', options: { url: true, import: true } },
						{
							loader: 'postcss-loader',
							options: {
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
						{ loader: 'sass-loader' },
						{
							loader: 'sass-resources-loader',
							options: {
								resources: `./${folders.SRC}/${folders.GLOBAL_VARS}/*.scss`,
								hoistUseStatements: true
							}
						}
					],
					exclude: /node_modules/
				}
			]
		},
		optimization: optimizeByMode( isProduction ),
		plugins: [
			new FixStyleOnlyEntriesPlugin(),
			new MiniCssExtractPlugin( {
				filename: isProduction ? '[name].min.css' : '[name].css'
			} )
		]
		// devtool: !isProduction && 'source-map'
	}
}
