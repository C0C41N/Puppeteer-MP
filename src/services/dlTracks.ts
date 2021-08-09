import { MultiBar, Presets } from 'cli-progress';
import { createWriteStream, readFileSync } from 'fs';
import * as ytdl from 'ytdl-core';

import { Tracks } from '../common/types';
import { getTracksFilePath, getTracksFolder, log } from '../common/util';

import type { downloadOptions } from 'ytdl-core';

export const dlTracks = async () => {
	// reading file

	const tracksFile = getTracksFilePath();
	const data = readFileSync(tracksFile, { encoding: 'utf8' });

	const tracks: Tracks = JSON.parse(data.trim());

	// make folder

	const folder = getTracksFolder();

	// setup progress bars

	const multibar = new MultiBar(
		{
			clearOnComplete: true,
			hideCursor: true,
			format: '{bar} {percentage}% | {title}',
			fps: 60,
			autopadding: true,
		},
		Presets.shades_classic
	);

	// ytdl-core

	await Promise.all(
		Object.entries(tracks).map(async ([title, url]) => {
			const options: downloadOptions = {
				filter: format => format.container === 'mp4',
				quality: 'highestaudio',
			};

			const bar = multibar.create(100, 0, { title });

			const stream = ytdl(url, options);

			const file = `${folder}/${title}.mp3`;

			stream.pipe(createWriteStream(file));

			stream.on('progress', (_, downloaded: number, total: number) => {
				const percent = (downloaded * 100) / total;
				bar.update(percent);
			});

			return new Promise<void>(resolve => {
				stream.once('end', () => {
					bar.stop();
					resolve();
				});
			});
		})
	);

	multibar.stop();

	log('All Done', { preLines: 2 });
};
