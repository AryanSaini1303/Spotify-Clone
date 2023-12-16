function goBackwards() {
  window.history.back();
}
function goForwards() {
  if (window.history.forward() != null) {
    window.history.forward();
  }
  else{ 
    $(".sec2 > .nav .forward").css("cursor","not-allowed");
  }
}
if ($(".greetings").text()) {
  $(".home>img").attr("src", "/images/homeActive.png");
  $(".home").css("opacity", "1");
  $(".search").css("opacity", "0.6");
  $(".search>img").attr("src", "/images/loupe.png");
} else {
  $(".home").css("opacity", "0.6");
  $(".search").css("opacity", "1");
  $(".home>img").attr("src", "/images/home.png");
  $(".search>img").attr("src", "/images/loupeActive.png");
}
$(".home").click(() => {
  $(".home").css("opacity", "1");
  $(".search").css("opacity", "0.6");
  $(".home>img").attr("src", "/images/homeActive.png");
  $(".search>img").attr("src", "/images/loupe.png");
});
$(".search").click(() => {
  $(".home").css("opacity", "0.6");
  $(".search").css("opacity", "1");
  $(".home>img").attr("src", "/images/home.png");
  $(".search>img").attr("src", "/images/loupeActive.png");
});
let count = 1;
$(".title>div").click(() => {
  if (count % 2) {
    $(".nav .text").css("display", "none");
    $(".add").css("display", "none");
    $(".title>div h4").css("display", "none");
    $(".wrapper").css("grid-template-columns", "0.1fr 3fr 1.2fr");
    $(".library .title").css("padding", "1.2rem 0");
    $(".sec1 .element .info").css("display", "none");
    $(".nav>*").css("padding", "0 1.7rem");
    $(".sec2>.nav .forward").css("padding", "0");
    $(".sec2>.nav *").css("padding", "0"); //when colums expands then it adds extra padding to the elements which the elements to expand too\
    $(".sec2 .playlists").css("grid-template-columns", "1fr 1fr 1fr");
    $(".sec2 #searchInput").css("padding", "10px");
    $(".sec2 .results .otherSongs").css("grid-template-columns", "1fr 1fr 1fr");
  } else {
    $(".nav .text").css("display", "block");
    $(".add").css("display", "block");
    $(".title>div h4").css("display", "block");
    $(".wrapper").css("grid-template-columns", "1fr 3fr 1.2fr");
    $(".library .title").css("padding", "0 1.4rem");
    $(".sec1 .element .info").css("display", "block");
    $(".nav>*").css("padding", "0 1rem");
    $(".sec2>.nav .forward").css("padding", "0");
    $(".sec2>.nav *").css("padding", "0"); //when colums expands then it adds extra padding to the elements which the elements to expand too\
    $(".sec2 .playlists").css("grid-template-columns", "1fr 1fr");
    $(".sec2 #searchInput").css("padding", "10px");
    $(".sec2 .results .otherSongs").css("grid-template-columns", "1fr 1fr");
  }
  count++;
});
let count1 = 0;
$(".sec2 .playlists .element").hover(function () {
  count1++;
  // console.log($(this).prop('class'));//gives the class of the current hovering element
  let className = $(this).prop("class").replace("element ", "");
  if (count1 % 2) {
    $(`.${className} .playpausebtn`).css("opacity", "1");
  } else {
    $(`.${className} .playpausebtn`).css("opacity", "0");
  }
});
function search() {
  let song_name = [];
  let artist_name = [];
  let song_poster = [];
  var searchInput = document.getElementById("searchInput").value;
  // console.log(searchInput);

  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/search?q=" + encodeURIComponent(searchInput), true);

  xhr.onload = function () {
    if (xhr.status === 200) {
      let results = JSON.parse(xhr.responseText);
      console.log(results.results);
      let info = results.results;
      // $(".sec2 .results").text(results[0].song_name);
      let loopRange = results.loopRange;
      info.forEach((element) => {
        song_name.push(element.song_name),
          artist_name.push(element.artist_name),
          song_poster.push(element.song_poster);
      });
      $(".sec2 .results").empty(); //clear results before fetching each json request based on the userInput
      if (!searchInput) {
        // to prevent writing all the songs in the results section when input field is cleared
        loopRange = 0;
      }
      for (let i = 0; i < loopRange; i++) {
        if (i == 0) {
          let name = song_name[i].replace(/\s/g, "");
          name = name.replace("'", "");
          $(".sec2 .results").append(`
            <div class="topSong">
              <div class="element ${name}">
                <div class="poster"><img src="${song_poster[i]}" alt=""></div>
                <div class="info">
                  <div class="song_name"><h4>${song_name[i]}</h4></div>
                  <div class="artist_name"><h4>${artist_name[i]}</h4></div>
                </div>
                <div class="playpausebtn"><img src="/images/play-button.png" alt=""></div>
              </div>
            </div>
            <div class="otherSongs"></div>
          `);
        } else {
          let name = song_name[i].replace(/\s/g, "");
          name = name.replace("'", "");
          // console.log(name);
          $(".sec2 .results .otherSongs").append(`
              <div class="element ${name}">
                <div class="poster"><img src="${song_poster[i]}" alt=""></div>
                <img src="/images/play-button.png" alt="" class="playpausebtn">
                <div class="info">
                  <div class="song_name"><h4>${song_name[i]}</h4></div>
                  <div class="artist_name"><h4>${artist_name[i]}</h4></div>
                </div>
              </div>
          `);
        }
      }
      let count2 = 0;
      $(".sec2 .results .otherSongs .element").hover(function () {
        count2++;
        let className = $(this).prop("class").replace("element ", "");
        // console.log(className);
        if (count2 % 2) {
          $(`.sec2 .results .otherSongs .${className} .playpausebtn`).css(
            "opacity",
            "1"
          );
          $(`.sec2 .results .otherSongs .${className}>.poster`).css(
            "filter",
            "blur(2px)"
          );
        } else {
          $(`.sec2 .results .otherSongs .${className} .playpausebtn`).css(
            "opacity",
            "0"
          );
          $(`.sec2 .results .otherSongs .${className}>.poster`).css(
            "filter",
            "blur(0)"
          );
        }
      });
    }
  };

  xhr.send();
  console.log(song_name);
}