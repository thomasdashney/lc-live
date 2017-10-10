function bankedDeserializer (base) {
  return serialized => {
    const basedString = serialized.split(':')
      .map(n => parseInt(n, 10))
      .map(n => n - 1)
      .map(n => n.toString(base))
      .join('')

    return { program: parseInt(basedString, base) }
  }
}

module.exports = {
  mixer: serialized => ({ program: serialized - 1 }),
  nord: bankedDeserializer(6),
  juno: bankedDeserializer(8),
  prophet6: serialized => ({
    program: serialized % 100,
    bank: Math.floor(serialized / 100)
  })
}
