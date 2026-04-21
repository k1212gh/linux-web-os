import dynamic from 'next/dynamic'

const Desktop = dynamic(() => import('@/components/Desktop'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b95a9', fontFamily: 'Geist, sans-serif' }}>
      로딩 중…
    </div>
  ),
})

export default function Page() {
  return <Desktop />
}
