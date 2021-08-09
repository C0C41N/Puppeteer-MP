import * as puppeteer from 'puppeteer';

import { headless } from '../common/const';
import { getCREDS } from '../common/crypto';
import { log, numChildren } from '../common/util';

export const loginTillEIds = async () => {
	log('Starting...\n\n', { preLines: 2 });
	// starting browser

	const browser = await puppeteer.launch({
		headless,
		defaultViewport: null,
		args: ['--start-maximized'],
	});

	const page = (await browser.pages())[0];

	page.setViewport({ width: 1920, height: 1080 });

	// log in

	await page.goto(
		'https://id.secondlife.com/openid/login?return_to=https%3A%2F%2Fmarketplace.secondlife.com%2Fmerchants%2F7465107%2Fstore%2Fproducts%3Fproduct_state%3Dunlisted%26page%3D1%26per_page%3D100%26per_page%3D100'
	);

	await page.waitForSelector('#username');

	const { username, password } = getCREDS();

	await page.type('#username', username);
	await page.type('#password', password);

	await page.click('#loginform > div.clearfix > button');

	// goto marketplace

	await page.waitForSelector('#dd_items');

	log('logged in');

	// count unlisted items

	const elCount = await numChildren(page, '#dd_items > tbody');

	if (elCount === 0) return log('no unlisted elements');

	log('unlisted elements found');

	const elIds = await page.$eval(
		'#dd_items > tbody',
		(e, elCount) =>
			new Array(elCount).fill('').map((_, i) => e.children.item(i).id),
		elCount
	);

	return {
		page,
		browser,
		elCount,
		elIds,
	};
};
