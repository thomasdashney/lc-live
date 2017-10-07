class Setlist {
  constructor (songs) {
    this._songs = songs
  }

  get songs () {
    return this._songs
  }

  songAt (index) {
    return this._songs[index]
  }
}

module.exports = Setlist
