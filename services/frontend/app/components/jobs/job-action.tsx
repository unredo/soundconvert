import { Link } from 'react-router'

interface JobActionProps {
  url: string
  text: string
  title: string
  cb?: () => void
}

export function JobAction({ url, text, title, cb }: JobActionProps) {
  const hasCallback = !!cb
  const classes =
    'text-2xl w-16 text-center rounded-full bg-purple-900 p-4 hover:bg-purple-800 hover:text-grey-100 hover:cursor-pointer transition:colors duration-300'

  return (
    <>
      {hasCallback && (
        <button title={title} onClick={cb} className={classes} aria-label="Remove job">
          {text}
        </button>
      )}
      {!hasCallback && (
        <Link
          title={title}
          role="download archive"
          to={url}
          reloadDocument
          className={classes}
          aria-label="Download file archive"
        >
          {text}
        </Link>
      )}
    </>
  )
}
