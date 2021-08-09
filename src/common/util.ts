import { closeSync, existsSync, mkdirSync, openSync } from 'fs';
import { resolve } from 'path';
import { Page } from 'puppeteer';

import { titlesFileName, tracksFileName } from './const';
import { logOptions } from './types';

export const log = (text: string, options?: logOptions) => {
	const o = options || { cls: false, decor: true, preLines: 0 };
	const { cls, decor, preLines } = o;

	if (!!cls) console.clear();

	const lines = Array(preLines || 0)
		.fill('\n')
		.join('');

	const decorT = !!decor ? '| ' : '';

	console.log(`${lines}${decorT}${text}`);
};

export const prompt = async (text: string) =>
	new Promise<string>(resolve => {
		process.stdout.write(text);
		process.stdin.read();
		process.stdin.once('data', data => {
			const filteredData = data.toString().split('\r\n').join('');
			resolve(filteredData);
		});
	});

export const numChildren = async (page: Page, sel: string) =>
	page.$eval(sel, e => e.childElementCount);

// Folders and paths

export const getTitleFolder = (title: string) => {
	const folder = `${getThumbsFolder()}/${title}`;
	!existsSync(folder) && mkdirSync(folder);
	return folder;
};

export const getThumbsFolder = () => {
	const folder = `${getResourcesFolder()}/thumbs`;
	!existsSync(folder) && mkdirSync(folder);
	return folder;
};

export const getTracksFolder = () => {
	const folder = `${getResourcesFolder()}/tracks`;
	!existsSync(folder) && mkdirSync(folder);
	return folder;
};

export const getResourcesFolder = () => {
	const folder = resolve('resources');
	!existsSync(folder) && mkdirSync(folder);
	return folder;
};

export const getTitlesFilePath = () => {
	const file = `${getResourcesFolder()}/${titlesFileName}`;
	!existsSync(file) && closeSync(openSync(file, 'w'));
	return file;
};

export const getTracksFilePath = () => {
	const file = `${getResourcesFolder()}/${tracksFileName}`;
	!existsSync(file) && closeSync(openSync(file, 'w'));
	return file;
};
