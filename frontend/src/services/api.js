const API_URL = "http://localhost:3000"

export async function api(rota, opcoes = {}) {
  const resposta = await fetch(API_URL + rota, {
    headers: { "Content-Type": "application/json" },
    credentials: "include", // envia o cookie com o token
    ...opcoes
  })

  const dados = await resposta.json()

  if (!resposta.ok) {
    throw new Error(dados.error || "Erro na requisição")
  }

  return dados
}
