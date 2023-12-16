import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Spotify Clone",
  password: "aryansaini9999",
  port: 5432,
});
db.connect();

var current_user = 1;
const app = express();
const port = 3000;
var greetings;
var playlist = [];
var poster = [];
var likedSongsCount = 0;
var current_username;
app.use(
  "/public",
  express.static("public", {
    extensions: ["css"],
    setHeaders: (res, path, stat) => {
      res.set("Content-Type", "text/css");
    },
  })
);
app.set("view engine", "ejs");
app.use(express.static("static"));
app.use(
  "/scripts",
  express.static("scripts", {
    extensions: ["js"],
    setHeaders: (res, path, stat) => {
      res.set("Content-Type", "application/javascript");
    },
  })
);
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  const currentTime = new Date();
  const hours = currentTime.getHours();
  if (hours >= 4 && hours < 12) {
    greetings = "Good morning";
  } else if (hours >= 12 && hours < 18) {
    greetings = "Good afternoon";
  } else {
    greetings = "Good evening";
  }

  const result = await db.query(
    `select playlist, song_poster from user_songs where user_id=${current_user}`
  );
  // console.log(result.rows);
  for (let i = 0; i < result.rows.length; i++) {
    // console.log(result.rows[i].playlist);
    if (playlist.length == 0) {
      playlist.push(result.rows[i].playlist);
      poster.push(result.rows[i].song_poster);
    } else {
      for (let j = 0; j < playlist.length; j++) {
        if (result.rows[i].playlist == playlist[j]) {
          // console.log("occured");
          break;
        } else {
          if (j == playlist.length - 1) {
            //check if the traversal is complete or not
            playlist.push(result.rows[i].playlist);
            poster.push(result.rows[i].song_poster);
          }
          continue;
        }
      }
    }
  }
  const result1 = await db.query(
    `select song_name from user_songs where user_id=${current_user} and liked=1`
  );
  const result2 = await db.query(`select name from users where user_id=1`);
  current_username = result2.rows[0].name;
  // console.log(result1.rows.length);
  // console.log(playlist, poster);
  likedSongsCount = result1.rows.length;
  // res.render("index", {
  //   playlist: playlist,
  //   poster: poster,
  //   likedSongsCount,
  //   current_username,
  //   greetings,
  // });
  // console.log(playlist);
  res.render("index", {
    playlist: playlist,
    poster: poster,
    likedSongsCount,
    current_username,
    greetings,
  });
});
app.get('/getSearch',(req,res)=>{
  res.render('search',{playlist: playlist,
    poster: poster,
    likedSongsCount,
    current_username,
    greetings,});
})
app.get('/search',async(req,res)=>{
  const query=(req.query.q).replace(/\b\w/g, match => match.toUpperCase());
  // console.log(query)
  try {
    let results=await db.query('SELECT song_name, artist_name, song_poster FROM all_songs WHERE LOWER(song_name) LIKE $1',
    [`%${query.toLowerCase()}%`]);
    // console.log(results.rows);
    results=results.rows;
    let loopRange=results.length;
    res.json({results,loopRange});
  } catch (error) {
    console.log(error);
  }
});
app.get('/playlist',async(req,res)=>{
  let currentPoster;
  const query=(req.query.q);
  const result=await db.query('select * from user_songs where playlist=$1',[query]);
  // console.log(result.rows);
  // console.log(query);
  if(query=="Liked Songs"){
    currentPoster="https://i.pinimg.com/564x/c6/df/56/c6df5688e0013bf4168fc39a8465e2bd.jpg";
  }
  else{
    currentPoster=result.rows[0].song_poster;
  }
  // console.log(result.rows.length);
  res.render('playlist',{
    playlist: playlist,
    poster: poster,
    likedSongsCount,
    current_username,
    greetings,
    currentPlaylistName:query,
    currentPlaylistPoster:currentPoster,
    numberOfSongs:result.rows.length,
  })
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
