class Song {
  constructor (name, scenes) {
    this._name = name
    this._scenes = scenes
  }

  get name () {
    return this._name
  }

  get scenes () {
    return this._scenes
  }

  sceneAt (index) {
    return this._scenes[index]
  }
}

module.exports = Song