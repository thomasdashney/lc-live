class Song {
  constructor (name, programs, scenes) {
    this._name = name
    this._programs = programs
    this._scenes = scenes
  }

  toJSON () {
    return {
      name: this.name,
      scenes: this.scenes
    }
  }

  get name () {
    return this._name
  }

  get programs () {
    return this._programs
  }

  get scenes () {
    return this._scenes
  }

  sceneAt (index) {
    return this._scenes[index]
  }
}

module.exports = Song
