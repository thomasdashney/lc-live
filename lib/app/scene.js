class Scene {
  constructor (name, programs) {
    this._name = name
    this._programs = programs
  }

  toJSON () {
    return {
      name: this.name
    }
  }

  get name () {
    return this._name
  }

  get programs () {
    return this._programs
  }
}

module.exports = Scene
