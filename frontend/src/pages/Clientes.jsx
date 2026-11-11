import { useState, useEffect } from "react"
import { api } from "../services/api"

const formVazio = { nome: "", cpf: "", telefone: "" }

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState(formVazio)
  const [editandoId, setEditandoId] = useState(null)
  const [mensagem, setMensagem] = useState("")

  function carregar() {
    api("/clientes")
      .then((dados) => setClientes(dados))
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
        await api(`/clientes/${editandoId}`, { method: "PUT", body: JSON.stringify(form) })
        setMensagem("Cliente atualizado")
      } else {
        await api("/clientes", { method: "POST", body: JSON.stringify(form) })
        setMensagem("Cliente cadastrado")
      }

      setForm(formVazio)
      setEditandoId(null)
      carregar()
    } catch (err) {
      setMensagem(err.message)
    }
  }

  function editar(cliente) {
    setEditandoId(cliente.id)
    setForm({ nome: cliente.nome, cpf: cliente.cpf, telefone: cliente.telefone })
  }

  async function excluir(id) {
    try {
      await api(`/clientes/${id}`, { method: "DELETE" })
      setMensagem("Cliente excluído")
      carregar()
    } catch (err) {
      setMensagem(err.message)
    }
  }

  return (
    <section>
      <h2>Clientes</h2>

      <form onSubmit={salvar}>
        <input name="nome" placeholder="Nome" value={form.nome} onChange={alterarCampo} />
        <input name="cpf" placeholder="CPF" value={form.cpf} onChange={alterarCampo} />
        <input name="telefone" placeholder="Telefone" value={form.telefone} onChange={alterarCampo} />
        <button type="submit">{editandoId ? "Salvar" : "Cadastrar"}</button>
      </form>

      {mensagem && <p className="mensagem">{mensagem}</p>}

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.nome}</td>
              <td>{cliente.cpf}</td>
              <td>{cliente.telefone}</td>
              <td>
                <button onClick={() => editar(cliente)}>Editar</button>
                <button onClick={() => excluir(cliente.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
