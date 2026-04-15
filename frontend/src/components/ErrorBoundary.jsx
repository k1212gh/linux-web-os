import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { err: null }
  }

  static getDerivedStateFromError(err) {
    return { err }
  }

  componentDidCatch(err, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', this.props.scope || 'app', err, info)
  }

  reset = () => this.setState({ err: null })

  render() {
    if (!this.state.err) return this.props.children

    const isWindow = this.props.scope === 'window'
    return (
      <div style={{
        padding: isWindow ? 16 : 24,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: '#1a0e0e',
        color: '#ffb4b4',
        fontSize: 13,
        overflow: 'auto',
      }}>
        <div style={{ fontSize: 15, fontWeight: 500 }}>
          ⚠ {isWindow ? '앱에서 오류가 발생했습니다' : 'Web OS 오류'}
        </div>
        <div style={{ fontSize: 12, color: '#ff9a9a', fontFamily: 'var(--font-mono)',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 6 }}>
          {String(this.state.err?.message || this.state.err)}
        </div>
        <button onClick={this.reset} style={{
          alignSelf: 'flex-start',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'white', borderRadius: 6, padding: '6px 14px',
          fontSize: 12, cursor: 'pointer',
        }}>다시 시도</button>
      </div>
    )
  }
}
