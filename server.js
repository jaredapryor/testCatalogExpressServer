// Server.js - providing test REST APIs for Test Catalog

require('dotenv').config();
const express = require("express");
const cors = require("cors");
const artistNames = require("./data/artistNames");
const albumNames = require("./data/albumNames");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ------------------------------
// Generate 30 artists with albums
// ------------------------------

const certifications = ["None", "Silver", "Gold", "Platinum", "Multi-Platinum", "Diamond"];
const labels = ["Northwind Records", "Blue Horizon", "Sunburst Music", "Iron Gate", "CrystalTone", "Crazy Music", "In Our Lifetime", "Trailblazer Inc", "Down for the Cause Records"];
const countries = ["USA", "UK", "Canada", "Australia", "Germany", "Sweden", "Brazil", "South Africa", "Nigeria", "South Korea", "Japan", "India"];

function generateArtists() {
  const artists = [];
  let albumNameId = 1;

  // Randomize album list
  const copyAlbumNames = [...albumNames];
  let newAlbumNames = [];

  while (copyAlbumNames.length > 0) {
    const randIndex = Math.floor(Math.random() * copyAlbumNames.length);
    const albumName = copyAlbumNames[randIndex];
    newAlbumNames.push(albumName);
    copyAlbumNames.splice(randIndex, 1);
  }

  for (let i = 1; i <= 30; i++) {
    const albumCount = Math.floor(Math.random() * 9) + 2; // 2–10 albums
    const artistName = artistNames[i - 1];
    const albums = [];

    for (let j = 1; j <= albumCount; j++) {
      const albumName = newAlbumNames[albumNameId - 1];
      const globalAlbumId = albumNameId;
      albumNameId = albumNameId + 1;

      const certification = certifications[Math.floor(Math.random() * certifications.length)];      
      let numberOfAlbumsSold = 0;
      switch (certification) {
        case 'None': {
            numberOfAlbumsSold = Math.floor(Math.random() * 175000) + 25000;
            break;
        }
        case 'Silver': {
            numberOfAlbumsSold = Math.floor(Math.random() * 289950) + 210050;
            break; 
        }
        case 'Gold': {
            numberOfAlbumsSold = Math.floor(Math.random() * 444175) + 555825;
            break;
        }
        case 'Platinum': {
            numberOfAlbumsSold = Math.floor(Math.random() * 999400) + 1000600;
            break;
        }
        case 'Multi-Platinum': {
            numberOfAlbumsSold = Math.floor(Math.random() * 7891225) + 2108775;
            break;
        }
        case 'Diamond': {
            numberOfAlbumsSold = Math.floor(Math.random() * 18000000) + 10564800;
            break;
        }
      }

      albums.push({
        albumId: j,
        globalAlbumId: globalAlbumId,
        albumName: albumName,
        albumImageRandNum: parseFloat(Math.random().toFixed(6)),
        artistName: artistName,
        artistId: i,
        recordLabel: labels[Math.floor(Math.random() * labels.length)],
        publicationYear: 1990 + Math.floor(Math.random() * 34),
        albumsSold: numberOfAlbumsSold,
        certification: certification,
        numberOfSingles: Math.floor(Math.random() * 6) + 1,
        numberOfTracks: Math.floor(Math.random() * 8) + 8,
        availableOnStreaming: Math.random() > 0.1
      });
    }

    const numOfMembers = Math.floor(Math.random() * 5) + 1;

    artists.push({
      artistId: i,      
      artistName: artistName,
      artistImageRandNum: parseFloat(Math.random().toFixed(6)),
      yearStarted: 1970 + Math.floor(Math.random() * 50),
      numberOfMembers: numOfMembers,
      isGroup: numOfMembers > 1,
      countryOfOrigin: countries[Math.floor(Math.random() * countries.length)],
      isTouring: Math.random() > 0.5,
      numberOfAlbumsReleased: albumCount,
      albums
    });
  }

  return artists;
}

const artists = generateArtists();
const allAlbums = artists.flatMap(a => a.albums);

// ------------------------------
// REST ENDPOINTS
// ------------------------------

// GET /artists → list all artists
app.get("/artists", (req, res) => {
  res.json(artists);
});

// GET /albums → list all albums from all artists
app.get("/albums", (req, res) => {
  res.json(allAlbums);
});

// GET /artists/number → list the number of artists
app.get("/artists/number", (req, res) => {
  if (!artists) {
    return res.json({ numberOfArtists: 0 });
  } else {
    return res.json({ numberOfArtists: artists.length });
  }
});

// GET /albums/number → list the number of albums
app.get("/albums/number", (req, res) => {
  if (!allAlbums) {
    return res.json({ numberOfAlbums: 0 });
  } else {
    return res.json({ numberOfAlbums: allAlbums.length });
  }
});


// GET /artists/:artistId → get a single artist
app.get("/artists/:artistId", (req, res) => {
  const id = parseInt(req.params.artistId, 10);
  const artist = artists.find(a => a.artistId === id);

  if (!artist) {
    return res.status(404).json({ message: "Artist not found" });
  }

  res.json(artist);
});

// GET /artists/:artistId/:albumId → get a specific album from that artist
app.get("/artists/:artistId/:albumId", (req, res) => {
  const artistId = parseInt(req.params.artistId, 10);
  const albumId = parseInt(req.params.albumId, 10);

  const artist = artists.find(a => a.artistId === artistId);
  if (!artist) {
    return res.status(404).json({ message: "Artist not found" });
  }

  const album = artist.albums.find(a => a.albumId === albumId || a.globalAlbumId === albumId);
  if (!album) {
    return res.status(404).json({ message: `Album not found for artist ${artist.artistName}` });
  }

  res.json(album);
});

// GET /albums/:globalAlbumId → get a specific album
app.get("/albums/:globalAlbumId", (req, res) => {
  const globalAlbumId = parseInt(req.params.globalAlbumId, 10);

  const album = allAlbums.find(a => a.globalAlbumId === globalAlbumId);
  if (!album) {
    return res.status(404).json({ message: "Album not found" });
  }

  res.json(album);
});

// DELETE /artists/:artistId → delete a specific artist (and all the albums from that artist)
app.delete("/artists/:artistId", (req, res) => {
  const artistId = parseInt(req.params.artistId, 10);

  const artistIndex = artists.findIndex(a => a.artistId === artistId);
  if (artistIndex === -1) {
    return res.status(404).json({ message: "Artist not found for deletion" });
  } else {
    const deletedArtist = artists.splice(artistIndex, 1)[0];
    const albums = deletedArtist.albums;
    for (var i = 0; i < albums.length; i++) {
      const album = albums[i];
      const index = allAlbums.findIndex(a => a.globalAlbumId === album.globalAlbumId);
      allAlbums.splice(index, 1);
    }

    return res.json({
      //message: "Artist and albums deleted successfully",
      message: `Successfully deleted ${deletedArtist.artistName} and all of their albums!`,
      deletionType: 'artist',
      deleted: true,
      artist: deletedArtist
    });
  }
});

// DELETE /artists/:artistId/:albumId → delete a specific album from that artist
app.delete("/artists/:artistId/:albumId", (req, res) => {
  const artistId = parseInt(req.params.artistId, 10);
  const albumId = parseInt(req.params.albumId, 10);

  const artist = artists.find(a => a.artistId === artistId);
  if (!artist) {
    return res.status(404).json({ message: "Artist not found for album deletion" });
  }

  const index = artist.albums.findIndex(a => a.albumId === albumId);
  if (index !== -1) {
    const deletedAlbum = artist.albums.splice(index, 1)[0];
    artist.numberOfAlbumsReleased = artist.albums.length;
    if (deletedAlbum !== undefined && deletedAlbum !== null && deletedAlbum.globalAlbumId !== -1) {
      const index2 = allAlbums.findIndex(a => a.globalAlbumId === deletedAlbum.globalAlbumId);
      const deletedAlbum2 = allAlbums.splice(index2, 1)[0];
      if (deletedAlbum !== deletedAlbum2) {
        console.log("There was a problem with deletion. The album deleted from the artist isn't the same as the album deleted from the albums collection.")
        console.log("Arist version:". deletedAlbum);
        console.log("All Albums version:", deletedAlbum2);
      }
    }

    return res.json({
      message: `Successfully deleted ${deletedAlbum.albumName} (${deletedAlbum.publicationYear}) by ${deletedAlbum.artistName}!`,
      deletionType: 'album',
      deleted: true,
      album: deletedAlbum
    });
  } else {    
    res.status(404).json({ message: `Album not found for artist ${artist.artistName}` });
  }
});

// DELETE /albums/:globalAlbumId → delete a specific album
app.delete("/albums/:globalAlbumId", (req, res) => {
  const globalAlbumId = parseInt(req.params.globalAlbumId, 10);
  
  const index = allAlbums.findIndex(a => a.globalAlbumId === globalAlbumId);
  if (index !== -1) {
    const deletedAlbum = allAlbums.splice(index, 1)[0];
    if (deletedAlbum !== undefined && deletedAlbum !== null && deletedAlbum.artistId !== -1 &&
      deletedAlbum.albumId !== -1) {
        const artist = artists.find(a => a.artistId === deletedAlbum.artistId);
        if (artist) {
          const index2 = artist.albums.findIndex(a => a.albumId === deletedAlbum.albumId);
          const deletedAlbum2 = artist.albums.splice(index2, 1)[0];
          artist.numberOfAlbumsReleased = artist.albums.length;
          if (deletedAlbum !== deletedAlbum2) {
            console.log("There was a problem with deletion. The album deleted from the artist isn't the same as the album deleted from the albums collection.")
            console.log("Arist version:". deletedAlbum);
            console.log("All Albums version:", deletedAlbum2);
          }
        }
    }

    return res.json({
      message: `Successfully deleted ${deletedAlbum.albumName} (${deletedAlbum.publicationYear}) by ${deletedAlbum.artistName}.`,
      deletionType: 'album',
      deleted: true,
      album: deletedAlbum
    });
  } else {
    res.status(404).json({ message: `Album not found` });
  }
});

// ------------------------------
// Statically Hosted Images
// ------------------------------
app.use(express.static('public'));

// ------------------------------
// Start server
// ------------------------------
app.listen(PORT, () => {
  console.log(`Test Catalog server running on ${process.env.SERVER_URL}:${PORT}`);
});
