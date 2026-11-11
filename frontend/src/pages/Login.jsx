import { useState } from "react"
import { api } from "../services/api"

export default function Login({ onLogin }) {
  const [cadastro, setCadastro] = useState(false)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [mensagem, setMensagem] = useState("")

  async function enviar(e) {
    e.preventDefault()

    try {
      if (cadastro) {
        await api("/auth/cadastro", {
          method: "POST",
          body: JSON.stringify({ nome, email, senha })
        })
      }

      const usuario = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, senha })
      })

      onLogin(usuario)
    } catch (err) {
      setMensagem(err.message)
    }
  }

  return (
    <div className="login">
      <form onSubmit={enviar}>
        <h1>{cadastro ? "Criar conta" : "Barbearia"}</h1>

        {cadastro && (
          <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        )}

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} />

        {mensagem && <p className="mensagem">{mensagem}</p>}

        <button type="submit">{cadastro ? "Cadastrar" : "Entrar"}</button>

        <button type="button" onClick={() => setCadastro(!cadastro)}>
          {cadastro ? "Já tenho conta" : "Criar conta"}
        </button>
      </form>
    </div>
  )
}
