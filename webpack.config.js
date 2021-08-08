const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
	entry: './src/index.ts',
	target: 'node',
	mode: 'production',
	externals: [nodeExternals()],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js', '.tsx'],
	},
	output: {
		filename: 'index.js',
		path: path.resolve('dist'),
	},
};
