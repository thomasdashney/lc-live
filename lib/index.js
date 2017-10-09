const keypress = require('keypress')
const { resolve } = require('path')
const { fork } = require('child_process')
const chalk = require('chalk')
const logger = require('./logger')

logger.system('Loading...')

const parameters = []
const options = {
  stdio: ['pipe', 'pipe', 'pipe', 'ipc']
}
const app = fork(resolve(__dirname, './app/index.js'), parameters, options)

app.on('close', (...args) => {
  logger.error('App unexpectedly closed')
  console.log('args', args)
  process.exit(1)
})

app.on('error', err => {
  logger.error('App unexpectedly errored')
  console.error(err)
})

const messageHandlers = {
  loaded: () => {
    logger.system('Loaded')
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
    logger.info(chalk.green(`${song} - ${scene}`))
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
