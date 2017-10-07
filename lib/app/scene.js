class Scene {
  constructor (name, programs) {
    this._name = name
    this._programs = programs
  }

  get name () {
    return this._name
  }

  get programs () {
    return this._programs
  }
}

module.exports = Scene
