import Home from '../components/home/home'

export function meta() {
  return [{ title: 'SoundConvert' }, { name: 'description', content: 'Welcom to SoundConvert' }]
}

export default function HomeRoute() {
  return <Home />
}
