import NavButton from './nav-button'

export default function Navigation() {
  return (
    <nav className="flex flex-col h-full justify-around">
      <NavButton name={'Home'} url={'/'} />
      <NavButton name={'Jobs'} url={'/jobs'} />
    </nav>
  )
}
