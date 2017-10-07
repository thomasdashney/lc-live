const chalk = require('chalk')

const inDebugMode = process.env.MODE === 'debug'

const log = console.log

module.exports = {
  clear: () => {
    console.clear()
  },

  debug: (...strings) => {
    inDebugMode && log(strings.join(' '))
  },

  system: message => log(chalk.cyanBright(`[SYSTEM] ${message}`)),

  info: message => log(message)
}
