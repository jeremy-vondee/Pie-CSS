const glob = require( 'glob' )
const path = require( 'path' )
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )
const CssMinimizerPlugin = require( 'css-minimizer-webpack-plugin' )
const OptimizeCSSAssetsPlugin = require( 'optimize-css-assets-webpack-plugin' )
const FixStyleOnlyEntriesPlugin = require( 'webpack-fix-style-only-entries' )
const postcssPresetEnv = require( 'postcss-preset-env' )

module.exports = {
	mode: 'production',
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
						loader: 'postcss-loader',
						options: {
							sourceMap: true,
							postcssOptions: postcssPresetEnv( { stage: 3 } )
						}
					},
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
		minimizer: [ new CssMinimizerPlugin() ]
	},
	plugins: [
		new MiniCssExtractPlugin( {
			filename: '[name].min.css'
		} ),
		new FixStyleOnlyEntriesPlugin(),
		new OptimizeCSSAssetsPlugin( {
			cssProcessorPluginOptions: {
				preset: [ 'default', { discardComments: { removeAll: true } } ]
			}
		} )
	]
}
