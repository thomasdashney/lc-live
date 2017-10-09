/**
 * DEVELOPMENT SERVER (port 3000)
 */

// let PATH_TO_INDEX

// if (process.env.NODE_ENV === 'development') {
//   const express = require('express')
//   const webpack = require('webpack')
//   const webpackConfig = require('./webpack.config.js')
//   webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
//   webpackConfig.entry.push('webpack-hot-middleware/client')
//   const devServer = express()
//   const compiler = webpack(webpackConfig)
//   devServer.use(require('webpack-dev-middleware')(compiler, {
//     noInfo: true,
//     silent: true
//   }))
//   devServer.use(require('webpack-hot-middleware')(compiler))
//   const DEV_PORT = 3000
//   PATH_TO_INDEX = `localhost:${DEV_PORT}`
//   devServer.listen(DEV_PORT)
// }

// /**
//  * ELECTRON APP
//  */

// const electron = require('electron')
// const electronApp = electron.app
// const BrowserWindow = electron.BrowserWindow

// const url = require('url')

// let mainWindow

// function createWindow () {
//   mainWindow = new BrowserWindow({width: 800, height: 600})

//   mainWindow.loadURL(url.format({
//     pathname: PATH_TO_INDEX,
//     protocol: 'http:',
//     slashes: true
//   }))

//   mainWindow.on('closed', () => {
//     mainWindow = null
//   })
// }

// electronApp.on('ready', createWindow)

// electronApp.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     electronApp.quit()
//   }
// })

// electronApp.on('activate', () => {
//   if (mainWindow === null) {
//     createWindow()
//   }
// })

/**
 * SPAWN APP AS CHILD PROCESS AND BIND CONNECTION TO GUI
 */

const { resolve } = require('path')
const { fork } = require('child_process')

const parameters = []
const options = {
  silent: true,
  stdio: ['pipe', 'pipe', 'pipe', 'ipc']
}
const app = fork(resolve(__dirname, '../app/index.js'), parameters, options)

app.stdout.on('data', data => {
  console.log(data)
})

app.stderr.on('data', data => {
  console.log(data)
})

app.on('close', (...args) => {
  console.log('closed', ...args)
})

app.on('message', message => {
  // TODO: just pass this directly to the frontend
  // if (messageHandlers[message.type]) {
  //   messageHandlers[message.type](message.payload)
  // }
  console.log('message', message)
})

process.on('exit', code => {
  if (code === 0) {
    console.log('Shutting down by request')
  } else {
    console.log('Shutting down unexpectedly')
  }
})
