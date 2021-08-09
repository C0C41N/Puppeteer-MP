import { createWriteStream, readFileSync } from 'fs';
import * as ytdl from 'ytdl-core';

import { Tracks } from '../common/types';
import { getResourcesFolder, getTracksFilePath, log } from '../common/util';

import type { downloadOptions } from 'ytdl-core';

export const dlTracks = async () => {
	// Reading file

	const tracksFile = getTracksFilePath();
	const data = readFileSync(tracksFile, { encoding: 'utf8' });

	const tracks: Tracks = JSON.parse(data.trim());

	// ytdl-core

	await Promise.all(
		Object.entries(tracks).map(async ([title, url]) => {
			log(`${title} | dl started`);

			const options: downloadOptions = {
				filter: format => format.container === 'mp4',
				quality: 'highestaudio',
			};

			const stream = ytdl(url, options);

			const file = `${getResourcesFolder()}/${title}`;

			stream.pipe(createWriteStream(file));

			return new Promise<void>(resolve => {
				stream.once('end', () => {
					log(`${title} | Done`);
					resolve();
				});
			});
		})
	);

	log('All Done');
};
