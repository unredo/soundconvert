interface FileInfo {
  count: number
  files: {
    name: string
    encoding: string
    type: string
  }[]
}

function createFileInfo(): FileInfo {
  return {
    count: 0,
    files: [],
  }
}

export { type FileInfo, createFileInfo }
