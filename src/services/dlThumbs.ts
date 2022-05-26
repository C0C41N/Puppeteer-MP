import { readFileSync, writeFileSync } from 'fs';
import * as puppeteer from 'puppeteer';
import * as sharp from 'sharp';

import { headless } from '../common/const';
import { Tracks } from '../common/types';
import { getThumbsFilePath, getThumbsFolder, log } from '../common/util';

export const dlThumbs = async () => {
	// reading file

	const file = getThumbsFilePath();
	const data = readFileSync(file, { encoding: 'utf-8' });

	// starting browser

	const browser = await puppeteer.launch({
		headless,
		defaultViewport: null,
		args: ['--start-maximized'],
	});

	// dl images

	const thumbs: Tracks = JSON.parse(data.trim());

	await Promise.all(
		Object.entries(thumbs).map(async ([title, url]) => {
			const page = await browser.newPage();

			const vId = url.split('/')[3];
			const file = `${getThumbsFolder()}/${title}.jpg`;
			const imgURL = `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`;

			try {
				const view = await page.goto(imgURL, { waitUntil: 'networkidle0' });
				const dlImgBuffer = await view.buffer();

				const buffer = await sharp(dlImgBuffer)
					.resize({ width: 700 })
					.toBuffer();

				writeFileSync(file, buffer);
			} catch (error) {
				console.log({ error });
			}

			page.close();
			log(`${title} | ${url} | Done`);
		})
	);
};
