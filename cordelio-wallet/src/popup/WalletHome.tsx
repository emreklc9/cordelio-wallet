import { useEffect, useState } from 'react'
import type { VaultPhase } from '../storage/vault.ts'
import { lockVault, requestBalance, unlockVault } from '../shared/extension-client.ts'
import { CreateWallet } from './CreateWallet.tsx'
import { ImportWallet } from './ImportWallet.tsx'
import { SendTransfer, TransferStatus } from './SendTransfer.tsx'

export function WalletHome({
  phase,
  address,
  onChanged,
}: {
  phase: VaultPhase['phase'] | 'unknown'
  address?: string
  onChanged: () => void
}) {
  const [creating, setCreating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [sending, setSending] = useState(false)
  const [sentHash, setSentHash] = useState<string | null>(null)
  const [balanceNonce, setBalanceNonce] = useState(0)
  const balance = useSepoliaBalance(address, balanceNonce)

  if (sentHash) {
    return (
      <TransferStatus
        hash={sentHash}
        onClose={() => {
          setSentHash(null)
          setSending(false)
          setBalanceNonce((value) => value + 1)
          onChanged()
        }}
      />
    )
  }

  if (sending && phase === 'unlocked' && address) {
    return (
      <SendTransfer
        onCancel={() => setSending(false)}
        onSent={(hash) => {
          setSending(false)
          setSentHash(hash)
        }}
      />
    )
  }

  if (phase === 'unlocked' && address) {
    return (
      <section className="wallet-main wallet-main--flow">
        <div>
          <h1>Kasa açık</h1>
          <BalanceLine text={balance} />
          <p className="address">{address}</p>
          <p className="balance-note">5 dakika işlem olmazsa kilitlenir.</p>
        </div>
        <div className="actions">
          <button
            className="wallet-button wallet-button--primary"
            type="button"
            onClick={() => setSending(true)}
          >
            Gönder
          </button>
          <button
            className="wallet-button wallet-button--secondary"
            type="button"
            onClick={() => {
              void lockVault().then(() => onChanged())
            }}
          >
            Kilitle
          </button>
        </div>
      </section>
    )
  }

  if (phase === 'locked' && address) {
    return (
      <section className="wallet-main wallet-main--flow">
        <div>
          <h1>Kasa kilitli</h1>
          <BalanceLine text={balance} />
          <p className="address">{address}</p>
          <div className="checks">
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
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="actions">
          <button
            className="wallet-button wallet-button--primary"
            type="button"
            disabled={pending}
            onClick={() => {
              setPending(true)
              setError('')
              void unlockVault(password).then((result) => {
                setPassword('')
                setPending(false)
                if (result.state === 'saved') onChanged()
                else if (result.state === 'error') setError(result.message)
                else setError('Kasa yalnızca Chrome eklentisinde açılır.')
              })
            }}
          >
            Kilidi aç
          </button>
        </div>
      </section>
    )
  }

  if (creating) {
    return (
      <CreateWallet
        onCancel={() => setCreating(false)}
        onSaved={() => {
          setCreating(false)
          onChanged()
        }}
      />
    )
  }

  if (importing) {
    return (
      <ImportWallet
        onCancel={() => setImporting(false)}
        onSaved={() => {
          setImporting(false)
          onChanged()
        }}
      />
    )
  }

  return (
    <section className="wallet-main">
      <div>
        <h1>Henüz cüzdan yok</h1>
        <p>Yeni bir kasa oluştur. Adres, kurtarma ifadesinden türetilecek.</p>
      </div>
      <div className="actions">
        <button
          className="wallet-button wallet-button--primary"
          type="button"
          onClick={() => setCreating(true)}
        >
          Oluştur
        </button>
        <button
          className="wallet-button wallet-button--secondary"
          type="button"
          onClick={() => setImporting(true)}
        >
          İçe aktar
        </button>
      </div>
    </section>
  )
}

function BalanceLine({ text }: { text: string }) {
  return <p className="balance">{text}</p>
}

function useSepoliaBalance(address?: string, nonce = 0) {
  const [result, setResult] = useState<{ key: string; text: string } | null>(null)
  const key = `${address ?? ''}:${nonce}`

  useEffect(() => {
    if (!address) return
    let active = true
    void requestBalance().then((response) => {
      if (!active) return
      const text =
        response.state === 'ok'
          ? `${response.eth} ETH`
          : response.state === 'outside'
            ? 'Bakiye eklentide okunur'
            : response.message
      setResult({ key, text })
    })
    return () => {
      active = false
    }
  }, [address, key])

  if (!address || result?.key !== key) return 'Bakiye okunuyor'
  return result.text
}
