// DADOS INICIAIS DE TESTE
let insumos = JSON.parse(localStorage.getItem("insumos")) || [
    { id: 1, nome: "Arroz Tipo 1", categoria: "Grãos e Cereais", unidade: "kg", qtd: 25, minimo: 10 },
    { id: 2, nome: "Feijão Carioca", categoria: "Grãos e Cereais", unidade: "kg", qtd: 15, minimo: 8 },
    { id: 3, nome: "Óleo de Soja", categoria: "Cozinha", unidade: "litro", qtd: 10, minimo: 5 },
    { id: 4, nome: "Carne Bovina (Alcatra)", categoria: "Carnes", unidade: "kg", qtd: 8, minimo: 15 },
    { id: 5, nome: "Peito de Frango", categoria: "Carnes", unidade: "kg", qtd: 5, minimo: 10 },
    { id: 6, nome: "Coca-Cola 2L", categoria: "Bebidas", unidade: "unidade", qtd: 30, minimo: 20 },
    { id: 7, nome: "Sal Refinado", categoria: "Temperos", unidade: "kg", qtd: 3, minimo: 5 },
    { id: 8, nome: "Detergente Líquido", categoria: "Limpeza", unidade: "litro", qtd: 2, minimo: 3 }
];

let historico = JSON.parse(localStorage.getItem("historico")) || [
    "2024-03-15 09:30: Entrada: 10 kg de Arroz Tipo 1 (Fornecedor: Cereais Ltda)",
    "2024-03-14 14:15: Saída: 5 kg de Peito de Frango (Responsável: Chef João)",
    "2024-03-14 11:00: Entrada: 20 unidades de Coca-Cola 2L (Fornecedor: Bebidas S.A.)",
    "2024-03-13 16:45: Saída: 3 kg de Carne Bovina (Alcatra) (Prato: Bife à Parmegiana)"
];

// FUNÇÕES DE ARMAZENAMENTO
function salvar() {
    localStorage.setItem("insumos", JSON.stringify(insumos));
    localStorage.setItem("historico", JSON.stringify(historico));
}

// ATUALIZAR DASHBOARD
function atualizarDashboard() {
    const total = insumos.length;
    const baixo = insumos.filter(i => i.qtd <= i.minimo && i.qtd > i.minimo * 0.3).length;
    const critico = insumos.filter(i => i.qtd <= i.minimo * 0.3).length;
    
    document.getElementById("totalItens").textContent = total;
    document.getElementById("baixoEstoque").textContent = baixo;
    document.getElementById("critico").textContent = critico;
}

// ATUALIZAR TODA A TELA
function atualizarTela() {
    const tabela = document.getElementById("tabelaInsumos");
    const entradaSel = document.getElementById("entradaInsumo");
    const saidaSel = document.getElementById("saidaInsumo");
    
    tabela.innerHTML = entradaSel.innerHTML = saidaSel.innerHTML = "";
    
    // Adicionar opção vazia
    entradaSel.innerHTML = '<option value="">Selecione um insumo...</option>';
    saidaSel.innerHTML = '<option value="">Selecione um insumo...</option>';
    
    insumos.forEach(insumo => {
        // Status do estoque
        let status = "normal";
        let statusText = "Normal";
        let statusClass = "status-normal";
        
        if (insumo.minimo) {
            if (insumo.qtd <= insumo.minimo * 0.3) {
                status = "critico";
                statusText = "Crítico";
                statusClass = "status-critico";
            } else if (insumo.qtd <= insumo.minimo) {
                status = "alerta";
                statusText = "Alerta";
                statusClass = "status-alerta";
            }
        }
        
        // Linha da tabela
        const tr = document.createElement("tr");
        tr.dataset.id = insumo.id;
        tr.innerHTML = `
            <td><strong>${insumo.nome}</strong></td>
            <td>${insumo.categoria}</td>
            <td>${insumo.unidade}</td>
            <td><strong>${insumo.qtd}</strong></td>
            <td>${insumo.minimo || "-"}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td class="actions-cell">
                <button onclick="editarInsumo(${insumo.id})" class="action-btn edit-btn">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button onclick="excluirInsumo(${insumo.id})" class="action-btn delete-btn">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </td>
        `;
        tabela.appendChild(tr);
        
        // Opções dos selects
        entradaSel.innerHTML += `<option value="${insumo.id}">${insumo.nome} (${insumo.qtd} ${insumo.unidade})</option>`;
        saidaSel.innerHTML += `<option value="${insumo.id}">${insumo.nome} (${insumo.qtd} ${insumo.unidade})</option>`;
    });
    
    // Atualizar histórico
    const lista = document.getElementById("historico");
    lista.innerHTML = "";
    
    historico.slice(-10).reverse().forEach(item => {
        const li = document.createElement("li");
        const tipo = item.includes("Entrada:") ? "historico-entrada" : "historico-saida";
        li.className = tipo;
        
        // Extrair data se existir
        const parts = item.split(": ");
        const hora = parts[0];
        const texto = parts.slice(1).join(": ");
        
        li.innerHTML = `
            <div>
                <strong>${texto}</strong>
                <span class="historico-data">${hora}</span>
            </div>
            <i class="fas ${tipo === 'historico-entrada' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
        `;
        lista.appendChild(li);
    });
    
    // Atualizar dashboard e salvar
    atualizarDashboard();
    salvar();
}

// ADICIONAR INSUMO
document.getElementById("formInsumo").onsubmit = function(e) {
    e.preventDefault();
    
    const novoInsumo = {
        id: Date.now(),
        nome: document.getElementById("nome").value.trim(),
        categoria: document.getElementById("categoria").value,
        unidade: document.getElementById("unidade").value,
        qtd: parseFloat(document.getElementById("quantidade").value),
        minimo: document.getElementById("minimo").value ? parseFloat(document.getElementById("minimo").value) : null
    };
    
    insumos.push(novoInsumo);
    
    // Adicionar ao histórico
    const agora = new Date().toISOString().slice(0, 16).replace('T', ' ');
    historico.push(`${agora}: Cadastrado: ${novoInsumo.nome} (${novoInsumo.qtd} ${novoInsumo.unidade})`);
    
    atualizarTela();
    this.reset();
    
    alert(`Insumo "${novoInsumo.nome}" cadastrado com sucesso!`);
};

// REGISTRAR ENTRADA
document.getElementById("formEntrada").onsubmit = function(e) {
    e.preventDefault();
    
    const insumoId = document.getElementById("entradaInsumo").value;
    const quantidade = parseFloat(document.getElementById("entradaQtd").value);
    const fornecedor = document.getElementById("fornecedor").value.trim();
    const valor = document.getElementById("valor").value;
    const data = document.getElementById("dataEntrada").value;
    
    if (!insumoId || !quantidade) {
        alert("Selecione um insumo e informe a quantidade!");
        return;
    }
    
    const insumo = insumos.find(i => i.id == insumoId);
    insumo.qtd += quantidade;
    
    // Registrar no histórico
    const agora = data ? data : new Date().toISOString().slice(0, 10);
    let texto = `${agora}: Entrada: ${quantidade} ${insumo.unidade} de ${insumo.nome}`;
    if (fornecedor) texto += ` (Fornecedor: ${fornecedor})`;
    if (valor) texto += ` - Valor: R$ ${parseFloat(valor).toFixed(2)}`;
    
    historico.push(texto);
    
    atualizarTela();
    this.reset();
    
    alert(`Entrada de ${quantidade} ${insumo.unidade} de ${insumo.nome} registrada!`);
};

// REGISTRAR SAÍDA
document.getElementById("formSaida").onsubmit = function(e) {
    e.preventDefault();
    
    const insumoId = document.getElementById("saidaInsumo").value;
    const quantidade = parseFloat(document.getElementById("saidaQtd").value);
    const responsavel = document.getElementById("responsavel").value.trim();
    const destino = document.getElementById("destino").value.trim();
    const data = document.getElementById("dataSaida").value;
    
    if (!insumoId || !quantidade) {
        alert("Selecione um insumo e informe a quantidade!");
        return;
    }
    
    const insumo = insumos.find(i => i.id == insumoId);
    
    // Verificar estoque
    if (quantidade > insumo.qtd) {
        alert(`Quantidade insuficiente! Disponível: ${insumo.qtd} ${insumo.unidade}`);
        return;
    }
    
    insumo.qtd -= quantidade;
    
    // Verificar se ficou abaixo do mínimo
    if (insumo.minimo && insumo.qtd < insumo.minimo) {
        alert(`ATENÇÃO: ${insumo.nome} ficou abaixo do estoque mínimo! (${insumo.qtd}/${insumo.minimo})`);
    }
    
    // Registrar no histórico
    const agora = data ? data : new Date().toISOString().slice(0, 10);
    let texto = `${agora}: Saída: ${quantidade} ${insumo.unidade} de ${insumo.nome}`;
    if (responsavel) texto += ` (Responsável: ${responsavel})`;
    if (destino) texto += ` - Destino: ${destino}`;
    
    historico.push(texto);
    
    atualizarTela();
    this.reset();
    
    alert(`Saída de ${quantidade} ${insumo.unidade} de ${insumo.nome} registrada!`);
};

// EDITAR INSUMO
function editarInsumo(id) {
    const insumo = insumos.find(i => i.id == id);
    
    document.getElementById("editId").value = insumo.id;
    document.getElementById("editNome").value = insumo.nome;
    document.getElementById("editQuantidade").value = insumo.qtd;
    document.getElementById("editMinimo").value = insumo.minimo || "";
    
    // Popular selects de categoria e unidade
    const categorias = ["Grãos e Cereais", "Carnes", "Laticínios", "Hortifrúti", "Bebidas", "Temperos", "Limpeza"];
    const unidades = ["kg", "g", "litro", "ml", "unidade", "pacote", "caixa"];
    
    const catSelect = document.getElementById("editCategoria");
    const uniSelect = document.getElementById("editUnidade");
    
    catSelect.innerHTML = categorias.map(cat => 
        `<option value="${cat}" ${cat === insumo.categoria ? 'selected' : ''}>${cat}</option>`
    ).join('');
    
    uniSelect.innerHTML = unidades.map(uni => 
        `<option value="${uni}" ${uni === insumo.unidade ? 'selected' : ''}>${uni}</option>`
    ).join('');
    
    // Abrir modal
    document.getElementById("modalEdicao").style.display = "flex";
}

// FORM DE EDIÇÃO
document.getElementById("formEdicao").onsubmit = function(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById("editId").value);
    const insumo = insumos.find(i => i.id == id);
    
    const nomeAntigo = insumo.nome;
    const qtdAntiga = insumo.qtd;
    
    insumo.nome = document.getElementById("editNome").value.trim();
    insumo.categoria = document.getElementById("editCategoria").value;
    insumo.unidade = document.getElementById("editUnidade").value;
    insumo.qtd = parseFloat(document.getElementById("editQuantidade").value);
    insumo.minimo = document.getElementById("editMinimo").value ? parseFloat(document.getElementById("editMinimo").value) : null;
    
    // Registrar alteração no histórico
    const agora = new Date().toISOString().slice(0, 16).replace('T', ' ');
    historico.push(`${agora}: Editado: ${nomeAntigo} → ${insumo.nome} (Estoque: ${qtdAntiga} → ${insumo.qtd} ${insumo.unidade})`);
    
    atualizarTela();
    fecharModal();
    
    alert(`Insumo "${insumo.nome}" atualizado com sucesso!`);
};

// EXCLUIR INSUMO
function excluirInsumo(id) {
    if (!confirm("Tem certeza que deseja excluir este insumo?")) return;
    
    const insumo = insumos.find(i => i.id == id);
    insumos = insumos.filter(i => i.id !== id);
    
    // Registrar exclusão
    const agora = new Date().toISOString().slice(0, 16).replace('T', ' ');
    historico.push(`${agora}: Excluído: ${insumo.nome} (Estoque: ${insumo.qtd} ${insumo.unidade})`);
    
    atualizarTela();
    alert(`Insumo "${insumo.nome}" excluído!`);
}

// FUNÇÕES DE TAB
function abrirTab(tabName) {
    // Esconder todas as tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover active de todos os botões
    document.querySelectorAll('.tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar tab selecionada
    document.getElementById(`form${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');
    
    // Ativar botão correspondente
    event.target.classList.add('active');
}

// FUNÇÕES DO HISTÓRICO
function filtrarHistorico() {
    const filtro = document.getElementById("filtroHistorico").value.toLowerCase();
    const itens = document.querySelectorAll("#historico li");
    
    itens.forEach(item => {
        const texto = item.textContent.toLowerCase();
        item.style.display = texto.includes(filtro) ? "flex" : "none";
    });
}

function limparHistorico() {
    if (!confirm("Deseja realmente limpar todo o histórico? Esta ação não pode ser desfeita.")) return;
    
    historico = [];
    atualizarTela();
    alert("Histórico limpo!");
}

function exportarHistorico() {
    const data = historico.join('\n');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico-estoque-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    alert("Histórico exportado com sucesso!");
}

// EXPORTAR PARA CSV
function exportarCSV() {
    // Cabeçalho
    let csv = "Nome;Categoria;Unidade;Estoque;Mínimo;Status\n";
    
    // Dados
    insumos.forEach(insumo => {
        let status = "Normal";
        if (insumo.minimo) {
            if (insumo.qtd <= insumo.minimo * 0.3) status = "Crítico";
            else if (insumo.qtd <= insumo.minimo) status = "Alerta";
        }
        
        csv += `${insumo.nome};${insumo.categoria};${insumo.unidade};${insumo.qtd};${insumo.minimo || ""};${status}\n`;
    });
    
    // Criar e baixar arquivo
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `estoque-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    alert("Estoque exportado para CSV!");
}

// MODAL
function fecharModal() {
    document.getElementById("modalEdicao").style.display = "none";
    document.getElementById("formEdicao").reset();
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById("modalEdicao");
    if (event.target == modal) {
        fecharModal();
    }
};

// DATA ATUAL NOS FORMULÁRIOS
document.addEventListener("DOMContentLoaded", function() {
    const hoje = new Date().toISOString().slice(0, 10);
    document.getElementById("dataEntrada").value = hoje;
    document.getElementById("dataSaida").value = hoje;
    
    // Inicializar a tela
    atualizarTela();
    
    console.log("Sistema de Estoque carregado com sucesso!");
    console.log(`${insumos.length} insumos carregados`);
    console.log(`${historico.length} movimentações no histórico`);
});