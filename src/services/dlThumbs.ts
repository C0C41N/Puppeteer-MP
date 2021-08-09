import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import * as puppeteer from 'puppeteer';

import { headless } from '../common/const';
import { getTitlesFilePath } from '../common/util';

export const dlThumbs = async () => {
	// Reading file

	const file = getTitlesFilePath();
	const data = readFileSync(file, { encoding: 'utf8' });

	const titles: string[] = JSON.parse(data.trim());

	// starting browser

	const browser = await puppeteer.launch({
		headless,
		defaultViewport: null,
		args: ['--start-maximized'],
	});

	// dl images

	await Promise.all(
		titles.map(async title => {
			const page = await browser.newPage();

			const query = encodeURIComponent(title);
			const link = `https://www.google.com/search?q=${query}&tbm=isch&tbs=isz:l`;

			await page.goto(link);

			const firstImage = 'div[data-ct="0"] > a > div > img';

			await page.waitForSelector(firstImage);
			await page.click(firstImage);

			const alt = await page.$eval(firstImage, e => e.getAttribute('alt'));
			const imageLarge = `img[data-noaft="1"][alt="${alt}"]`;

			await page.waitForSelector(imageLarge);

			const getsrc = () =>
				new Promise<string>(resolve => {
					const interval = setInterval(async () => {
						const e = await page.$eval(imageLarge, e => e.getAttribute('src'));
						if (e.substr(0, 5) !== 'data:') {
							clearInterval(interval);
							resolve(e);
						}
					}, 250);
				});

			const src = await getsrc();

			const view = await page.goto(src, { waitUntil: 'networkidle0' });
			const ext = src.substr(-4);
			const file = resolve(`resources/${title}${ext}`);

			writeFileSync(file, await view.buffer());

			page.close();

			console.log(`| ${title} | Done`);
		})
	);
};
