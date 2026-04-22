'use client'

import IframeApp from './IframeApp'

export default function JenkinsApp() {
  return (
    <IframeApp
      service="jenkins"
      title="Jenkins"
      icon="⚙"
      envKey="JENKINS_URL"
      setupHint={
        <>
          Jenkins를 설치하고 실행하세요:<br /><br />
          <code style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 4, fontSize: 12 }}>
            docker run -d -p 8080:8080 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
          </code>
        </>
      }
    />
  )
}
