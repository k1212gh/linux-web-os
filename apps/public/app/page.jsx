import dynamic from 'next/dynamic'
import { publicApps } from '@k1212gh/apps-public'

const Desktop = dynamic(() => import('@k1212gh/ui').then(m => m.Desktop), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b95a9', fontFamily: 'Geist, sans-serif' }}>
      로딩 중…
    </div>
  ),
})

export default function Page() {
  return <Desktop apps={publicApps} />
}
