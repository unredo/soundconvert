function changeEnding(fileName: string, ending: string) {
  if (!fileName.includes('.')) {
    return `${fileName}.${ending}`
  }
  const parts = fileName.split('.')
  parts.pop()
  parts.push(ending)
  return parts.join('.')
}

export { changeEnding }
