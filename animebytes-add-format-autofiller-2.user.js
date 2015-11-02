// ==UserScript==
// @name        AnimeBytes Add format autofiller 2
// @namespace   animebytes.add.format.autofiller2
// @include     https://animebytes.tv/upload.php?type=music*
// @version     1
// @grant       none
// ==/UserScript==

var auto_filler = document.getElementsByClassName("center")[1].children[0];

function auto_fill() {
  var info = load("userscript_cd_info");
  
  var dd = document.getElementsByTagName("dd")
  
  var catalog_number_input = dd[7].children[0];
  var edition_title_input = dd[9].children[0];
  var edition_date_input = dd[11].children[0];
  
  if (info["edition_title"]) {
    edition_title_input.value = info["edition_title"];
  }
  
  if (info["catalog_number"]) {
    catalog_number_input.value = info["catalog_number"];
  }
  
  if (info["edition_date"]) {
    edition_date_input.value = info["edition_date"];
  }
  
  /*
  if (info.length === 4) {
    edition_title_input.value = info["edition_title"];
    catalog_number_input.value = info["catalog_number"];
    edition_date_input.value = info["edition_date"];
  } else {
    edition_title_input.value = info["edition_title"];
    edition_date_input.value = info["edition_date"];
  }
  */
  
  auto_fill_mp3();
}

function auto_fill_mp3() {
  var input = document.getElementById("file_input_music");
  var filename = input.files[0].name;
  var info = load("userscript_cd_info");

  var split = filename.split(" ");

  function check_mp3(filename_array) {
    //for (var i = 0; i < filename_array.length; i++) {
    if (/320/.test(filename_array[filename_array.length - 1])) {
      return "320";
    } else if (/V0/.test(filename_array[filename_array.length - 1])) {
      return "V0";
    } else if (/V2/.test(filename_array[filename_array.length - 1])) {
      return "V2"
    }
  }
  
  var res = check_mp3(split);
  
  var encoding_select = document.getElementById("encoding");
  var bitrate_select = document.getElementById("bitrate");
  var media_select = document.getElementById("cdmedia");
  
  encoding_select[1].selected = true; // Because MP3 is always what I will be uploading.
  
  for (var i = 0; i < media_select.length; i++) {
    if (media_select[i].value === info["flac_media"]) {
      media_select[i].selected = true;
    }
  }
  
  
  
  if (res === "320") {
    bitrate_select[5].selected = true;
  } else if (res === "V0") {
    bitrate_select[4].selected = true;
  } else if (res === "V2") {
    bitrate_select[2].selected = true;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function load(key) {
  return JSON.parse(localStorage.getItem(key));
}

auto_filler.addEventListener("click", auto_fill, true);