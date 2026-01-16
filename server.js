// Server.js - providing test REST APIs

const express = require("express");
const cors = require("cors");
const artistNames = require("./data/artistNames");
const albumNames = require("./data/albumNames");

const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:4200',
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
    return res.status(404).json({ message: `Album not found for this ${artist.artistName}` });
  }

  res.json(album);
});

// GET /albums → list all albums from all artists
app.get("/albums", (req, res) => {
  //const allAlbums = artists.flatMap(a => a.albums);
  res.json(allAlbums);
});


// ------------------------------
// Statically Hosted Images
// ------------------------------
app.use(express.static('public'));

// ------------------------------
// Start server
// ------------------------------
app.listen(PORT, () => {
  console.log(`Test Catalog server running on http://localhost:${PORT}`);
});
