function getLoggerConfig(key: string) {
  switch (key) {
    case 'production':
      return true
    case 'test':
      return false
    default:
      return { transport: { target: 'pino-pretty' } }
  }
}

export { getLoggerConfig }
