import { useState } from 'react'

const buttons = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
]

const s = {
  wrap: { height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-ui)', background: 'rgba(0,0,0,0.2)' },
  display: { padding: '20px 20px 10px', textAlign: 'right' },
  expr: { fontSize: 13, color: 'var(--text-muted)', height: 20, overflow: 'hidden' },
  value: { fontSize: 36, fontWeight: 300, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' },
  grid: { flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, padding: '8px 12px 12px' },
  btn: (isOp, isEq) => ({
    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 18, fontWeight: 400,
    background: isEq ? 'var(--accent)' : isOp ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
    color: isEq ? '#fff' : isOp ? 'var(--accent)' : 'var(--text-primary)',
    transition: 'filter 0.1s',
  }),
}

export default function CalculatorApp() {
  const [display, setDisplay] = useState('0')
  const [expr, setExpr] = useState('')
  const [operator, setOperator] = useState(null)
  const [prev, setPrev] = useState(null)
  const [resetNext, setResetNext] = useState(false)

  const handleBtn = (label) => {
    if (label >= '0' && label <= '9' || label === '.') {
      if (resetNext) { setDisplay(label === '.' ? '0.' : label); setResetNext(false) }
      else { setDisplay(display === '0' && label !== '.' ? label : display + label) }
    } else if (label === 'C') {
      setDisplay('0'); setExpr(''); setOperator(null); setPrev(null)
    } else if (label === '⌫') {
      setDisplay(display.length > 1 ? display.slice(0, -1) : '0')
    } else if (label === '±') {
      setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display)
    } else if (label === '%') {
      setDisplay((parseFloat(display) / 100).toString())
    } else if (['+', '-', '×', '÷'].includes(label)) {
      if (prev !== null && operator && !resetNext) {
        const result = calc(prev, parseFloat(display), operator)
        setDisplay(result.toString())
        setPrev(result)
      } else {
        setPrev(parseFloat(display))
      }
      setOperator(label)
      setExpr(`${display} ${label}`)
      setResetNext(true)
    } else if (label === '=') {
      if (prev !== null && operator) {
        const result = calc(prev, parseFloat(display), operator)
        setExpr(`${prev} ${operator} ${display} =`)
        setDisplay(result.toString())
        setPrev(null); setOperator(null); setResetNext(true)
      }
    }
  }

  const calc = (a, b, op) => {
    switch (op) {
      case '+': return a + b
      case '-': return a - b
      case '×': return a * b
      case '÷': return b !== 0 ? a / b : 'Error'
      default: return b
    }
  }

  const isOp = (l) => ['+', '-', '×', '÷', 'C', '±', '%', '⌫'].includes(l)

  return (
    <div style={s.wrap}>
      <div style={s.display}>
        <div style={s.expr}>{expr}</div>
        <div style={s.value}>{display}</div>
      </div>
      <div style={s.grid}>
        {buttons.flat().map(label => (
          <button key={label} style={s.btn(isOp(label), label === '=')} onClick={() => handleBtn(label)}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.3)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
