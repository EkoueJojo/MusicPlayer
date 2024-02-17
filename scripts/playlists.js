/*
 * Author : EkoueJojo
 * Date : 26/02/23
 */

let editNumber = null;

showPlaylists();

/**
 * Create a list of music tracks based on a YouTube playlist or a custom list of different videos
 * @param {string} title
 * @param {string[] | string} list
 */
function createPlaylist(title, list)
{
	if (title == "")
		return;
	if (list == "")
		return;

	let playlists = JSON.parse(localStorage.getItem("Playlists")) ?? [];

	playlists[editNumber ?? playlists.length] = new Playlist(title, list);
	playlists.sort((a, b) => a.title.localeCompare(b.title));
	localStorage.setItem("Playlists", JSON.stringify(playlists));

	editNumber = null;
	showPlaylists();
}

function showPlaylists()
{
	let mainContainer = document.getElementById("PlaylistContainer");
	mainContainer.innerHTML = "";

	let playlists = JSON.parse(localStorage.getItem("Playlists")) ?? [];
	document.getElementById("ImportArea").value = JSON.stringify(playlists, null, "\t");

	for (let i = 0; i < playlists.length; i++)
	{
		let playlist = playlists[i];

		let playlistContainer = document.createElement("div");

		let playlistTitle = document.createElement("h2");
		playlistTitle.innerText = playlist.title;

		let playButtonLink = document.createElement("a");
		playButtonLink.href = "./pages/player.html?no=" + i;

		let playButton = document.createElement("button");
		playButton.innerText = "Écouter";

		let deleteButton = document.createElement("button");
		deleteButton.innerText = "Supprimer"
		deleteButton.addEventListener("click", () => { deletePlaylist(i) });

		playButtonLink.appendChild(playButton);

		playlistContainer.appendChild(playlistTitle);
		playlistContainer.appendChild(playButtonLink);

		if (playlist.isCustom)
		{
			let editButton = document.createElement("button");
			editButton.innerText = "Modifier";
			editButton.addEventListener
				(
					"click",
					() =>
					{
						editNumber = i;
						document.getElementById("CustomPlaylistTitle").value = playlist.title;
						document.getElementById("CustomPlaylistId").value = JSON.stringify(playlist.tracks, null, "\t");
						document.getElementById("CreateCustomPlaylistButton").innerText = "Modifier";
						document.getElementById("CustomPlaylistCreationPopup").showModal();
					}
				);

			playlistContainer.appendChild(editButton);
		}

		playlistContainer.appendChild(deleteButton);
		mainContainer.appendChild(playlistContainer);
	}
}

function OpenCustomPlaylistCreationPopup()
{
	document.getElementById("CustomPlaylistTitle").value = "";
	document.getElementById("CustomPlaylistId").value = "";
	document.getElementById("CreateCustomPlaylistButton").innerText = "Créer";
	document.getElementById("CustomPlaylistCreationPopup").showModal();
}

function deletePlaylist(index)
{
	let playlists = JSON.parse(localStorage.getItem("Playlists")) ?? [];

	if (!Object.keys(playlists).includes(index.toString()))
		return;
	if (!confirm(`Êtes-vous sûr de vouloir supprimer la playlist "${playlists[index].title}" ?`))
		return;

	playlists.splice(index, 1);
	localStorage.setItem("Playlists", JSON.stringify(playlists));

	showPlaylists();
}

function ImportPlaylists()
{
	localStorage.setItem("Playlists", document.getElementById("ImportArea").value);
	showPlaylists();
}