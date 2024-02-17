/*
 * Author : EkoueJojo
 * Date : 26/02/23
 */

class Playlist
{
	title;
	tracks;
	isCustom;

	constructor(title, tracks)
	{
		this.title = title;
		this.tracks = tracks;
		this.isCustom = typeof tracks == "object";
	}
}