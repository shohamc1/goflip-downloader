element = document.createElement("button");
element.innerHTML = "Download";
element.id = "download_button";

async function process_m3u8(m3u8data, url) {
  element.innerHTML = "Processing file...";
  if (!m3u8data) {
    return;
  } else {
    m3u8data = m3u8data.split("\n");
  }

  console.log("parsed ts urls");
  ts_files = [];

  m3u8data.forEach((element) => {
    if (element[0] != "#" || element == "") {
      ts_files.push(element);
    }
  });

  var to = url.lastIndexOf("/");
  to = to == -1 ? url.length : to + 1;
  url = url.substring(0, to);

  console.log("fetching blobs");

  // url is now base url and is ready to use for ts files
  blobs = [];

  element.innerHTML = "Downloading files...";

  Promise.all(
    ts_files.map((element) =>
      fetch(url + element)
        .then((resp) => resp.blob())
        .then((blob) => {
          if (blob.type == "application/octet-stream") {
            blobs.push([blob, element.replace(/\D/g, "")]);
          }
        })
        .catch("Error " + element)
    )
  ).then(() => {
    create_blob(blobs);
  });
}

function create_blob(blobs) {
  element.innerHTML = "Generating final file...";
  console.log("creating final blob");

  blobs.sort(function (a, b) {
    return a[1].localeCompare(b[1]);
  });

  concatBlob = new Blob(
    blobs.map(function (x) {
      return x[0];
    })
  );

  // download the generated file
  const url1 = window.URL.createObjectURL(concatBlob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url1;
  a.download = "final.ts";
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url1);

  element.innerHTML = "Download";
}

element.onclick = async function () {
  element.innerHTML = "Getting URLs...";
  var url = document
    .getElementById("video_1_html5_api")
    .firstElementChild.getAttribute("src");

  console.log("got URL");

  var m3u8data = null;
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.send(null);
  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status === 200) {
      var type = request.getResponseHeader("Content-Type");
      if (type.indexOf("text") !== 1) {
        m3u8data = request.responseText;
        process_m3u8(m3u8data, url);
      }
    }
  };
};

controls = document.getElementById("controls");
controls.appendChild(element);
