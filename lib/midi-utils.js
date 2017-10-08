function getChannel (statusByte) {
  return (statusByte % 0x10) + 1
}

function createStatusByte (statusCode, channel) {
  return (statusCode << 4) + channel - 1
}

module.exports = {
  getChannel,
  createStatusByte
}
