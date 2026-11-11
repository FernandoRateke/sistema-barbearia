import { useState, useEffect } from "react"
import { api } from "./services/api"
import Login from "./pages/Login"
import Clientes from "./pages/Clientes"
import Barbeiros from "./pages/Barbeiros"
import Servicos from "./pages/Servicos"
import Agendamentos from "./pages/Agendamentos"
import "./App.css"

function App() {
  const [usuario, setUsuario] = useState(null)
  const [pagina, setPagina] = useState("agendamentos")
  const [carregando, setCarregando] = useState(true)

  // se já existir um cookie válido, entra direto
  useEffect(() => {
    api("/auth/me")
      .then((dados) => setUsuario(dados))
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false))
  }, [])

  async function sair() {
    await api("/auth/logout", { method: "POST" })
    setUsuario(null)
  }

  if (carregando) return <p>Carregando...</p>

  if (!usuario) return <Login onLogin={setUsuario} />

  return (
    <>
      <header>
        <h1>Barbearia</h1>
        <p>Olá, {usuario.nome}</p>

        <nav>
          <button onClick={() => setPagina("agendamentos")}>Agendamentos</button>
          <button onClick={() => setPagina("clientes")}>Clientes</button>
          <button onClick={() => setPagina("barbeiros")}>Barbeiros</button>
          <button onClick={() => setPagina("servicos")}>Serviços</button>
          <button onClick={sair}>Sair</button>
        </nav>
      </header>

      <main>
        {pagina === "agendamentos" && <Agendamentos />}
        {pagina === "clientes" && <Clientes />}
        {pagina === "barbeiros" && <Barbeiros />}
        {pagina === "servicos" && <Servicos />}
      </main>
    </>
  )
}

export default App
