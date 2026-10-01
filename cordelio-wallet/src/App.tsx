import { appModules } from './shared'
import './App.css'

function App() {
  return (
    <main className="shell">
      <p className="eyebrow">Gün 1</p>
      <h1>Cordelio Wallet</h1>
      <p className="lead">
        React ve TypeScript projesi ayakta. Cüzdan, anahtar ve ağ
        bağlantısı sonraki günlerde eklenecek.
      </p>
      <ul className="modules">
        {appModules.map((module) => (
          <li key={module.id}>
            <span>{module.title}</span>
            <small>{module.summary}</small>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
