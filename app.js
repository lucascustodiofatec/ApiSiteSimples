const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do banco de dados
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) console.error("Erro ao conectar ao banco: ", err);
    else console.log("Conectado ao banco de dados!");
});

// Rota para calcular imposto com juros compostos e salvar no banco
app.post("/calcular", (req, res) => {
    const { principal, taxa, tempo, usuario } = req.body;
    if (!principal || !taxa || !tempo || !usuario) {
        return res.status(400).json({ erro: "Informe principal, taxa, tempo e usuário" });
    }

    const montante = principal * Math.pow(1 + taxa / 100, tempo);
    
    const query = "INSERT INTO historico (usuario, principal, taxa, tempo, montante) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [usuario, principal, taxa, tempo, montante], (err, result) => {
        if (err) return res.status(500).json({ erro: "Erro ao salvar no banco" });
        res.json({ montante: montante.toFixed(2) });
    });
});

// Rota para obter histórico de cálculos de um usuário
app.get("/historico/:usuario", (req, res) => {
    const { usuario } = req.params;
    db.query("SELECT * FROM historico WHERE usuario = ?", [usuario], (err, results) => {
        if (err) return res.status(500).json({ erro: "Erro ao buscar histórico" });
        res.json(results);
    });
});

app.listen(3001, () => console.log("Servidor rodando na porta 3001"));