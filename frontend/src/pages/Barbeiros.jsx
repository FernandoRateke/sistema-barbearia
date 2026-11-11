import { useState, useEffect } from "react"
import { api } from "../services/api"

const formVazio = { nome: "", telefone: "" }

export default function Barbeiros() {
  const [barbeiros, setBarbeiros] = useState([])
  const [form, setForm] = useState(formVazio)
  const [editandoId, setEditandoId] = useState(null)
  const [mensagem, setMensagem] = useState("")

  function carregar() {
    api("/barbeiros")
      .then((dados) => setBarbeiros(dados))
      .catch((err) => setMensagem(err.message))
  }

  useEffect(() => {
    carregar()
  }, [])

  function alterarCampo(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function salvar(e) {
    e.preventDefault()

    try {
      if (editandoId) {
        await api(`/barbeiros/${editandoId}`, { method: "PUT", body: JSON.stringify(form) })
        setMensagem("Barbeiro atualizado")
      } else {
        await api("/barbeiros", { method: "POST", body: JSON.stringify(form) })
        setMensagem("Barbeiro cadastrado")
      }

      setForm(formVazio)
      setEditandoId(null)
      carregar()
    } catch (err) {
      setMensagem(err.message)
    }
  }

  function editar(barbeiro) {
    setEditandoId(barbeiro.id)
    setForm({ nome: barbeiro.nome, telefone: barbeiro.telefone })
  }

  async function excluir(id) {
    try {
      await api(`/barbeiros/${id}`, { method: "DELETE" })
      setMensagem("Barbeiro excluído")
      carregar()
    } catch (err) {
      setMensagem(err.message)
    }
  }

  return (
    <section>
      <h2>Barbeiros</h2>

      <form onSubmit={salvar}>
        <input name="nome" placeholder="Nome" value={form.nome} onChange={alterarCampo} />
        <input name="telefone" placeholder="Telefone" value={form.telefone} onChange={alterarCampo} />
        <button type="submit">{editandoId ? "Salvar" : "Cadastrar"}</button>
      </form>

      {mensagem && <p className="mensagem">{mensagem}</p>}

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {barbeiros.map((barbeiro) => (
            <tr key={barbeiro.id}>
              <td>{barbeiro.nome}</td>
              <td>{barbeiro.telefone}</td>
              <td>
                <button onClick={() => editar(barbeiro)}>Editar</button>
                <button onClick={() => excluir(barbeiro.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
