import { closeSync, openSync } from 'fs';
import { resolve } from 'path';
import { Page } from 'puppeteer';

import { titlesFileName } from './const';

export const getTitlesFilePath = async () => {
	const path = resolve(`resources/${titlesFileName}`);
	closeSync(openSync(path, 'w'));
	return path;
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
