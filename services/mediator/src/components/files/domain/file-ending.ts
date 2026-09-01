function changeFileEnding(name: string, ending: string) {
  if (!name.includes('.')) {
    throw Error('Illegal filename')
  }
  const parts = name.split('.')
  parts.pop()
  parts.push(ending)
  return parts.join('.')
}

export { changeFileEnding }
