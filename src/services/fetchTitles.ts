import { writeFileSync } from 'fs';

import { getTitlesFilePath, log } from '../common/util';
import { loginTillEIds } from './shared';

export const fetchTitles = async () => {
	const data = await loginTillEIds();

	if (!data) return;

	log('reading titles');

	const { elIds, page } = data;

	const titles = await elIds.reduce(async (a, e) => {
		const sel = `#${e} > td.title > a`;
		const title = await page.$eval(sel, el => el.innerHTML);
		return [...(await a), title];
	}, Promise.resolve(<string[]>[]));

	const file = getTitlesFilePath();

	log('writing file');

	writeFileSync(file, JSON.stringify(titles, null, '\t'));

	log('done\n\n');
};
