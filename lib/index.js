const keypress = require('keypress')
const { resolve } = require('path')
const { fork } = require('child_process')
const chalk = require('chalk')
const logger = require('./logger')

/**
 * Hacky command-line version of the app.
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

const messageHandlers = {
  loaded: setlist => {
    logger.system('Loaded')
    logger.info(chalk.magenta('Setlist:'))
    setlist.songs.forEach(song => {
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
      'right': () => app.send('incrementScene'),
      'left': () => app.send('decrementScene'),
      'down': () => app.send('incrementSong'),
      'up': () => app.send('decrementSong'),
      'q': () => process.exit(0)
    }

    process.stdin.on('keypress', (ch, key) => {
      const { ctrl, shift, name } = key

      if (!ctrl && !shift) {
        const handler = keyHandlers[key.name]
        if (handler) {
          handler()
        }
      } else if (ctrl && !shift && name === 'c') {
        process.exit(0)
      }
    })

    process.stdin.setRawMode(true)
    process.stdin.resume()
  },

  loadedScene: ({ song, scene }) => {
    logger.info(`${chalk.green(song)} - ${chalk.yellow(scene)}`)
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
