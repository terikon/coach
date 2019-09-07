module.exports = {
  pages: {
    player: {
      // entry for the *public* page
      entry: 'src/player.js',
      // the source template
      template: 'public/player.html',
      // output as dist/index.html
      filename: 'player.html'
    },
    "self-camera": {
      // entry for the *public* page
      entry: 'src/self-camera.js',
      // the source template
      template: 'public/self-camera.html',
      // output as dist/index.html
      filename: 'self-camera.html'
    },
    index: {
      // entry for the *public* page
      entry: 'src/index.js',
      // the source template
      template: 'public/index.html',
      // output as dist/index.html
      filename: 'index.html'
    }
  }
}
