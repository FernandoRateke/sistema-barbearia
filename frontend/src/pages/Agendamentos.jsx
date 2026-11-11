import { useState, useEffect } from "react"
import { api } from "../services/api"

const formVazio = { clienteId: "", barbeiroId: "", servicoId: "", dataHora: "" }

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [clientes, setClientes] = useState([])
  const [barbeiros, setBarbeiros] = useState([])
  const [servicos, setServicos] = useState([])
  const [form, setForm] = useState(formVazio)
  const [mensagem, setMensagem] = useState("")

  function carregar() {
    api("/agendamentos").then((dados) => setAgendamentos(dados)).catch((err) => setMensagem(err.message))
    api("/clientes").then((dados) => setClientes(dados)).catch((err) => setMensagem(err.message))
    api("/barbeiros").then((dados) => setBarbeiros(dados)).catch((err) => setMensagem(err.message))
    api("/servicos").then((dados) => setServicos(dados)).catch((err) => setMensagem(err.message))
  }

  useEffect(() => {
    carregar()
  }, [])

  function alterarCampo(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function agendar(e) {
    e.preventDefault()

    try {
      await api("/agendamentos", { method: "POST", body: JSON.stringify(form) })
      setMensagem("Horário agendado")
      setForm(formVazio)
      carregar()
    } catch (err) {
      setMensagem(err.message)
    }
  }

  async function mudarStatus(id, status) {
    try {
      await api(`/agendamentos/${id}`, { method: "PUT", body: JSON.stringify({ status }) })
      carregar()
    } catch (err) {
      setMensagem(err.message)
    }
  }

  async function excluir(id) {
    try {
      await api(`/agendamentos/${id}`, { method: "DELETE" })
      setMensagem("Agendamento excluído")
      carregar()
    } catch (err) {
      setMensagem(err.message)
    }
  }

  return (
    <section>
      <h2>Agendamentos</h2>

      <form onSubmit={agendar}>
        <select name="clienteId" value={form.clienteId} onChange={alterarCampo}>
          <option value="">Cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
          ))}
        </select>

        <select name="barbeiroId" value={form.barbeiroId} onChange={alterarCampo}>
          <option value="">Barbeiro</option>
          {barbeiros.map((barbeiro) => (
            <option key={barbeiro.id} value={barbeiro.id}>{barbeiro.nome}</option>
          ))}
        </select>

        <select name="servicoId" value={form.servicoId} onChange={alterarCampo}>
          <option value="">Serviço</option>
          {servicos.map((servico) => (
            <option key={servico.id} value={servico.id}>{servico.nome}</option>
          ))}
        </select>

        <input name="dataHora" type="datetime-local" value={form.dataHora} onChange={alterarCampo} />

        <button type="submit">Agendar</button>
      </form>

      {mensagem && <p className="mensagem">{mensagem}</p>}

      <table>
        <thead>
          <tr>
            <th>Data e hora</th>
            <th>Cliente</th>
            <th>Barbeiro</th>
            <th>Serviço</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {agendamentos.map((agendamento) => (
            <tr key={agendamento.id}>
              <td>{new Date(agendamento.dataHora).toLocaleString("pt-BR")}</td>
              <td>{agendamento.cliente.nome}</td>
              <td>{agendamento.barbeiro.nome}</td>
              <td>{agendamento.servico.nome}</td>
              <td>R$ {agendamento.servico.preco.toFixed(2)}</td>
              <td>{agendamento.status}</td>
              <td>
                {agendamento.status === "AGENDADO" && (
                  <>
                    <button onClick={() => mudarStatus(agendamento.id, "CONCLUIDO")}>Concluir</button>
                    <button onClick={() => mudarStatus(agendamento.id, "CANCELADO")}>Cancelar</button>
                  </>
                )}
                <button onClick={() => excluir(agendamento.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
