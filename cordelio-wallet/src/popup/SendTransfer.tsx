import { useEffect, useState } from 'react'
import {
  requestGasQuote,
  requestTransferStatus,
  sendTransfer,
} from '../shared/extension-client.ts'

export function SendTransfer({
  onCancel,
  onSent,
}: {
  onCancel: () => void
  onSent: (hash: string) => void
}) {
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const quote = useGasQuote(to, amount)
  const ready = quote.state === 'ok' && password.length >= 8 && !pending

  return (
    <section className="wallet-main wallet-main--flow">
      <div>
        <h1>Test ETH gönder</h1>
        <p>Yalnızca Sepolia. İmza için parola gerekir; kurtarma ifadesi bellekte tutulmaz.</p>
        <div className="checks">
          <label>
            Alıcı
            <input
              value={to}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => setTo(event.target.value.trim())}
            />
          </label>
          <label>
            Miktar (ETH)
            <input
              inputMode="decimal"
              value={amount}
              autoComplete="off"
              onChange={(event) => setAmount(event.target.value.trim())}
            />
          </label>
          <label>
            Parola
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        </div>
        <p className="balance-note">{quote.text}</p>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="actions">
        <button
          className="wallet-button wallet-button--primary"
          type="button"
          disabled={!ready}
          onClick={() => {
            setPending(true)
            setError('')
            void sendTransfer(to, amount, password).then((result) => {
              setPassword('')
              setPending(false)
              if (result.state === 'ok') onSent(result.hash)
              else if (result.state === 'error') setError(result.message)
              else setError('Gönderim yalnızca Chrome eklentisinde yapılır.')
            })
          }}
        >
          Gönder
        </button>
        <button className="wallet-button wallet-button--secondary" type="button" onClick={onCancel}>
          Vazgeç
        </button>
      </div>
    </section>
  )
}

export function TransferStatus({
  hash,
  onClose,
}: {
  hash: string
  onClose: () => void
}) {
  const status = useTransferStatus(hash)

  return (
    <section className="wallet-main wallet-main--flow">
      <div>
        <h1>İşlem</h1>
        <p className="balance">{statusLabel(status)}</p>
        <p className="address">{hash}</p>
        <a
          className="tx-link"
          href={`https://sepolia.etherscan.io/tx/${hash}`}
          target="_blank"
          rel="noreferrer"
        >
          Sepolia gezgininde aç
        </a>
      </div>
      <div className="actions">
        <button className="wallet-button wallet-button--primary" type="button" onClick={onClose}>
          Kapat
        </button>
      </div>
    </section>
  )
}

function useGasQuote(to: string, amount: string): { state: 'idle' | 'ok' | 'wait' | 'error'; text: string } {
  const [quote, setQuote] = useState<{ key: string; text: string; state: 'ok' | 'error' } | null>(null)
  const key = `${to}|${amount}`
  const ready = canQuote(to, amount)

  useEffect(() => {
    if (!ready) return
    let active = true
    const timer = window.setTimeout(() => {
      void requestGasQuote(to, amount).then((result) => {
        if (!active) return
        if (result.state === 'ok') {
          setQuote({
            key,
            state: 'ok',
            text: `En fazla ${result.eth} ETH · ${result.gas} gas`,
          })
          return
        }
        setQuote({
          key,
          state: 'error',
          text: result.state === 'error' ? result.message : 'Ücret eklentide hesaplanır',
        })
      })
    }, 400)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [ready, key, to, amount])

  if (!ready) return { state: 'idle', text: 'Adres ve miktar girilince ücret hesaplanır.' }
  if (quote?.key !== key) return { state: 'wait', text: 'Ücret hesaplanıyor' }
  return quote
}

function useTransferStatus(hash: string) {
  const [status, setStatus] = useState('Durum okunuyor')

  useEffect(() => {
    let active = true
    let timer = 0
    const read = () => {
      void requestTransferStatus(hash).then((result) => {
        if (!active) return
        if (result.state === 'ok') {
          setStatus(result.status)
          if (result.status !== 'pending') window.clearInterval(timer)
          return
        }
        setStatus(result.state === 'error' ? result.message : 'Durum eklentide okunur')
      })
    }
    read()
    timer = window.setInterval(read, 4_000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [hash])

  return status
}

function canQuote(to: string, amount: string): boolean {
  return (
    /^0x[a-fA-F0-9]{40}$/.test(to) &&
    /^\d+(\.\d{1,18})?$/.test(amount) &&
    !/^0+(?:\.0+)?$/.test(amount)
  )
}

function statusLabel(status: string): string {
  if (status === 'pending') return 'Bekliyor'
  if (status === 'success') return 'Onaylandı'
  if (status === 'reverted') return 'Reddedildi'
  return status
}
