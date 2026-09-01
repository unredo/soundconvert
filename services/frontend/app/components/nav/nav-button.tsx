import { Link } from 'react-router'

interface NavButtonProps {
  name: string
  url: string
}

export default function NavButton({ name, url }: NavButtonProps) {
  return (
    <Link
      to={url}
      viewTransition
      className="[writing-mode:sideways-lr] text-3xl p-8 hover:bg-purple-800 grow text-center transition-colors duration-300 bg-transparent"
    >
      {name}
    </Link>
  )
}
