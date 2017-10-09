const keypress = require('keypress')
const { resolve } = require('path')
const { fork } = require('child_process')
const chalk = require('chalk')
const logger = require('./logger')

/**
 * Hacky command-line client for lib/app.
 * Eventually it would be great to use a react + electron combo
 */

logger.system('Loading...')

const parameters = []
const options = {
  silent: true,
  stdio: ['pipe', 'pipe', 'pipe', 'ipc']
}
const app = fork(resolve(__dirname, './app/index.js'), parameters, options)

app.stdout.on('data', (data) => {
  logger.appInfo(data)
})

app.stderr.on('data', (data) => {
  logger.appError(data)
})

app.on('close', (...args) => {
  logger.system('App closed')
  process.exit(1)
})

const exit = () => {
  app.kill()
  process.exit()
}

/**
 * Keeping 'er simple & storing the app state in memory
 */

let performance, currentSongIndex

const messageHandlers = {
  loaded: _performance => {
    performance = _performance
    logger.system('Loaded')
    logger.info(chalk.magenta('Setlist:'))
    performance.songs.forEach(song => {
      const scenes = chalk.grey(`${song.scenes.map(scene => scene.name).join(' => ')}`)
      logger.info(`  ${song.name} ${scenes}`)
    })
    logger.info('')
    app.send('start')
  },

  started: () => {
    /**
     * Set up key bindings
     */

    keypress(process.stdin)

    const keyHandlers = {
      'space': () => app.send('incrementScene'),
      'right': () => app.send('incrementScene'),
      'left': () => app.send('decrementScene'),
      'down': () => app.send('incrementSong'),
      'up': () => app.send('decrementSong'),
      'q': () => exit()
    }

    process.stdin.on('keypress', (ch, key) => {
      if (!key) return
      const { ctrl, shift, name } = key

      if (!ctrl && !shift) {
        const handler = keyHandlers[key.name]
        if (handler) {
          handler()
        }
      } else if (ctrl && !shift && name === 'c') {
        exit()
      }
    })

    process.stdin.setRawMode(true)
    process.stdin.resume()
  },

  loadedScene: ({ songIndex, sceneIndex }) => {
    const song = performance.songs[songIndex]

    if (songIndex !== currentSongIndex) {
      logger.info(chalk.green(song.name))
    }

    if (sceneIndex) {
      let sceneMessage = `  ${chalk.yellow(song.scenes[sceneIndex].name)}`

      if (song.scenes[sceneIndex + 1]) {
        sceneMessage += chalk.grey(` => ${song.scenes[sceneIndex + 1].name}`)
      }

      logger.info(sceneMessage)
    }

    currentSongIndex = songIndex
  }
}

app.on('message', message => {
  if (messageHandlers[message.type]) {
    messageHandlers[message.type](message.payload)
  }
})

process.on('exit', code => {
  if (code === 0) {
    logger.system('Shutting down by request')
  } else {
    logger.system('Shutting down unexpectedly')
  }
})
