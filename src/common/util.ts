import { closeSync, existsSync, mkdirSync, openSync } from 'fs';
import { resolve } from 'path';
import { Page } from 'puppeteer';

import { titlesFileName, tracksFileName } from './const';

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
