import { useActionState, useState } from 'react'

import { upload } from '../../services/upload/upload'
import FileInput from './file-input'
import { Spinner } from './spinner'

export default function Home() {
  const [state, formAction, isPending] = useActionState(uploadEvent, { msg: '' })
  const [files, setFiles] = useState<File[]>([])
  const [key, setKey] = useState(Date.now())

  async function uploadEvent(prevState: { msg: string | undefined }, fd: FormData) {
    const msg = await upload(files, fd)
    setKey(Date.now())
    setFiles([])
    return { msg }
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <form action={formAction} className="flex flex-col grow max-w-xl h-96 gap-4">
        <h1>Create A Processing Job</h1>
        <FileInput onFileChange={setFiles} key={key} />
        <button
          className="flex gap-4 items-center justify-center bg-purple-900 hover:bg-purple-800 disabled:hover:bg-purple-900 p-1 rounded-xs disabled:opacity-45 cursor-pointer disabled:cursor-not-allowed"
          disabled={isPending || files.length < 1}
        >
          {isPending && <Spinner />}
          <span>Create Job</span>
        </button>
        <div className="min-h-6">
          {state && state.msg && <p className="text-red-700 text-center">{state.msg}</p>}
        </div>
      </form>
    </div>
  )
}
