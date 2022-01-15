
const merge = require('webpack-merge');
const package = require("../package.json")

const common = require('async.2018/config/webpack.config.js');
const production = require('async.2018/config/webpack.prod.js');
const component = require('./webpack.config.js');

let entry = {};

let evt = () => {

	const es6 = common[0](evt);
 	//const es5 = common[1](evt);

//	es6.externals = es5.externals = [];

		es6.devtool = 'source-map';
	//	es5.devtool = 'source-map';

		es6.plugins[3].options.title = package.short_name;
			es6.plugins[4].opts.seed = package.short_name;
	//	es5.plugins[3].options.title = package.short_name;
		//set package scope (ES6)

		entry[`${package.short_name}`] = `./src`;
		es6.entry = entry;

		//set package scope (ES5)

		entry = {};
		entry[`${package.short_name}`]=`webpack-polyfill-injector?${JSON.stringify({
				modules: './src' // list your entry modules for the `app` entry chunk
			})}!`; // don't forget the trailing exclamation mark!
	//	es5.entry = entry;

		//naming scheme
		es6.output.filename = `[name].[contenthash].js`;
		es6.output.library = `${package.short_name}`;
		es6.output.chunkFilename = `module~[name].[contenthash].js`;
		/*

		es5.output.filename = `[name].legacy.js`;
		es5.output.library = `${package.short_name}_legacy`;
		es5.output.chunkFilename = `module~[name].legacy.js`;

*/
		//assign webpack externals

		es6.externals.push({
			"async.2018":"asynx"});
/*
		es5.externals.push({
			"async.2018":"asynx"});
*/
	return [
		//merge(es5, production),
		merge(es6, production)//,
		//merge(css, production)
	]
};
module.exports = evt();
