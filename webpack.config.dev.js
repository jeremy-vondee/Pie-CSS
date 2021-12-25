const glob = require( 'glob' )
const path = require( 'path' )
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )
const FixStyleOnlyEntriesPlugin = require( 'webpack-fix-style-only-entries' )

module.exports = {
	mode: 'development',
	entry: glob.sync( './src/*/*' ).reduce( function ( entryObject, selectedPath ) {
		if ( /[a-z]\.(sa|sc)ss$/.test( selectedPath ) ) {
			const exportPath = path.parse( selectedPath.replace( './src', '' ).replace( /\.(sa|sc)ss$/, '' ) )
			entryObject[`${exportPath.dir}/${exportPath.name}`] = selectedPath
		}

		return entryObject
	}, {} ),
	output: {
		path: `${__dirname}/dist`
	},
	module: {
		rules: [
			{
				test: /\.(sa|sc)ss$/,
				use: [
					{ loader: MiniCssExtractPlugin.loader },
					{ loader: 'css-loader' },

					{
						loader: 'sass-loader',
						options: {
							sassOptions: {
								outputStyle: 'expanded'
							}
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
