$( document ).ready(function() {

  var templateSource = document.getElementById('results-template').innerHTML,
  template = Handlebars.compile(templateSource),
  resultsPlaceholder = document.getElementById('results'),
  playingCssClass = 'playing',
  audioObject = null;

  var fetchTracks = function (albumId, callback) { //get albums
    $.ajax({
      url: 'https://api.spotify.com/v1/albums/' + albumId,
      success: function(albumData) {
        var artists = albumData.artists
        var firstArtists = artists[0]

        $.ajax({
          url: 'https://api.spotify.com/v1/artists/' + firstArtists.id,
          success: function(artistData) {
            var data = {
              albumData: albumData,
              artistData: artistData
            }

            callback(data)
          }
        })
      }
    })
  };

  var searchAlbums = function (query) { //search
    $.ajax({
      url: 'https://api.spotify.com/v1/search',
      data: {
        q: query,
        type: 'album'
      },
      success: function (response) {
        resultsPlaceholder.innerHTML = template(response); // Almbum covers
      }

    });
  };

  results.addEventListener('click', function(e) { //click event
    var target = e.target;
    if (target !== null && target.classList.contains('cover')) {

      var albumId = target.getAttribute('data-album-id');
      var uri = 'https://embed.spotify.com/?theme=white&uri=' + encodeURIComponent('spotify:album:' + albumId);
      $('#player').attr('src', uri);

      if (target.classList.contains(playingCssClass)) { //preview_url
        audioObject.pause();
      } else {
        if (audioObject) {
          audioObject.pause();
        }
        fetchTracks(albumId, function(data)  {
          debugger;
          $('#albumStats, #artistStats').empty() //append html to page

          var albumStats = (
          '<h5> Title </h5>' +
          '<p>'+ data.albumData.name +'</p>' +
          '<h5> Date </h5>' +
          '<p>'+ data.albumData.release_date + '</p>' +
          '<h5> Label </h5>' +
          '<p>'+ data.albumData.copyrights[0].text +'</p>' +
          '<h5> Popularity </h5>' +
          '<p>'+ data.albumData.popularity +'</p>'
        )
          $('#albumStats').append(albumStats)

          var artistStats = (
            '<h5> Name </h5>' +
            '<p>'+ data.artistData.name +'</p>' +
            '<h5> Genre </h5>' +
            '<p>'+ data.artistData.genres[1] +'</p>' +
            '<h5> Spotify Popularity </h5>' +
            '<p>'+ data.artistData.popularity +'</p>' +
            '<h5> Spotify Followers </h5>' +
            '<p>'+ data.artistData.followers.total +'</p>'
          )
            $('#artistStats').append(artistStats)


          // end append
          audioObject = new Audio(data.albumData.tracks.items[0].preview_url); // preview audio
          audioObject.play();
          target.classList.add(playingCssClass);
          audioObject.addEventListener('ended', function() {
            target.classList.remove(playingCssClass);
          });
          audioObject.addEventListener('pause', function() {
            target.classList.remove(playingCssClass);
          });
        });
      }
    }
  }); //end click event

  var $loading = $('#loadingDiv').hide(); //show / hide loading bar
  $(document).ajaxStart(function () {
    $loading.show();
  }).ajaxStop(function () {
    $loading.hide();
  });

  document.getElementById('search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    searchAlbums(document.getElementById('query').value);
  }, false);

});
