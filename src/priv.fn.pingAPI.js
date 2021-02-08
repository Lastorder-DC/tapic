module.exports = function (state, _event, _getJSON) {

  function _pingAPI (callback) {
    if (!state.channel_id) return;

    let streams = false;
    let channels = false;
    let follows = false;

    // api request removed due to twitch v3 api shutdown
    let community = true;
    let teams = true;
    
    // chatters api not works since corb change
    let chatters = true;

    function _pingFinished() {
      if (streams && channels && follows && chatters && community && teams) {
        if (typeof callback === 'function') callback();
        _event('update');
      }
    }

    _getJSON(
      'https://api.twitch.tv/kraken/streams/' + state.channel_id,
      function (res) {
        if (res.stream) {
          state.online = true;
          state.currentViewCount = res.stream.viewers;
          state.fps = res.stream.average_fps;
          state.videoHeight = res.stream.video_height;
          state.delay = res.stream.delay;
          state.preview = res.stream.preview.large;
        } else {
          state.online = false;
        }

        streams = true;
        _pingFinished();
      }
    );

    _getJSON(
      'https://api.twitch.tv/kraken/channels/' + state.channel_id,
      function (res) {
        state.game = res.game;
        state.status = res.status;
        state.followerCount = res.followers;
        state.totalViewCount = res.views;
        state.partner = res.partner;
        state.createdAt = res.created_at;
        state.logo = res.logo;
        state.videoBanner = res.video_banner; // offline banner
        state.profileBanner = res.profile_banner;

        channels = true;
        _pingFinished();
      }
    );

    state.community.name = '';
    state.community.description = '';
    state.community.descriptionHTML = '';
    state.community.rules = '';
    state.community.rulesHTML = '';
    state.community.summary = '';

    _getJSON(
      'https://api.twitch.tv/kraken/channels/' + state.channel_id + '/follows',
      '&limit=100',
      function (res) {
        // https://github.com/justintv/Twitch-API/blob/master/v3_resources/follows.md#get-channelschannelfollows
        if (!res.follows) return;

        let firstUpdate = true;
        if (state.followers.length > 0) firstUpdate = false;

        for (let i = 0; i < res.follows.length; i++) {
          const tempFollower = res.follows[i].user.display_name;
          if (state.followers.indexOf(tempFollower) === -1) { // if user isn't in state.followers
            if (!firstUpdate) {
              _event('follow', tempFollower); // if it's not the first update, post new follower
            }
            state.followers.push(tempFollower); // add the user to the follower list
          }
        }

        follows = true;
        _pingFinished();
      }
    );

    setTimeout(function () {
      if (!require('./isNode')) {
        document.getElementById('tapicJsonpContainer').innerHTML = '';
      }
      _pingAPI();
    }, state.refreshRate * 1000);
  }

  return _pingAPI;
};
