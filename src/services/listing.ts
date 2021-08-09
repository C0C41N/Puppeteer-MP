import { existsSync } from 'fs';
import * as puppeteer from 'puppeteer';

import { getThumbsFolder, log, numChildren } from '../common/util';
import { loginTillEIds } from './shared';

export const listing = async () => {
	const data = await loginTillEIds();

	if (!data) return;

	const { browser, elCount, elIds, page } = data;

	// get links to edit unlisted products

	const addresses = await elIds.reduce(async (a, e) => {
		const edit = `#${e} > td.actions > div > ul > li:nth-child(3) > a`;
		(await a).push(await page.$eval(edit, (e: HTMLLinkElement) => e.href));
		return a;
	}, Promise.resolve(<string[]>[]));

	// close main tab

	page.close();

	// open new tabs (quick-filled)

	const editPages: puppeteer.Page[] = await new Array(elCount)
		.fill('')
		.reduce(async (a, _, i) => {
			const editPage = await browser.newPage();
			await editPage.goto(addresses[i] + '&copy_product_id=22419276');
			return [...(await a), editPage];
		}, Promise.resolve(<puppeteer.Page[]>[]));

	// Fill in product details

	log('adding details');

	const titles = await Promise.all(
		editPages.map(async e => {
			// clear SKU

			await e.waitForSelector('#product_sku');
			await e.$eval('#product_sku', (e: HTMLInputElement) => (e.value = ''));

			// check Active

			await e.click('#product_item_status_active');

			// get Title of item

			const title = await e.$eval(
				'#product_en-US_name',
				(e: HTMLInputElement) => e.value
			);

			// put description

			await e.$eval(
				'#product_en-US_description',
				(e: HTMLTextAreaElement, title: string) => (e.value = title),
				title
			);

			// put keywords

			const keywords = title.split(' ').join(', ') + ", feat, ft., ft, didn't";

			await e.$eval(
				'#product_en-US_keywords',
				(e: HTMLTextAreaElement, keywords: string) => (e.value = keywords),
				keywords
			);

			// upload image

			await e.click('#upload-image-link');

			await e.waitForSelector('#image-upload-button');

			return title;
		})
	);

	for (const e of editPages) {
		await e.bringToFront();

		await e.hover('#image-upload-button');

		await e.waitForSelector('input[name="image[attachment]"]');
	}

	await Promise.all(
		editPages.map(async (e, i) => {
			const uploadEl = await e.$('input[name="image[attachment]"]');

			const folder = `${getThumbsFolder()}/${titles[i]}`;
			if (!existsSync(folder)) throw Error("Can't find file to upload");

			const filePath = [0, 1]
				.map(x => {
					const jpeg = `${folder}/${x}.jpg`;
					const png = `${folder}/${x}.png`;
					return existsSync(jpeg) ? jpeg : existsSync(png) ? png : null;
				})
				.filter(e => e !== null)[0];

			if (!filePath) throw Error("Can't find file to upload");

			const imagesChanged = () =>
				new Promise<void>(async resolve => {
					const sel = '#image-list';

					const count = await numChildren(e, sel);

					const interval = setInterval(async () => {
						const xount = await numChildren(e, sel);
						if (count < xount) {
							clearInterval(interval);
							resolve();
						}
					}, 250);
				});

			log('uploading file');

			await Promise.all([imagesChanged(), uploadEl.uploadFile(filePath)]);

			const submit =
				'.form-buttons > button[class="button cart-button"][type="submit"]';

			log('submitting');

			const clicker = () =>
				new Promise<void>(resolve => {
					const interval = setInterval(async () => {
						try {
							await e.click(submit);
							resolve();
						} catch (error) {
							clearInterval(interval);
						}
					}, 500);
				});

			await Promise.all([e.waitForNavigation(), clicker()]);

			e.close();

			log(`${titles[i]} // done\n`, { preLines: 1 });
		})
	);

	log('All Done\n', { preLines: 1 });
};
