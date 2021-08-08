import { writeFileSync } from 'fs';

import { getTitlesFilePath } from '../common/util';
import { loginTillEIds } from './shared';

export const fetchTitles = async () => {
	const data = await loginTillEIds();

	if (!data) return;

	console.log('| reading titles');

	const { elIds, page } = data;

	const titles = await elIds.reduce(async (a, e) => {
		const sel = `#${e} > td.title > a`;
		const title = await page.$eval(sel, el => el.innerHTML);
		return [...(await a), title];
	}, Promise.resolve(<string[]>[]));

	const file = await getTitlesFilePath();

	console.log('| writing file');

	writeFileSync(file, JSON.stringify(titles, null, '\t'));

	console.log('| done\n\n');
};
