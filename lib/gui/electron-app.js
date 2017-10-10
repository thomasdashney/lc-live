/**
 * DEVELOPMENT SERVER (port 3000)
 */

let PATH_TO_INDEX

if (process.env.NODE_ENV === 'development') {
  const express = require('express')
  const webpack = require('webpack')
  const webpackConfig = require('./webpack.config.js')
  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
  webpackConfig.entry.push('webpack-hot-middleware/client')
  const devServer = express()
  const compiler = webpack(webpackConfig)
  devServer.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    silent: true
  }))
  devServer.use(require('webpack-hot-middleware')(compiler))
  const DEV_PORT = 3000
  PATH_TO_INDEX = `localhost:${DEV_PORT}`
  devServer.listen(DEV_PORT)
}

/**
 * Create the app
 */

const { performance } = require('../app')

/**
 * ELECTRON APP
 */

const electron = require('electron')
const electronApp = electron.app
const BrowserWindow = electron.BrowserWindow

const url = require('url')

let mainWindow

electronApp.on('ready', createWindow)

electronApp.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    electronApp.quit()
  }
})

electronApp.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600})

  mainWindow.loadURL(url.format({
    pathname: PATH_TO_INDEX,
    protocol: 'http:',
    slashes: true
  }))

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const { webContents } = mainWindow

  webContents.on('did-finish-load', () => setupApp(mainWindow))
}

function setupApp (mainWindow) {
  const { webContents } = mainWindow
  /**
   * Configure process handlers
   */

  const emit = (type, payload = null) => {
    webContents.send(type, payload)
  }

  performance.on('loadedScene', (songIndex, sceneIndex) => {
    emit('loadedScene', {
      songIndex,
      sceneIndex
    })
  })

  const messageHandlers = {
    start: () => {
      performance.start()
      emit('started')
    },
    incrementScene: () => {
      performance.incrementScene()
    },
    decrementScene: () => {
      performance.decrementScene()
    },
    incrementSong: () => {
      performance.incrementSong()
    },
    decrementSong: () => {
      performance.decrementSong()
    }
  }

  process.on('message', message => {
    if (messageHandlers[message]) {
      messageHandlers[message]()
    }
  })

  emit('loaded', performance)
}
