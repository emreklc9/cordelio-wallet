export type AppModule = {
  id: string
  title: string
  summary: string
}

export const appModules: AppModule[] = [
  {
    id: 'popup',
    title: 'Popup',
    summary: 'Cüzdan arayüzü',
  },
  {
    id: 'onboarding',
    title: 'Onboarding',
    summary: 'Oluşturma ve içe aktarma',
  },
  {
    id: 'background',
    title: 'Background',
    summary: 'Service worker',
  },
  {
    id: 'content',
    title: 'Content',
    summary: 'dApp bağlantı köprüsü',
  },
  {
    id: 'wallet-core',
    title: 'Wallet core',
    summary: 'Blockchain ve kriptografi',
  },
  {
    id: 'storage',
    title: 'Storage',
    summary: 'Şifreli yerel kasa',
  },
  {
    id: 'shared',
    title: 'Shared',
    summary: 'Ortak tipler ve yardımcılar',
  },
]
