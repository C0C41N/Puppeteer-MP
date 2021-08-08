import { existsSync } from 'fs';
import { resolve } from 'path';
import * as puppeteer from 'puppeteer';

import { numChildren } from '../common/util';
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

	console.log('| adding details');

	for (const e of editPages) {
		await e.bringToFront();

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

		await e.hover('#image-upload-button');

		await e.waitForSelector('input[name="image[attachment]"]');

		const uploadEl = await e.$('input[name="image[attachment]"]');

		const tmpFilePath = resolve(`resources/${title}`);
		const jpeg = tmpFilePath + '.jpg';
		const png = tmpFilePath + '.png';

		const filePath = existsSync(jpeg) ? jpeg : existsSync(png) ? png : null;

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

		console.log('| uploading file');

		await Promise.all([imagesChanged(), uploadEl.uploadFile(filePath)]);

		console.log('| upload done');

		const submit =
			'.form-buttons > button[class="button cart-button"][type="submit"]';

		console.log('| submitting');

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

		console.log(`\n| ${title} // done\n`);
	}

	console.log('\n| All Done\n');
};
