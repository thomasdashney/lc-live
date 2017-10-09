/* eslint-env jest */

const EventEmitter = require('events')
const Scene = require('../scene')
const Song = require('../song')
const Setlist = require('../setlist')
const Performance = require('../performance')

const createOutputMock = channel => ({
  channel,
  changeProgram: jest.fn(),
  sendMessage: jest.fn()
})

let performance, inputs, outputs

beforeEach(() => {
  const setlist = new Setlist([
    new Song(
      'song 1',
      { nord: { program: 2 } },
      [
        new Scene('intro', {
          prophet: { program: 20, bank: 1 },
          juno: { program: 50 }
        }),
        new Scene('verse', {
          prophet: { program: 70 }
        })
      ]
    ),
    new Song(
      'song 2',
      { nord: { program: 50 } },
      [
        new Scene('intro')
      ]
    )
  ])

  inputs = {
    nord: new EventEmitter(),
    randomOtherInput: new EventEmitter()
  }

  outputs = {
    nord: createOutputMock(3),
    juno: createOutputMock(5),
    prophet: createOutputMock(8),
    otherDevice: createOutputMock(8)
  }

  const matrix = {
    nord: ['prophet', 'juno']
  }

  performance = new Performance(setlist, outputs, inputs, matrix)
})

function setIndexes (songIndex, sceneIndex) {
  performance.currentSongIndex = songIndex
  performance.currentSceneIndex = sceneIndex
}

it('can be serialized into json', () => {
  setIndexes(1, 0)
  expect(JSON.parse(JSON.stringify(performance))).toEqual({
    currentSongIndex: 1,
    currentSceneIndex: 0,
    songs: [{
      name: 'song 1',
      scenes: [{
        name: 'intro'
      }, {
        name: 'verse'
      }]
    }, {
      name: 'song 2',
      scenes: [{
        name: 'intro'
      }]
    }]
  })
})

describe('start', () => {
  it('configures the matrix to forward messages to the correct devices', () => {
    performance.start()
    const messageForJuno = [0xC4, 125, 24]
    inputs.nord.emit('message', messageForJuno)
    expect(outputs.juno.sendMessage).toBeCalledWith(messageForJuno)
    expect(outputs.prophet.sendMessage).not.toBeCalledWith(messageForJuno)

    const messageForProphet = [0xC7, 12, 80]
    inputs.nord.emit('message', messageForProphet)
    expect(outputs.prophet.sendMessage).toBeCalledWith(messageForProphet)
    expect(outputs.juno.sendMessage).not.toBeCalledWith(messageForProphet)

    expect(outputs.otherDevice.sendMessage).not.toBeCalled()
  })

  it('loads the first song/scene', () => {
    performance.loadScene = jest.fn()
    performance.start()
    expect(performance.loadScene).toBeCalledWith(0, 0)
  })
})

describe('loadScene', () => {
  it('throws an error if no song exists for the index', () => {
    expect(() => performance.loadScene(2, 0)).toThrow()
    expect(() => performance.loadScene(-1, 0)).toThrow()
  })

  it('throws an error if no song exists for the index', () => {
    expect(() => performance.loadScene(0, -1)).toThrow()
    expect(() => performance.loadScene(0, 2)).toThrow()
  })

  it('updates current song/scene indexes', () => {
    performance.loadScene(1, 0)
    expect(performance.currentSongIndex).toEqual(1)
    expect(performance.currentSceneIndex).toEqual(0)
  })

  it('sends program changes', () => {
    const clearMocks = () => {
      ;['nord', 'prophet', 'juno'].forEach(output => {
        outputs[output].changeProgram.mockClear()
      })
    }

    performance.loadScene(0, 0)
    expect(outputs.nord.changeProgram).toBeCalledWith(2, undefined)
    expect(outputs.prophet.changeProgram).toBeCalledWith(20, 1)
    expect(outputs.juno.changeProgram).toBeCalledWith(50, undefined)

    clearMocks()

    performance.loadScene(0, 1)
    expect(outputs.prophet.changeProgram).toBeCalledWith(70, undefined)
    expect(outputs.juno.changeProgram).not.toBeCalled()
    expect(outputs.nord.changeProgram).not.toBeCalled()

    clearMocks()

    performance.loadScene(1, 0)
    expect(outputs.nord.changeProgram).toBeCalledWith(50, undefined)
    expect(outputs.juno.changeProgram).not.toBeCalled()
    expect(outputs.prophet.changeProgram).not.toBeCalled()
  })
})

describe('navigating between songs/scenes', () => {
  beforeEach(() => {
    performance.loadScene = jest.fn()
  })

  describe('incrementScene', () => {
    it('loads next scene of the current song', () => {
      setIndexes(0, 0)
      performance.incrementScene()
      expect(performance.loadScene).toBeCalledWith(0, 1)
    })

    it('loads the next song if in the last scene of a song', () => {
      setIndexes(0, 1)
      performance.incrementScene()
      expect(performance.loadScene).toBeCalledWith(1, 0)
    })

    it('does nothing when at the last scene of the set', () => {
      setIndexes(1, 1)
      performance.incrementScene()
      expect(performance.loadScene).not.toBeCalled()
    })
  })

  describe('decrementScene', () => {
    it('does nothing when at the first scene of the set', () => {
      setIndexes(0, 0)
      performance.decrementScene()
      expect(performance.loadScene).not.toBeCalled()
    })

    it('loads the previous scene in the current song', () => {
      setIndexes(0, 1)
      performance.decrementScene()
      expect(performance.loadScene).toBeCalledWith(0, 0)
    })

    it('loads the last scene of the previous song', () => {
      setIndexes(1, 0)
      performance.decrementScene()
      expect(performance.loadScene).toBeCalledWith(0, 1)
    })
  })

  describe('incrementSong', () => {
    it('loads the next song', () => {
      setIndexes(0, 0)
      performance.incrementSong()
      expect(performance.loadScene).toBeCalledWith(1, 0)

      performance.loadScene.mockClear()

      setIndexes(0, 1)
      performance.incrementSong()
      expect(performance.loadScene).toBeCalledWith(1, 0)
    })

    it('does nothing if at the last song', () => {
      setIndexes(1, 0)
      performance.incrementSong()
      expect(performance.loadScene).not.toBeCalled()
    })
  })

  describe('decrementSong', () => {
    it('does nothing if at the first song/scene', () => {
      setIndexes(0, 0)
      performance.decrementSong()
      expect(performance.loadScene).not.toBeCalled()
    })

    it('moves to the start of the current song', () => {
      setIndexes(0, 1)
      performance.decrementSong()
      expect(performance.loadScene).toBeCalledWith(0, 0)
    })

    it('moves to the previous song if at the first scene of current song', () => {
      setIndexes(1, 0)
      performance.decrementSong()
      expect(performance.loadScene).toBeCalledWith(0, 0)
    })
  })
})
