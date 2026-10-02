export const workerStatusKey = 'cordelio.workerStatus'

export type StoredWake = {
  version: string
  wokenAt: number
}

type SessionArea = {
  get: (key: string) => Promise<Record<string, unknown>>
  set: (items: Record<string, StoredWake>) => Promise<void>
}

export async function recordWake(
  area: SessionArea,
  wake: StoredWake,
): Promise<StoredWake> {
  await area.set({ [workerStatusKey]: wake })
  const stored = await area.get(workerStatusKey)
  const value = stored[workerStatusKey]
  if (!isStoredWake(value)) {
    throw new Error('Oturum kaydı okunamadı')
  }
  return value
}

function isStoredWake(value: unknown): value is StoredWake {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    'wokenAt' in value &&
    typeof value.version === 'string' &&
    typeof value.wokenAt === 'number'
  )
}
