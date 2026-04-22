'use client'

import IframeApp from './IframeApp'

export default function GrafanaApp() {
  return (
    <IframeApp
      service="grafana"
      title="Grafana"
      icon="📊"
      envKey="GRAFANA_URL"
      setupHint={
        <>
          Grafana를 설치하고 실행하세요:<br /><br />
          <code style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 4, fontSize: 12 }}>
            docker run -d -p 3001:3000 grafana/grafana
          </code>
        </>
      }
    />
  )
}
