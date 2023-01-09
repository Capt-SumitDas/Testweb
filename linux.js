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

document.addEventListener('DOMContentLoaded', function() {
  var videoList = document.querySelector('#video-list');
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'linux.json');
  xhr.onload = function() {
    if (xhr.status === 200) {
      var videos = JSON.parse(xhr.response);
      videos.forEach(function(video) {
        var videoId = video.id;
        var videoTitle = video.title;
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.setAttribute('href', '#');
        a.setAttribute('data-video-id', videoId);
        a.textContent = videoTitle;
        li.appendChild(a);
        videoList.appendChild(li);
      });
      videoList.addEventListener('click', function(event) {
        event.preventDefault();
        var target = event.target;
        while (target && target.nodeName != 'A') {
          target = target.parentNode;
        }
        if (target) {
          var videoId = target.getAttribute('data-video-id');
          playVideo(videoId);
        }
      });
    } else {
      console.error(xhr.statusText);
    }
  };
  xhr.onerror = function() {
    console.error(xhr.statusText);
  };
  xhr.send();
});
