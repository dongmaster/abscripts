// ==UserScript==
// @name        AnimeBytes Easy Transcode Uploader
// @namespace   animebytes.easy.transcode.uploader
// @description Makes it easier to upload transcodes for music torrents. Perfect for lazy people.
// @include     https://animebytes.tv/torrents2.php*
// @exclude     https://animebytes.tv/torrents2.php?action=flac_conversions
// @version     1
// @grant       none
// ==/UserScript==

var config = {
    "media": ["CD", "DVD", "Bluray", "Vinyl", "Soundboard", "Web"],
    "bitrate": ["", "192", "V2 (VBR)", "256", "V0 (VBR)", "320", "Lossless", "Lossless 24-bit"],
}

var files = [];

add_checkboxes();
add_box();
populate_box_with_torrent_info();
add_file_input();
add_upload_all_button();

function add_box() {
    var box = create_element("DIV");
    box.id = "userscript_upload_box";
    box.className = "box";

    var group_info = document.createElement("DIV");
    group_info.id = "userscript_group_info";

    var torrents = document.createElement("DIV");
    torrents.id = "userscript_mp3_torrents";
    torrents.innerHTML = "<span>Add one or several torrents to make information show up here.</span>";

    var torrents_header = document.createElement("H3");
    var torrents_header_text = document.createTextNode("This metadata will be used for each torrent");
    torrents_header.appendChild(torrents_header_text);

    box.appendChild(group_info);
    box.appendChild(torrents_header);
    box.appendChild(torrents);

    var torrent_table = document.querySelector(".torrent_table");

    torrent_table.parentNode.insertBefore(box, torrent_table);
}

function add_file_input() {
    var file_input = create_element("INPUT");
    file_input.id = "file_input_music";
    file_input.type = "file";
    file_input.size = 50;
    file_input.name = "file_input";
    file_input.setAttribute("multiple", "");
    file_input.addEventListener("change", file_input_change, true);

    var upload_box = document.querySelector("#userscript_upload_box");

    upload_box.parentNode.insertBefore(file_input, upload_box);
}

function add_checkboxes() {
    var cd_groups = document.getElementsByClassName("edition_info");

    for (var i = 0; i < cd_groups.length; i++) {
      var checkbox = create_element("INPUT");
      checkbox.type = "checkbox";
      checkbox.className = "userscript_group_selector";

      cd_groups[i].children[0].appendChild(checkbox);
    }
}

function add_upload_all_button() {
    var button = document.createElement("BUTTON");
    var center = document.createElement("CENTER");
    var box = document.querySelector("#userscript_upload_box");

    button.addEventListener("click", upload_all, true);
    button.appendChild(document.createTextNode("Upload All"));

    center.appendChild(button);

    box.appendChild(center);
}

function file_input_change(e) {
    files = e.target.files;
    var torrent_container = document.querySelector("#userscript_mp3_torrents");
    // We reset the torrent list here so that when you add new torrents,
    // the old torrents won't stick around.
    // Basically it's important.
    torrent_container.innerHTML = "";

    var torrent_group_info = return_torrent_group_info();
    var html = build_html_file_info(files, torrent_group_info);

    torrent_container.appendChild(html);
}

function return_bitrate(filename_array) {
    // filename_array is "torrent filename [V0].torrent".split(" ");
    // The following checks will check the last element in the array
    if (/320/.test(filename_array[filename_array.length - 1])) {
        return "320";
    } else if (/V0/.test(filename_array[filename_array.length - 1])) {
        return "V0";
    } else if (/V2/.test(filename_array[filename_array.length - 1])) {
        return "V2";
    } else {
        return null;
    }
}

function build_html_file_info(files, torrent_group_info) {
    // Files is an array taken from e.target.files from an <input> with the type file.

    var body = document.createElement("DIV");

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var torrent_filename = file.name;
        var bitrate = return_bitrate(torrent_filename.split(" "));
        var media = torrent_group_info["flac_media"];


        var bitrate_html = create_bitrate_select(bitrate);
        var media_html = create_media_select(media);


        var temp = document.createElement("DIV");

        var html = `<div class="userscript_mp3_file_container">
        <span class="userscript_torrent_name">Name: ` + torrent_filename + `</span>
        <br>
        <span class="userscript_encoding_select_span">Encoding: <select><option value="MP3">MP3</option><option value="FLAC">FLAC</option></select></span>
        <br>
        <span class="userscript_bitrate_select_span">Bitrate: ` + bitrate_html.innerHTML + ` </span>
        <br>
        <span class="userscript_media_select_span">Media: ` + media_html.innerHTML + `</span>
        </div>
        <div class='userscript_upload_finished'>
        </div>`;

        var button = document.createElement("BUTTON");
        button.className = "userscript_upload_button";
        button.appendChild(document.createTextNode("Upload"));
        button.setAttribute("data-index", i);
        button.addEventListener("click", upload_single, true);

        temp.innerHTML = html;

        temp.appendChild(button);
        temp.appendChild(document.createElement("BR"));
        temp.appendChild(document.createElement("BR"));

        //temp.querySelectorAll(".userscript_bitrate_select_span")[i].appendChild(create_bitrate_select(bitrate))
        //console.log(temp.querySelectorAll(".userscript_bitrate_select_span")[i]);

        body.appendChild(temp);
    }

    return body;
}

function create_bitrate_select(default_option) {
    var select = document.createElement("SELECT");

    if (default_option === "V0") {
        default_option = "V0 (VBR)";
    } else if (default_option === "V2") {
        default_option = "V2 (VBR)";
    }

    var options = config["bitrate"];
    var select_index = options.indexOf(default_option);

    for (var i = 0; i < options.length; i++) {
        var option = document.createElement("OPTION");
        option.value = options[i];
        option.textContent = options[i];

        if (i === select_index) {
            option.setAttribute("selected", "selected");
        }

        select.appendChild(option);
    }

    var temp = document.createElement("DIV");
    temp.appendChild(select);

    return temp;
}

function upload_single() {
    var parent = this.parentNode;

    var i = parseInt(this.getAttribute("data-index"));

    var file = files[i];

    var torrent_name = parent.querySelector(".userscript_torrent_name").textContent;
    var encoding = parent.querySelector(".userscript_encoding_select_span").querySelector("select").value;
    var bitrate = parent.querySelector(".userscript_bitrate_select_span").querySelector("select").value;
    var media = parent.querySelector(".userscript_media_select_span").querySelector("select").value;

    this.parentNode.removeChild(this);

    prepare_for_upload(file, {"media": media, "encoding": encoding, "bitrate": bitrate}, i);
}

function upload_all() {
    var meta_uploads = document.querySelectorAll(".userscript_mp3_file_container");
    var buttons = document.querySelectorAll(".userscript_upload_button");

    for (var i = 0; i < buttons.length; i++) {
        var j = parseInt(buttons[i].getAttribute("data-index"));

        var file = files[j];

        var torrent_name = meta_uploads[i].querySelector(".userscript_torrent_name").textContent;
        var encoding = meta_uploads[i].querySelector(".userscript_encoding_select_span").querySelector("select").value;
        var bitrate = meta_uploads[i].querySelector(".userscript_bitrate_select_span").querySelector("select").value;
        var media = meta_uploads[i].querySelector(".userscript_media_select_span").querySelector("select").value;

        buttons[i].parentNode.removeChild(buttons[i]);

        prepare_for_upload(file, {"media": media, "encoding": encoding, "bitrate": bitrate}, j);
    }
}

function create_media_select(default_option) {
    var select = document.createElement("SELECT");

    var options = config["media"];
    var select_index = options.indexOf(default_option);

    for (var i = 0; i < options.length; i++) {
        var option = document.createElement("OPTION");
        option.value = options[i];
        option.textContent = options[i];

        if (i === select_index) {
            option.setAttribute("selected", "selected");
        }

        select.appendChild(option);
    }

    var temp = document.createElement("DIV");
    temp.appendChild(select);

    return temp;
}

// https://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript#11582513
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

function return_torrent_group_info() {
    var checkboxes = document.getElementsByClassName("userscript_group_selector");

    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked === true) {
            var info = document.getElementsByClassName("edition_info")[i].children[0];
        }
    }

    if (info === undefined) {
        var info = document.getElementsByClassName("edition_info")[0].children[0];
    }

    var info2 = [];

    for (var i = 0; i < info.childNodes.length; i++) {
        if (info.childNodes[i].tagName !== "A") {
            info2.push(info.childNodes[i].textContent);
        }
    }

    info2 = info2.splice(1, info2.length).join(" ").split("/");

    for (var i = 0; i < info2.length; i++) {
        info2[i] = info2[i].trim();
    }

    info = info2;

    var edition_title = info[0];

    if (info.length === 2) {
        var edition_date = info[1];
    } else if (info.length === 3) {
        var catalog_number = info[1];
        var edition_date = info[2];
    } else if (info.length === 4) {
        var catalog_number = info[2];
        var edition_date = info[3];
    }

    var torrents = document.getElementsByClassName("group_torrent");
    var flac_media = "";

    for (var i = 0; i < torrents.length; i++) {
        var torrent_info = torrents[i].getElementsByTagName("td")[0].textContent.trim().split("/");

        if (/FLAC/.test(torrent_info[0])) {
            flac_media = torrent_info[2].trim();
        }
    }

    if (!catalog_number) {
        catalog_number = false;
    }

    return {
        "edition_title": edition_title,
        "catalog_number": catalog_number,
        "edition_date": edition_date,
        "flac_media": flac_media,
    };
}

function upload(file, torrent_metadata, i) {
    // torrent_metadata = {"media": media, "encoding": encoding, "bitrate": bitrate}
    var xhr = new XMLHttpRequest();
    var cool_form = new FormData();

    var media = torrent_metadata["media"];
    var encoding = torrent_metadata["encoding"];
    var bitrate = torrent_metadata["bitrate"];

    console.log("Uploading...");
    console.log("File:");
    console.log(file);
    console.log("Media:");
    console.log(media);
    console.log("Encoding:");
    console.log(encoding);
    console.log("Bitrate:");
    console.log(bitrate);

    var info = return_torrent_group_info();

    // I don't even know if this bullshit is necessary, except for maybe the groupid.
    cool_form.append("submit", "true");
    cool_form.append("form", "music");
    cool_form.append("section", "music");
    cool_form.append("groupid", getURLParameter("id"));
    cool_form.append("add_format", 1);
    cool_form.append("CatID", 1);
    // This is necessary.
    cool_form.append("scene", "");

    if (info["catalog_number"] !== false) {
        cool_form.append("catalog_number", info["catalog_number"]);
    }

    cool_form.append("edition_title", info["edition_title"]);
    cool_form.append("edition_date", info["edition_date"]);

    //cool_form.append("cdmedia", info["flac_media"]);
    cool_form.append("cdmedia", media);
    cool_form.append("encoding", encoding);
    cool_form.append("release_desc", "");
    //cool_form.append("bitrate", return_bitrate(file.name.split(" ")));
    cool_form.append("bitrate", bitrate);

    cool_form.append("file_input", file);

    //var post_info_forms = document.getElementById("upload_form_music").getElementsByTagName("div")[0].getElementsByTagName("input");

    /*
    for (var i = 0; i < post_info_forms.length; i++) {
    var name = post_info_forms[i].name;
    var value = post_info_forms[i].value;

    cool_form.append(name, value);
}
*/

/*
var release_info_forms = document.getElementById("release_information").getElementsByTagName("input");

var catalog_number = "";

for (var i = 0; i < release_info_forms.length; i++) {
var name = release_info_forms[i].name;
var value = release_info_forms[i].value;

cool_form.append(name, value);
}
*/
/*
var encoding = document.getElementById("encoding").value;
var bitrate = document.getElementById("bitrate").value;
var cdmedia = document.getElementById("cdmedia").value;
var release_desc = document.getElementById("release_desc").value;
*/

    // UPLOAD
    var upload_url = "https://animebytes.tv/upload.php?type=music&groupid=" + getURLParameter("id");

    xhr.open("POST", upload_url, true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // Handle response.
            var response = xhr.responseText;
            console.log("success");
            upload_finished(file, i);
        } else {
            console.log("fail");
            upload_failed(file, i);
        }
    };

    xhr.send(cool_form);

    //upload_finished(file, i);
}

function upload_finished(file, i) {
    var elements = document.querySelectorAll(".userscript_upload_finished");

    elements[i].innerHTML = "<span style='color:#5fe75b;'>Upload finished!</span>";

    setTimeout(function() {
        refresh_torrent_table();
    }, 100);
}

function upload_failed(file, i) {
    var elements = document.querySelectorAll(".userscript_upload_finished");

    elements[i].innerHTML = "<span style='color:#f74b4b;'>Upload failed and I don't know why!</span>";
}

function prepare_for_upload(file, torrent_metadata, i) {
    var fr = new FileReader();
    fr.readAsBinaryString(file);

    fr.onload = function(evt) {
        upload(file, torrent_metadata, i);
    };
}

function populate_box_with_torrent_info() {
    var info = return_torrent_group_info();
    var group_info = document.querySelector("#userscript_group_info");

    var catalog_number_html = "";

    if (info["catalog_number"]) {
        catalog_number_html = "<span>Catalog Number: <input id='usersscript_input_catalog_number' type='text' value='" + info["catalog_number"] + "'></span><br>";
    }

    group_info.innerHTML = `<h3>This metadata will be used when uploading</h3>
    <span>Edition Title: <input id="userscript_input_edition_title" type="text" value="` + info["edition_title"] + `"></span>
    <br>
    ` + catalog_number_html + `
    <span>Edition Date: <input id="userscript_input_edition_date" type="text" value="` + info["edition_date"] + `"></span>
    `;
}

function refresh_torrent_table() {
    var xhr = function(u, c, t) {
      var r = new XMLHttpRequest();
      r.onreadystatechange = function() {
        if (r.readyState == 4 && r.status == 200) {
          c(r.response);
        }
      };
      r.open("GET", u, true);
      r.setRequestHeader("Accept", "application/json");
      if (t) {r.responseType = t;}
      r.overrideMimeType('text/plain');
      r.send();
      return r;
    }

    function refresh(res) {
        var html = document.createElement("HTML");
        html.innerHTML = res;

        var old_torrent_table = document.querySelector(".torrent_table");
        var new_torrent_table = html.querySelector(".torrent_table").innerHTML;

        old_torrent_table.innerHTML = new_torrent_table;

        add_checkboxes();
    }

    xhr(document.URL, refresh);
}

function create_element(tag) {
    var elem = document.createElement(tag);

    return elem;
}

function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function load(key) {
    return JSON.parse(localStorage.getItem(key));
}
