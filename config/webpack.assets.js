
/**
 * config for bundling assets and css
 */

const package = require("../package.json")
const build = require('async.2018/config/webpack.master.js');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = css = evt => {

	const temp = build(evt);
	const production = temp.mode == 'development' ? false : true;

	temp.target = 'web';
	temp.output.library = 'css';
	temp.output.filename = `css~entry.js`;

	temp.output.chunkFilename = `css~[name].js`;

	temp.entry = `./src/main.scss`;

	temp.plugins = [

		new MiniCssExtractPlugin({
			filename: production ? '[name].css' : '[name].[hash].css',
			chunkFilename: production ? '[id].css' : '[id].[hash].css',
		}),

		new CopyWebpackPlugin([{
			from: 'src/assets',
			to: 'assets',
		}], {
			ignore: [
				'css/**/*.*'
			]
		})

	];

	return temp;
}
