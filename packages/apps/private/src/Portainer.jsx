'use client'

import IframeApp from './IframeApp'

export default function PortainerApp() {
  return (
    <IframeApp
      service="portainer"
      title="Portainer"
      icon="🐋"
      envKey="PORTAINER_URL"
      setupHint={
        <>
          Portainer를 설치하고 실행하세요:<br /><br />
          <code style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 4, fontSize: 12 }}>
            docker run -d -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock portainer/portainer-ce
          </code>
        </>
      }
    />
  )
}
