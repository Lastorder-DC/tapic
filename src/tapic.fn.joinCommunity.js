module.exports = function (TAPIC, state, _getJSON) {
  /**
  * Joins the channel to a community
  * @param  {string} community The community NAME
  * @function joinCommunity
  */
  TAPIC.joinCommunity = function (community) {
    if (typeof community != 'string') {
      return console.error('Invalid parameter. Usage: TAPIC.joinCommunity(community);');
    }

    // Getting the id of the community by its name, then joining it
    _getJSON('https://api.twitch.tv/kraken/communities/',
      '&name=' + encodeURIComponent(community),
      function (res) {
        joinCommunity(res._id);
      }
    );

    function joinCommunity(community_id) {
    }
    
  };
};
