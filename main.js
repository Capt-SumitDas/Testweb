var player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    event.target.playVideo();
  }
}

function playVideo(videoId) {
  player.loadVideoById(videoId);
}


document.addEventListener('DOMContentLoaded', function () {
  // playlist.html
  if (document.querySelector('#playlist')) {
    var playlistList = document.querySelector('#playlist');
    fetch('playlists.json')
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        data.forEach(function (playlist) {
          var playlistId = playlist.id;
          var thumbnail = playlist.thumbnail;
          var count = playlist.count;
          var playlistTitle = playlist.title;
          var pdiv = document.createElement('div');
          pdiv.classList.add('box');
          var cdiv = document.createElement('div');
          cdiv.classList.add('thumb');
          var span = document.createElement('span');
          var img = document.createElement('img');
          var a = document.createElement('a');
          a.classList.add('inline-btn');
          var h3 = document.createElement('h3');
          h3.classList.add('title');
          img.src = thumbnail;
          a.setAttribute('href', 'video.html?playlistId=' + playlistId);
          h3.textContent = playlistTitle;
          span.textContent = count;
          a.textContent = "view playlist";
          cdiv.appendChild(img);
          cdiv.appendChild(span)
          playlistList.appendChild(pdiv);
          pdiv.appendChild(cdiv);
          pdiv.appendChild(h3);
          pdiv.appendChild(a);

        });
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  // video.html
  if (document.querySelector('#video-list')) {
    var videoList = document.querySelector('#video-list');
    var currentPlaylistId = new URL(window.location.href).searchParams.get('playlistId');
    fetch('videos.json')
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        var filteredData = data.filter(v => v.playlistId === currentPlaylistId)
        filteredData.forEach(function (video) {
          var videoId = video.id;
          var videoTitle = video.title;
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.setAttribute('href', '#');
          a.textContent = videoTitle;
          a.addEventListener('click', function (event) {
            event.preventDefault();
            appended = event.target.innerText;
            appendtitle(appended)
            playVideo(videoId);
          });
          li.appendChild(a);
          videoList.appendChild(li);
        });
      })
      .catch(function (error) {
        console.error(error);
      });
  }



  // Get the id of the current video from the URI

  function appendtitle(title) {
    const videoTitleContainer = document.querySelector('.title');
    videoTitleContainer.innerText = title
  }

});

