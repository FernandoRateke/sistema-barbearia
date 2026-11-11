import { useState, useEffect } from "react"
import { api } from "../services/api"

const formVazio = { nome: "", preco: "", duracao: "" }

export default function Servicos() {
  const [servicos, setServicos] = useState([])
  const [form, setForm] = useState(formVazio)
  const [editandoId, setEditandoId] = useState(null)
  const [mensagem, setMensagem] = useState("")

  function carregar() {
    api("/servicos")
      .then((dados) => setServicos(dados))
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
        await api(`/servicos/${editandoId}`, { method: "PUT", body: JSON.stringify(form) })
        setMensagem("Serviço atualizado")
      } else {
        await api("/servicos", { method: "POST", body: JSON.stringify(form) })
        setMensagem("Serviço cadastrado")
      }

      setForm(formVazio)
      setEditandoId(null)
      carregar()
    } catch (err) {
      setMensagem(err.message)
    }
  }

  function editar(servico) {
    setEditandoId(servico.id)
    setForm({ nome: servico.nome, preco: servico.preco, duracao: servico.duracao })
  }

  async function excluir(id) {
    try {
      await api(`/servicos/${id}`, { method: "DELETE" })
      setMensagem("Serviço excluído")
      carregar()
    } catch (err) {
      setMensagem(err.message)
    }
  }

  return (
    <section>
      <h2>Serviços</h2>

      <form onSubmit={salvar}>
        <input name="nome" placeholder="Nome do serviço" value={form.nome} onChange={alterarCampo} />
        <input name="preco" type="number" placeholder="Preço" value={form.preco} onChange={alterarCampo} />
        <input name="duracao" type="number" placeholder="Duração (minutos)" value={form.duracao} onChange={alterarCampo} />
        <button type="submit">{editandoId ? "Salvar" : "Cadastrar"}</button>
      </form>

      {mensagem && <p className="mensagem">{mensagem}</p>}

      <table>
        <thead>
          <tr>
            <th>Serviço</th>
            <th>Preço</th>
            <th>Duração</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {servicos.map((servico) => (
            <tr key={servico.id}>
              <td>{servico.nome}</td>
              <td>R$ {servico.preco.toFixed(2)}</td>
              <td>{servico.duracao} min</td>
              <td>
                <button onClick={() => editar(servico)}>Editar</button>
                <button onClick={() => excluir(servico.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
