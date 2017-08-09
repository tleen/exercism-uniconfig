let async = require('async'),
    fetch = require('node-fetch');

// Fetch list of tracks and run through a Promise transformation chain
// xx - is there a better way to get a list of current tracks?
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
      2, // limit simultaneous access to the githubusercontent server: be nice
      (url, slug, callback) => {
        // another Promise chain
        fetch(url)
          .then(res => res.json())
          .then(res => callback(null, res)) // send json back to the async map function
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
        // writing new uniconfig to stdout, pretty
        process.stdout.write(JSON.stringify(uniconfig, null, 2));
      });
  })
  .catch(console.error);
