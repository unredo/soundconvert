import { useEffect, useState } from 'react'

interface FileInputProps {
  onFileChange: (f: File[]) => void
}

const wavMimeType = 'audio/wav'

function hasFile(files: DataTransferItemList): boolean {
  for (const f of files) {
    return f.kind === 'file'
  }
  return false
}

function filterWavs(files: FileList) {
  const temp: File[] = []
  for (const f of files) {
    if (f.type === wavMimeType) {
      temp.push(f)
    }
  }
  return temp
}

export default function FileInput({ onFileChange }: FileInputProps) {
  const [files, setFiles] = useState<File[]>([])
  const intl = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  useEffect(() => {
    window.addEventListener('drop', preventDefault)
    window.addEventListener('dragover', preventDefault)
    return () => {
      window.removeEventListener('drop', preventDefault)
      window.removeEventListener('dragover', preventDefault)
    }
  }, [])

  function preventDefault(e: DragEvent) {
    if (!e.dataTransfer) return
    if (hasFile(e.dataTransfer.items)) e.preventDefault()
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files as FileList
    updateFiles(files)
  }

  function updateFiles(files: FileList) {
    const wavs = filterWavs(files)
    const temp: File[] = []
    for (let i = 0; i < wavs.length; i++) {
      if (wavs[i]) {
        temp.push(wavs[i])
      }
    }

    setFiles(temp)
    onFileChange(temp)
  }

  function onDrop(e: React.DragEvent) {
    updateFiles(e.dataTransfer.files)
  }

  function onDragOver(e: React.DragEvent) {
    e.dataTransfer.dropEffect = 'copy'
  }

  const fileItems = files.map((f) => (
    <li key={f.lastModified}>
      <div className="flex justify-between">
        <span>{f.name}</span>
        <span>{intl.format(f.size / 1000)} kB</span>
      </div>
    </li>
  ))

  return (
    <label
      role="button"
      aria-description="Click for file chooser or drag/drop files"
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="border rounded-md flex flex-col justify-center grow max-h-96 overflow-auto p-4"
    >
      {(!files || files.length < 1) && <p className="text-center">Click Or Drop Files</p>}
      {files && files.length > 0 && <ul className="w-full h-full">{fileItems}</ul>}
      <input onChange={onChange} className="hidden" type="file" multiple accept=".wav,audio/wav" />
    </label>
  )
}
