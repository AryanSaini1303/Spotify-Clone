import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import mp3Duration from "mp3-duration";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Spotify Clone",
  password: "aryansaini9999",
  port: 5432,
});
db.connect();

var flag = false;
var flagCount = 0;
var current_user = 1;
const app = express();
const port = 3000;
var greetings;
var playlist = [];
var poster = [];
var likedSongsCount = 0;
var current_username;
var result3;
app.use(
  "/public",
  express.static("public", {
    extensions: ["css"],
    setHeaders: (res, path, stat) => {
      res.set("Content-Type", "text/css");
    },
  })
);
app.use(bodyParser.json()); // necessary to configure server to receive variables from xml requests
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
    `select distinct playlist, song_poster from user_songs where user_id=${current_user} ORDER BY playlist desc`// i have no idea why query is picking up items in descending order, so to reverse the order i'm using order by desc
  );
  // console.log(result.rows);
  for (let i = 0; i < result.rows.length; i++) {
    if (playlist.length == 0) {
      // console.log(result.rows[i]);
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
  const result2 = await db.query(`select name from users where user_id=$1`,[current_user]);
  current_username = result2.rows[0].name;
  const response=await db.query(`select distinct playlist_id from user_songs where user_id=$1`,[current_user]);
  result3=response.rows;
  // console.log(result3);
  // console.log(result1.rows.length);
  // console.log(playlist, poster);
  likedSongsCount = result1.rows.length;
  // console.log(result3);
  res.render("index", {
    playlist: playlist,
    poster: poster,
    likedSongsCount,
    current_username,
    greetings,
    flag,
    playlist_id: result3,
  });
});

app.get("/getSearch", (req, res) => {
  res.render("search", {
    playlist: playlist,
    poster: poster,
    likedSongsCount,
    current_username,
    greetings,
    flag,
  });
});
app.get("/search", async (req, res) => {
  const query = req.query.q.replace(/\b\w/g, (match) => match.toUpperCase());
  // console.log(query)
  try {
    let results = await db.query(
      "SELECT song_name, artist_name, song_poster, song_id FROM all_songs WHERE LOWER(song_name) LIKE $1",
      [`%${query.toLowerCase()}%`]
    );
    results = results.rows;
    // console.log(results);
    let loopRange = results.length;
    res.json({ results, loopRange });
  } catch (error) {
    console.log(error);
  }
});
app.get("/playlist", async (req, res) => {
  let currentPoster;
  var response;
  const query = req.query.queryParam;
  // console.log(query);
  var result;
  const altresponse = await db.query("select * from user_songs where liked=1");
  const altresult = altresponse.rows;
  // console.log(altresult);
  var response1;
  var result1;
  if(query!="LikedSongs"){
    response1=await db.query('select distinct playlist from user_songs where playlist_id=$1',[query]);
    result1=response1.rows;
    // console.log("result1",result1);
    response = await db.query(
      "select * from user_songs where playlist_id=$1",
      [query]
    );
    result = response.rows;
  }
  // console.log("altresult",altresult);
  // console.log(query);
  if (query == "LikedSongs") {
    currentPoster =
    "https://i.pinimg.com/564x/c6/df/56/c6df5688e0013bf4168fc39a8465e2bd.jpg";
  } else {
    currentPoster = result[0].song_poster;
  }
  // console.log(result.rows.length);
  let Durations=[];
  let array=result;
  if(query=="LikedSongs"){
    array=altresult;
  }
  const promises = array.map((element) => {
    return new Promise((resolve, reject) => {
      mp3Duration(
        "./static" + element.song_path + ".mp3",
        function (err, duration) {
          if (err) {
            reject(err);
          } else {
            resolve(duration);
          }
        }
      );
    });
  });
  let currentPlaylistName;  
  let numberOfSongs;
  if(query=="LikedSongs"){
    currentPlaylistName="Liked Songs";
    numberOfSongs = altresult.length;
  }
  else{
    currentPlaylistName=result1[0].playlist;
    numberOfSongs = result.length;
  }
  Promise.all(promises)
    .then((durations) => {
      // console.log(durations);
      Durations.push(durations);
      // console.log(Durations);
      res.render("playlist", {
        playlist: playlist,
        poster: poster,
        likedSongsCount,
        current_username,
        greetings,
        currentPlaylistName,
        currentPlaylistPoster: currentPoster,
        numberOfSongs,
        flag,
        result,
        altresult,
        Durations,
        playlist_id:query,
      });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post("/collapse", (req, res) => {
  flagCount++;
  if (flagCount % 2) {
    flag = req.body.variable;
  } else {
    flag = false;
  }
  // console.log(flag);
  // res.send("flag set successfully");
});

app.post("/play",async (req,res)=>{
  const query=req.body.variableName;
  // console.log(query);
  const response=await db.query('select song_path from all_songs where song_id=$1',[query]);
  const result=response.rows;
  // console.log(result);
  res.json(result[0].song_path);
})

// app.get('/home',(req,res)=>{
//   res.render("home", {
//     playlist: playlist,
//     poster: poster,
//     likedSongsCount,
//     current_username,
//     greetings,
//     flag,
//     playlist_id: result3,
//   });
// })

app.post('/playPlaylist',async(req,res)=>{
  const query=req.body.variableName;
  // console.log(query);
  let song_paths=[];
  if(query!='LikedSongs'){
    const response=await db.query('select song_path from user_songs where playlist_id=$1',[query]);
    const result=response.rows;
    result.forEach((element=>{
      song_paths.push(element.song_path);
    }))
  }
  else{
    const altresponse=await db.query('select song_path from user_songs where liked=1');
    const altresult=altresponse.rows;
    // console.log(altresult);
    altresult.forEach((element=>{
      song_paths.push(element.song_path);
    }))
  }
  // console.log(song_paths);
  res.json(song_paths);
})
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
