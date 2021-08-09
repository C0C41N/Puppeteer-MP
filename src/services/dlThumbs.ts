import { readFileSync, writeFileSync } from 'fs';
import * as puppeteer from 'puppeteer';

import { headless } from '../common/const';
import { getTitleFolder, getTitlesFilePath, log } from '../common/util';

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

			const query = encodeURIComponent(`vevo official ${title}`);
			const link = `https://www.google.com/search?q=${query}&tbm=isch&tbs=isz:l`;

			const folder = getTitleFolder(title);

			for (const i of [0, 1]) {
				await page.goto(link);

				const image = `div[data-ri="${i}"] > a > div > img`;

				await page.waitForSelector(image);
				await page.click(image);

				const imageLarge = 'a[rlhc] > img[data-noaft]';

				await page.waitForSelector(imageLarge);

				const getsrc = () =>
					new Promise<string>(resolve => {
						const interval = setInterval(async () => {
							const e = await page.$eval(imageLarge, e =>
								e.getAttribute('src')
							);
							if (e.substr(0, 5) !== 'data:') {
								clearInterval(interval);
								resolve(e);
							}
						}, 250);
					});

				const src = await getsrc();

				try {
					const view = await page.goto(src, { waitUntil: 'networkidle0' });
					const ext = src.substr(-4);
					const file = `${folder}/${i}${ext}`;

					writeFileSync(file, await view.buffer());
				} catch (error) {
					console.log({ error });
				}
			}

			page.close();

			log(`${title} | Done`);
		})
	);
};
