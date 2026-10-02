import { useMemo, useState } from 'react'
import { createMnemonic, mnemonicWords } from '../wallet-core/mnemonic.ts'
import { createVault } from '../shared/extension-client.ts'

type Step = 'reveal' | 'confirm' | 'password'

export function CreateWallet({
  onCancel,
  onSaved,
}: {
  onCancel: () => void
  onSaved: () => void
}) {
  const [mnemonic, setMnemonic] = useState(createMnemonic)
  const [step, setStep] = useState<Step>('reveal')
  const [wroteDown, setWroteDown] = useState(false)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const words = mnemonicWords(mnemonic)
  const checks = useMemo(() => pickChecks(words.length), [words.length])

  function cancel() {
    setMnemonic('')
    setPassword('')
    setConfirmPassword('')
    onCancel()
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

  if (step === 'confirm') {
    const ready = checks.every(
      (index) => answers[index]?.trim().toLowerCase() === words[index],
    )
    return (
      <section className="wallet-main wallet-main--flow">
        <div>
          <h1>İfadeyi doğrula</h1>
          <p>Yazdığın kelimelerden üçünü gir.</p>
          <div className="checks">
            {checks.map((index) => (
              <label key={index}>
                {index + 1}. kelime
                <input
                  value={answers[index] ?? ''}
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [index]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}
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
            disabled={!ready}
            onClick={() => {
              setError('')
              setStep('password')
            }}
          >
            Devam
          </button>
        </div>
      </section>
    )
  }

  if (step === 'password') {
    return (
      <section className="wallet-main wallet-main--flow">
        <div>
          <h1>Parola belirle</h1>
          <p>Bu parola kasayı açar. Kurtarma ifadesinin yerine geçmez.</p>
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
        <h1>Kurtarma ifadesi</h1>
        <p>Bu 12 kelimeyi sırayla yaz. Ekran görüntüsü alma.</p>
        <ol className="words">
          {words.map((word, index) => (
            <li key={index}>
              <span>{index + 1}</span>
              {word}
            </li>
          ))}
        </ol>
        <label className="wrote">
          <input
            type="checkbox"
            checked={wroteDown}
            onChange={(event) => setWroteDown(event.target.checked)}
          />
          Kelimeleri yazdım
        </label>
      </div>
      <div className="actions">
        <button className="wallet-button wallet-button--secondary" type="button" onClick={cancel}>
          Vazgeç
        </button>
        <button
          className="wallet-button wallet-button--primary"
          type="button"
          disabled={!wroteDown}
          onClick={() => setStep('confirm')}
        >
          Devam
        </button>
      </div>
    </section>
  )
}

function pickChecks(length: number): number[] {
  const order = [...Array(length).keys()]
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swap = crypto.getRandomValues(new Uint32Array(1))[0] % (index + 1)
    const current = order[index]
    order[index] = order[swap]
    order[swap] = current
  }
  return order.slice(0, 3).sort((left, right) => left - right)
}
