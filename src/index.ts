import { log, prompt } from './common/util';
import { dlThumbs } from './services/dlThumbs';
import { dlTracks } from './services/dlTracks';
import { fetchTitles } from './services/fetchTitles';
import { listing } from './services/listing';

const init = async () => {
	const text =
		'\n\n1 - Fetch titles\n\n2 - Download thumbs' +
		'\n\n3 - List\n\n4 - Dowanload tracks\n\nEnter\t';

	const choice = await prompt(text);

	log('', { cls: true, decor: false, preLines: 2 });

	switch (choice) {
		case '1':
			await fetchTitles();
			await init();
			break;

		case '2':
			await dlThumbs();
			await init();
			break;

		case '3':
			await listing();
			await init();
			break;

		case '4':
			await dlTracks();
			await init();
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
