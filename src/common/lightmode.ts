import type { Page } from 'puppeteer';

const ENABLELIGHTMODE = false;

export const enableLightMode = async (page: Page) => {
	if (!ENABLELIGHTMODE) return;

	await page.setRequestInterception(true);

	page.on('request', request => {
		if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
			request.respond({
				status: 200,
				body: '',
			});
		} else {
			request.continue();
		}
	});
};
