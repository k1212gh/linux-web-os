import { useRef, useState, useCallback, useEffect } from 'react'

/**
 * Reusable WebSocket hook with auto-reconnect.
 * @param {string} url - WebSocket URL
 * @param {object} opts - { onMessage, onOpen, onClose, autoConnect }
 */
export default function useWebSocket(url, opts = {}) {
  const { onMessage, onOpen, onClose, autoConnect = false } = opts
  const wsRef = useRef(null)
  const [status, setStatus] = useState('disconnected') // connecting | connected | disconnected

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setStatus('connecting')
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const fullUrl = url.startsWith('ws') ? url : `${protocol}//${window.location.host}${url}`
    const ws = new WebSocket(fullUrl)

    ws.onopen = () => {
      setStatus('connected')
      onOpen?.()
    }

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        onMessage?.(data)
      } catch {
        onMessage?.({ type: 'raw', content: e.data })
      }
    }

    ws.onclose = () => {
      setStatus('disconnected')
      onClose?.()
      wsRef.current = null
    }

    ws.onerror = () => {
      ws.close()
    }

    wsRef.current = ws
  }, [url, onMessage, onOpen, onClose])

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    setStatus('disconnected')
  }, [])

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data))
    }
  }, [])

  useEffect(() => {
    if (autoConnect) connect()
    return () => disconnect()
  }, [autoConnect, connect, disconnect])

  return { status, connect, disconnect, send }
}
