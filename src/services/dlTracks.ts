import { MultiBar, Presets } from 'cli-progress';
import { createWriteStream, readFileSync } from 'fs';
import * as ytdl from 'ytdl-core';

import { Tracks } from '../common/types';
import { getResourcesFolder, getTracksFilePath, log } from '../common/util';

import type { downloadOptions } from 'ytdl-core';
export const dlTracks = async () => {
	// reading file

	const tracksFile = getTracksFilePath();
	const data = readFileSync(tracksFile, { encoding: 'utf8' });

	const tracks: Tracks = JSON.parse(data.trim());

	// setup progress bars

	const multibar = new MultiBar(
		{
			clearOnComplete: true,
			hideCursor: true,
			format: '{bar} {percentage}% | {track}',
			fps: 60,
			autopadding: true,
		},
		Presets.shades_classic
	);

	// ytdl-core

	await Promise.all(
		Object.entries(tracks).map(async ([title, url]) => {
			log(`${title} | dl started`);

			const options: downloadOptions = {
				filter: format => format.container === 'mp4',
				quality: 'highestaudio',
			};

			const bar = multibar.create(100, 0);

			const stream = ytdl(url, options);

			const file = `${getResourcesFolder()}/${title}`;

			stream.pipe(createWriteStream(file));

			stream.on('progress', (_, downloaded: number, total: number) => {
				const percent = (downloaded * 90) / total;
				bar.update(percent);
			});

			return new Promise<void>(resolve => {
				stream.once('end', () => {
					log(`${title} | Done`);
					multibar.stop();
					resolve();
				});
			});
		})
	);

	log('All Done');
};
