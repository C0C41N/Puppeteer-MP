import { prompt } from './common/util';
import { dlThumbs } from './services/dlThumbs';
import { fetchTitles } from './services/fetchTitles';
import { listing } from './services/listing';

const init = async () => {
	const text =
		'\n\n\t1 - Fetch titles\n\n\t2 - Download thumbs' +
		'\n\n\t3 - List\n\nEnter\t';

	const choice = await prompt(text);

	switch (choice) {
		case '1':
			await fetchTitles();
			break;

		case '2':
			await dlThumbs();
			break;

		case '3':
			await listing();
			break;

		case 'all':
			await fetchTitles();
			await dlThumbs();
			await listing();
			break;
	}

	process.exit(0);
};

init();
