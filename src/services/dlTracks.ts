import { readFileSync } from 'fs';

import { Tracks } from '../common/types';
import { getTracksFilePath } from '../common/util';

export const dlTracks = async () => {
	// Reading file

	const file = getTracksFilePath();
	const data = readFileSync(file, { encoding: 'utf8' });

	const tracks: Tracks = JSON.parse(data.trim());

	console.log(tracks);
};
