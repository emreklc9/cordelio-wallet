import { useState } from 'react'
import { createVault } from '../shared/extension-client.ts'
import { deriveAddress, normalizeMnemonic } from '../wallet-core/mnemonic.ts'

export function ImportWallet({
  onCancel,
  onSaved,
}: {
  onCancel: () => void
  onSaved: () => void
}) {
  const [phrase, setPhrase] = useState('')
  const [mnemonic, setMnemonic] = useState('')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  function cancel() {
    setPhrase('')
    setMnemonic('')
    setPassword('')
    setConfirmPassword('')
    onCancel()
  }

  function review() {
    try {
      const normalized = normalizeMnemonic(phrase)
      setMnemonic(normalized)
      setAddress(deriveAddress(normalized))
      setPhrase('')
      setError('')
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Kurtarma ifadesi geçersiz',
      )
    }
  }

  async function save() {
    if (password.length < 8) {
      setError('Parola en az 8 karakter olmalı.')
      return
    }
    if (password !== confirmPassword) {
      setError('Parolalar aynı değil.')
      return
    }
    setPending(true)
    setError('')
    const result = await createVault(mnemonic, password)
    setPassword('')
    setConfirmPassword('')
    setPending(false)
    if (result.state === 'saved') {
      setMnemonic('')
      onSaved()
      return
    }
    if (result.state === 'outside') {
      setError('Kasa yalnızca Chrome eklentisinde saklanır.')
      return
    }
    setError(result.message)
  }

  if (address) {
    return (
      <section className="wallet-main wallet-main--flow">
        <div>
          <h1>Adresi kontrol et</h1>
          <p>Bu parola yeni kasayı açar. Eski cüzdanın parolası değildir.</p>
          <p className="address">{address}</p>
          <div className="checks">
            <label>
              Parola
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <label>
              Parola tekrar
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>
          </div>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="actions">
          <button className="wallet-button wallet-button--secondary" type="button" onClick={cancel}>
            Vazgeç
          </button>
          <button
            className="wallet-button wallet-button--primary"
            type="button"
            disabled={pending}
            onClick={() => void save()}
          >
            Kasayı kaydet
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="wallet-main wallet-main--flow">
      <div>
        <h1>Cüzdanı içe aktar</h1>
        <p>12 veya 24 kelimeyi arada boşluk bırakarak yaz. Sıra önemlidir.</p>
        <div className="checks">
          <label>
            Kurtarma ifadesi
            <textarea
              value={phrase}
              rows={4}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => setPhrase(event.target.value)}
            />
          </label>
        </div>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="actions">
        <button className="wallet-button wallet-button--secondary" type="button" onClick={cancel}>
          Vazgeç
        </button>
        <button
          className="wallet-button wallet-button--primary"
          type="button"
          onClick={review}
        >
          Adresi gör
        </button>
      </div>
    </section>
  )
}
