import { readFileSync, writeFileSync } from 'fs';
import getYTID from 'get-youtube-id';
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

			const vId = getYTID(url, { fuzzy: false });
			const file = `${getThumbsFolder()}/${title}.jpg`;

			const imgURLs = [
				`https://i.ytimg.com/vi/${vId}/maxresdefault.jpg`,
				`https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
			];

			for (const u of imgURLs) {
				try {
					const view = await page.goto(u, { waitUntil: 'networkidle0' });
					const dlImgBuffer = await view.buffer();

					const buffer = await sharp(dlImgBuffer)
						.resize({ width: 700, height: 525, fit: 'contain' })
						.toBuffer();

					writeFileSync(file, buffer);

					if (view.status() === 200) break;
				} catch (error) {
					console.log({ error });
				}
			}

			page.close();
			log(`${title} | Done`);
		})
	);
};
