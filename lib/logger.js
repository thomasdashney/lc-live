const chalk = require('chalk')

const inDebugMode = process.env.MODE === 'debug'
const orange = chalk.keyword('orange')

const log = (...args) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(...args)
  }
}

module.exports = {
  clear: () => {
    console.clear()
  },

  debug: (...strings) => {
    inDebugMode && log(strings.join(' '))
  },

  warn: (...strings) => {
    console.log(orange(strings.join(' ')))
  },

  system: message => log(chalk.cyanBright(`[SYSTEM] ${message}`)),

  info: message => log(message)
}
