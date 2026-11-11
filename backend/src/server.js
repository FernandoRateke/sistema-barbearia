import "dotenv/config"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "./lib/prisma.ts"

const app = express()
const PORT = 3000
const JWT_SECRET = process.env.JWT_SECRET

// credentials: true libera o envio do cookie pelo front
app.use(cors({ origin: "http://localhost:5173", credentials: true }))
app.use(express.json())
app.use(cookieParser())

// verifica se o token do cookie é válido antes de liberar a rota
function autenticar(req, res, next) {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({ error: "Acesso não autorizado. Faça login." })
    }

    try {
        const dados = jwt.verify(token, JWT_SECRET)
        req.usuarioId = dados.id
        next()
    } catch (err) {
        return res.status(401).json({ error: "Sessão expirada. Faça login novamente." })
    }
}

// =============================================== AUTENTICAÇÃO ===============================================

app.post("/auth/cadastro", async (req, res) => {
    try {
        const { nome, email, senha } = req.body

        if (!nome || !email || !senha) {
            return res.status(400).json({ error: "Preencha todos os campos" })
        }

        const senhaHash = await bcrypt.hash(senha, 10)

        const usuario = await prisma.usuario.create({
            data: { nome, email, senha: senhaHash },
            select: { id: true, nome: true, email: true }
        })

        res.status(201).json(usuario)
    } catch (err) {
        if (err.code === "P2002") {
            return res.status(409).json({ error: "Email já cadastrado" })
        }

        res.status(500).json({ error: "Erro ao cadastrar usuário" })
    }
})

app.post("/auth/login", async (req, res) => {
    try {
        const { email, senha } = req.body

        const usuario = await prisma.usuario.findUnique({ where: { email } })

        if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
            return res.status(401).json({ error: "Email ou senha incorretos" })
        }

        const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: "2h" })

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 2 * 60 * 60 * 1000 // 2 horas
        })

        res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email })
    } catch (err) {
        res.status(500).json({ error: "Erro ao realizar login" })
    }
})

app.post("/auth/logout", (req, res) => {
    res.clearCookie("token")
    res.json({ message: "Sessão encerrada" })
})

app.get("/auth/me", autenticar, async (req, res) => {
    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id: req.usuarioId },
            select: { id: true, nome: true, email: true }
        })

        if (!usuario) {
            return res.status(404).json({ error: "Usuário não encontrado" })
        }

        res.json(usuario)
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar usuário" })
    }
})

// =============================================== CLIENTES ===============================================

app.get("/clientes", autenticar, async (req, res) => {
    try {
        const clientes = await prisma.cliente.findMany({ orderBy: { id: "asc" } })
        res.json(clientes)
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar clientes" })
    }
})

app.post("/clientes", autenticar, async (req, res) => {
    try {
        const { nome, cpf, telefone } = req.body

        if (!nome || !cpf || !telefone) {
            return res.status(400).json({ error: "Preencha todos os campos" })
        }

        const cliente = await prisma.cliente.create({ data: { nome, cpf, telefone } })
        res.status(201).json(cliente)
    } catch (err) {
        if (err.code === "P2002") {
            return res.status(409).json({ error: "CPF já cadastrado" })
        }

        res.status(500).json({ error: "Erro ao cadastrar cliente" })
    }
})

app.put("/clientes/:id", autenticar, async (req, res) => {
    try {
        const id = Number(req.params.id)
        const { nome, cpf, telefone } = req.body

        const cliente = await prisma.cliente.update({ where: { id }, data: { nome, cpf, telefone } })
        res.json(cliente)
    } catch (err) {
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Cliente não encontrado" })
        }

        if (err.code === "P2002") {
            return res.status(409).json({ error: "CPF já cadastrado" })
        }

        res.status(500).json({ error: "Erro ao atualizar cliente" })
    }
})

app.delete("/clientes/:id", autenticar, async (req, res) => {
    try {
        const id = Number(req.params.id)

        await prisma.cliente.delete({ where: { id } })
        res.json({ message: "Cliente excluído com sucesso" })
    } catch (err) {
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Cliente não encontrado" })
        }

        if (err.code === "P2003") {
            return res.status(409).json({ error: "Não é possível excluir: cliente possui agendamentos" })
        }

        res.status(500).json({ error: "Erro ao excluir cliente" })
    }
})

// =============================================== BARBEIROS ===============================================

app.get("/barbeiros", autenticar, async (req, res) => {
    try {
        const barbeiros = await prisma.barbeiro.findMany({ orderBy: { id: "asc" } })
        res.json(barbeiros)
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar barbeiros" })
    }
})

app.post("/barbeiros", autenticar, async (req, res) => {
    try {
        const { nome, telefone } = req.body

        if (!nome || !telefone) {
            return res.status(400).json({ error: "Preencha todos os campos" })
        }

        const barbeiro = await prisma.barbeiro.create({ data: { nome, telefone } })
        res.status(201).json(barbeiro)
    } catch (err) {
        res.status(500).json({ error: "Erro ao cadastrar barbeiro" })
    }
})

app.put("/barbeiros/:id", autenticar, async (req, res) => {
    try {
        const id = Number(req.params.id)
        const { nome, telefone } = req.body

        const barbeiro = await prisma.barbeiro.update({ where: { id }, data: { nome, telefone } })
        res.json(barbeiro)
    } catch (err) {
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Barbeiro não encontrado" })
        }

        res.status(500).json({ error: "Erro ao atualizar barbeiro" })
    }
})

app.delete("/barbeiros/:id", autenticar, async (req, res) => {
    try {
        const id = Number(req.params.id)

        await prisma.barbeiro.delete({ where: { id } })
        res.json({ message: "Barbeiro excluído com sucesso" })
    } catch (err) {
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Barbeiro não encontrado" })
        }

        if (err.code === "P2003") {
            return res.status(409).json({ error: "Não é possível excluir: barbeiro possui agendamentos" })
        }

        res.status(500).json({ error: "Erro ao excluir barbeiro" })
    }
})

// =============================================== SERVIÇOS ===============================================

app.get("/servicos", autenticar, async (req, res) => {
    try {
        const servicos = await prisma.servico.findMany({ orderBy: { id: "asc" } })
        res.json(servicos)
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar serviços" })
    }
})

app.post("/servicos", autenticar, async (req, res) => {
    try {
        const { nome, preco, duracao } = req.body

        if (!nome || !preco || !duracao) {
            return res.status(400).json({ error: "Preencha todos os campos" })
        }

        const servico = await prisma.servico.create({
            data: { nome, preco: Number(preco), duracao: Number(duracao) }
        })

        res.status(201).json(servico)
    } catch (err) {
        res.status(500).json({ error: "Erro ao cadastrar serviço" })
    }
})

app.put("/servicos/:id", autenticar, async (req, res) => {
    try {
        const id = Number(req.params.id)
        const { nome, preco, duracao } = req.body

        const servico = await prisma.servico.update({
            where: { id },
            data: { nome, preco: Number(preco), duracao: Number(duracao) }
        })

        res.json(servico)
    } catch (err) {
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Serviço não encontrado" })
        }

        res.status(500).json({ error: "Erro ao atualizar serviço" })
    }
})

app.delete("/servicos/:id", autenticar, async (req, res) => {
    try {
        const id = Number(req.params.id)

        await prisma.servico.delete({ where: { id } })
        res.json({ message: "Serviço excluído com sucesso" })
    } catch (err) {
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Serviço não encontrado" })
        }

        if (err.code === "P2003") {
            return res.status(409).json({ error: "Não é possível excluir: serviço possui agendamentos" })
        }

        res.status(500).json({ error: "Erro ao excluir serviço" })
    }
})

// =============================================== AGENDAMENTOS ===============================================

app.get("/agendamentos", autenticar, async (req, res) => {
    try {
        const agendamentos = await prisma.agendamento.findMany({
            orderBy: { dataHora: "asc" },
            include: {
                cliente: { select: { nome: true } },
                barbeiro: { select: { nome: true } },
                servico: { select: { nome: true, preco: true } }
            }
        })

        res.json(agendamentos)
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar agendamentos" })
    }
})

app.post("/agendamentos", autenticar, async (req, res) => {
    try {
        const { dataHora, clienteId, barbeiroId, servicoId } = req.body

        if (!dataHora || !clienteId || !barbeiroId || !servicoId) {
            return res.status(400).json({ error: "Preencha todos os campos" })
        }

        // não deixa marcar dois clientes no mesmo horário com o mesmo barbeiro
        const horarioOcupado = await prisma.agendamento.findFirst({
            where: {
                barbeiroId: Number(barbeiroId),
                dataHora: new Date(dataHora),
                status: "AGENDADO"
            }
        })

        if (horarioOcupado) {
            return res.status(409).json({ error: "Esse barbeiro já tem um agendamento nesse horário" })
        }

        const agendamento = await prisma.agendamento.create({
            data: {
                dataHora: new Date(dataHora),
                clienteId: Number(clienteId),
                barbeiroId: Number(barbeiroId),
                servicoId: Number(servicoId)
            }
        })

        res.status(201).json(agendamento)
    } catch (err) {
        if (err.code === "P2003") {
            return res.status(400).json({ error: "Cliente, barbeiro ou serviço não existe" })
        }

        res.status(500).json({ error: "Erro ao criar agendamento" })
    }
})

app.put("/agendamentos/:id", autenticar, async (req, res) => {
    try {
        const id = Number(req.params.id)
        const { status } = req.body

        const agendamento = await prisma.agendamento.update({ where: { id }, data: { status } })
        res.json(agendamento)
    } catch (err) {
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Agendamento não encontrado" })
        }

        res.status(500).json({ error: "Erro ao atualizar agendamento" })
    }
})

app.delete("/agendamentos/:id", autenticar, async (req, res) => {
    try {
        const id = Number(req.params.id)

        await prisma.agendamento.delete({ where: { id } })
        res.json({ message: "Agendamento excluído com sucesso" })
    } catch (err) {
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Agendamento não encontrado" })
        }

        res.status(500).json({ error: "Erro ao excluir agendamento" })
    }
})

app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`)
})
