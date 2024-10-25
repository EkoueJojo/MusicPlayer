/*
 * Author : EkoueJojo
 * Date : 26/02/23
 */

let player;
let originalPlaylist = [];
let playlist = [];
let playlistIndex = new URLSearchParams(window.location.search).get("no");
let list = JSON.parse(localStorage.getItem("Playlists"))[playlistIndex];
let videoIndex = 0;

let videoIsPlaying = false;
let randomIsEnabled = false;
let startedPlaying = false;

document.getElementById("VideoVolumeSlider").addEventListener("input", ChangeVolume);

function onYouTubeIframeAPIReady()
{
	if (list == null)
	{
		location.href = "../index.html";
	}

	if (!list.isCustom)
	{
		document.getElementById("PlaylistTitleLink").href = "https://www.youtube.com/playlist?list=" + list.tracks;
	}

	let playlistTitle = document.getElementById("PlaylistTitle");
	playlistTitle.value = list.title;

	let playerInfos =
	{
		playerVars: { controls: 0, disablekb: 1, rel: 0 },
		events:
		{
			"onReady": function ()
			{
				originalPlaylist = list.isCustom ? list.tracks : player.getPlaylist();
				ListPlaylistVideos();

				playlist = originalPlaylist;
				player.cueVideoById(playlist[0].id);

				for (let button of document.getElementById("MediaButtons").children)
				{
					button.disabled = false;
				}

				SetVideoVolume();
			},
			"onStateChange": function (event)
			{
				videoIsPlaying = false;

				switch (event.data)
				{
					case YT.PlayerState.PLAYING:
						startedPlaying = true;
						videoIsPlaying = true;
						break;
					case YT.PlayerState.ENDED:
						if (videoIndex < playlist.length - 1)
						{
							videoIndex++;
							LoadVideo();
						}
						break;
				}

				UpdateView();
				UpdateVideoName();
			}
		}
	};

	if (!list.isCustom)
	{
		playerInfos.playerVars.list = list.tracks;
	}

	player = new YT.Player("YoutubePlayer", playerInfos);
}

function UpdateView()
{
	EnableButtons();

	let videoTitleLink = document.getElementById("VideoTitleLink");

	videoTitleLink.href = player.getVideoUrl();

	if (!list.isCustom)
	{
		videoTitleLink.href += "&list=" + list.tracks;
	}

	let videoTitle = player.videoTitle;

	document.getElementById("VideoTitle").innerText = videoTitle;
	document.title = videoTitle;

	document.getElementById("VideoThumbnail").src = `https://img.youtube.com/vi/${player.getVideoData().video_id}/0.jpg`;

	document.getElementById("Play").innerText = videoIsPlaying ? "⏸" : "▶";

	let currentPlaylistVideo = document.getElementById("CurrentPlaylistVideo");

	if (currentPlaylistVideo != null)
	{
		currentPlaylistVideo.id = "";
	}

	currentPlaylistVideo = document.getElementsByClassName("PlaylistVideo")[originalPlaylist.indexOf(playlist[videoIndex])];

	if (currentPlaylistVideo != null)
	{
		currentPlaylistVideo.id = "CurrentPlaylistVideo";
		currentPlaylistVideo.scrollIntoView({ behavior: "smooth", block: "center" });
	}
}

function UpdateVideoName()
{
	playlist[videoIndex].title = player.videoTitle;

	if (player.videoTitle != "")
	{
		document.getElementById("CurrentPlaylistVideo").firstElementChild.firstElementChild.innerText = player.videoTitle;
	}

	let newList = JSON.parse(localStorage.getItem("Playlists"));
	newList[playlistIndex] = list;
	localStorage.setItem("Playlists", JSON.stringify(newList));
}

function EnableButtons()
{
	document.getElementById("Previous").disabled = videoIndex <= 0;
	document.getElementById("Next").disabled = videoIndex >= playlist.length - 1;
}

function Play()
{
	if (videoIsPlaying)
	{
		player.pauseVideo();
	}
	else
	{
		player.playVideo();
	}
}

function LoadVideo()
{
	player.loadVideoById(playlist[videoIndex].id);
	SetVideoVolume();
	EnableButtons();
	UpdateVideoName();
}

function LoadPreviousVideo()
{
	videoIndex--;
	LoadVideo();
}

function LoadNextVideo()
{
	videoIndex++;
	LoadVideo();
}

function EnableRandom(event)
{
	randomIsEnabled = !randomIsEnabled;

	if (randomIsEnabled)
	{
		let tempPlaylist = [...playlist];
		let currentVideo;

		if (startedPlaying)
		{
			currentVideo = tempPlaylist.splice(videoIndex, 1);
		}

		tempPlaylist.sort(() => 0.5 - Math.random());

		if (startedPlaying)
		{
			tempPlaylist.unshift(currentVideo);
			videoIndex = 0;
		}

		playlist = tempPlaylist;

		if (!startedPlaying)
		{
			LoadVideo();
		}
	}
	else
	{
		videoIndex = originalPlaylist.indexOf(playlist[videoIndex]);
		playlist = originalPlaylist;
	}

	EnableButtons();

	event.target.style.backgroundColor = randomIsEnabled ? "forestgreen" : "";
}

function ChangeVolume()
{
	localStorage.setItem("Volume", parseInt(document.getElementById("VideoVolumeSlider").value));
	SetVideoVolume();
}

function SetVideoVolume()
{
	let volume = localStorage.getItem("Volume") ?? 100;

	player.setVolume(volume);
	document.getElementById("VideoVolumeSlider").value = volume;
}

function ListPlaylistVideos()
{
	let listElement = document.getElementById("Playlist");

	for (let i = 0; i < originalPlaylist.length; i++)
	{
		let video = originalPlaylist[i];
		let videoLi = document.createElement("li");
		videoLi.className = "PlaylistVideo";
		let videoContainer = document.createElement("div");
		videoContainer.title = "Play";
		let videoTitle = document.createElement("p");

		videoContainer.addEventListener
		(
			"click",
			function ()
			{
				if (videoIndex != playlist.indexOf(video))
				{
					videoIndex = playlist.indexOf(video);
					LoadVideo();
				}
			}
		)

		videoTitle.innerText = video.title != null && video.title != "" ? video.title : video.id;

		videoContainer.appendChild(videoTitle);
		videoLi.appendChild(videoContainer);
		listElement.appendChild(videoLi);
	}
}

function RenamePlaylist(event)
{
	if (event.target.value != "")
	{
		let playlistsInStorage = JSON.parse(localStorage.getItem("Playlists"));
		playlistsInStorage[playlistIndex].title = event.target.value;
		localStorage.setItem("Playlists", JSON.stringify(playlistsInStorage));
	}
}