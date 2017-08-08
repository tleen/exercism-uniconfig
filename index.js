let async = require('async'),
    fetch = require('node-fetch');

// 1. fetch list of tracks
// https://raw.githubusercontent.com/exercism/exercism.io/master/test/fixtures/tracks.json
// xx - is there a better list of tracks?

fetch('https://raw.githubusercontent.com/exercism/exercism.io/master/test/fixtures/tracks.json')
  .then( res => res.json()) // transform fetch response into json
  .then( res => res.tracks) // dig down into the track data
  .then( tracks => tracks.map(t => t.slug) ) // just pluck the slugs out
  .then( slugs => { // turn the slugs into a map of slug => url
    let urls = {};
    for (let slug of slugs){
      urls[slug] = `https://raw.githubusercontent.com/exercism/${slug}/master/config.json`;
    }
    return urls;
  })
  .then( urls => { // transform that map of slug => url to slug => track config
    async.mapValuesLimit(
      urls,
      2, // only access two of the githubusercontent urls at once: be nice.
      (url, slug, callback) => {
        // get the config for each track
        fetch(url)
          .then(res => res.json())
          .then(res => callback(null, res))
          .catch( (err) => {
            // don't stop processing all tracks because of an error
            // keep going, set config empty
            // will filter the empty ones out below
            console.error('Unable to get configuration for:', slug);
            return callback(null, '');
          });
      },
      (err, configs) => {

        if(err) return console.error(err);

        // create the unified track json representation
        let uniconfig = {
          generated: new Date(),
          tracks: {}
        };

        // add the retrieved config files, skip if empty (unable to retrieve)
        for(slug in configs){
          let trackconfig = configs[slug];
          if(trackconfig !== '') uniconfig.tracks[slug] = configs[slug]
        }

        // xx - write out json of uniconfig to std out
//        console.log(uniconfig);
        process.stdout.write(JSON.stringify(uniconfig, null, 2));
      });
  })
  .catch(console.error);
