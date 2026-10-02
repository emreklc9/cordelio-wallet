import { useEffect, useState } from 'react'
import iconUrl from '../assets/icon-32.png'
import { networks } from '../wallet-core/network.ts'
import type { VaultPhase } from '../storage/vault.ts'
import {
  requestWorkerStatus,
  type WorkerConnection,
} from '../shared/extension-client.ts'
import { WalletHome } from './WalletHome.tsx'

type ConnectionView = {
  label: string
  phase: VaultPhase['phase'] | 'unknown'
  address?: string
  reload: () => void
}

export function Popup() {
  const connection = useWorkerConnection()

  return (
    <main className="wallet">
      <header className="wallet-header">
        <div className="brand-lockup">
          <img src={iconUrl} width={32} height={32} alt="" />
          <p className="brand">Cordelio</p>
        </div>
        <p className="network">{networks.sepolia.name}</p>
      </header>
      <WalletHome
        phase={connection.phase}
        address={connection.address}
        onChanged={connection.reload}
      />
      <p className="wallet-foot">{connection.label}</p>
    </main>
  )
}

function useWorkerConnection(): ConnectionView {
  const [tick, setTick] = useState(0)
  const [connection, setConnection] = useState<Omit<ConnectionView, 'reload'>>({
    label: 'Arka plan kontrol ediliyor',
    phase: 'unknown',
  })

  useEffect(() => {
    let active = true
    void requestWorkerStatus().then((result) => {
      if (!active) return
      setConnection(toView(result))
    })
    return () => {
      active = false
    }
  }, [tick])

  useEffect(() => {
    if (connection.phase !== 'unlocked') return
    const timer = window.setInterval(() => setTick((value) => value + 1), 20_000)
    return () => window.clearInterval(timer)
  }, [connection.phase])

  return { ...connection, reload: () => setTick((value) => value + 1) }
}

function toView(result: WorkerConnection): Omit<ConnectionView, 'reload'> {
  if (result.state === 'outside') {
    return { label: 'Geliştirme önizlemesi', phase: 'unknown' }
  }
  if (result.state === 'error') {
    return { label: result.message, phase: 'unknown' }
  }
  return {
    label: `Arka plan bağlı · ${result.version}`,
    phase: result.vault.phase,
    address: visibleAddress(result.vault),
  }
}

function visibleAddress(vault: VaultPhase): string | undefined {
  if (vault.phase === 'locked') return vault.address
  if (vault.phase === 'unlocked') return vault.accounts[0]?.address
  return undefined
}
