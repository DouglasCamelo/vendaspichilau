document.addEventListener('DOMContentLoaded', function() {
    var agentMapping = {}; // Mapeamento de CODAGENTE para NOMEAGENTE

    // Carregar a planilha "AGENTE.csv" para criar o mapeamento de CODAGENTE para NOMEAGENTE
    Papa.parse("AGENTE.csv", {
        download: true,
        header: true,
        complete: function(results) {
            results.data.forEach(function(row) {
                agentMapping[row.CODAGENTE] = row.NOMEAGENTE;
            });
        }
    });

    // Função para filtrar a tabela de vendas
    function filterTable() {
        var inputAgent = document.getElementById("filterAgent").value.toUpperCase();
        var inputGroup = document.getElementById("filterGroup").value.toUpperCase();
        var table = document.getElementById("salesTable");
        var rows = table.getElementsByTagName("tr");

        for (var i = 0; i < rows.length; i++) {
            var agentCell = rows[i].getElementsByTagName("td")[0]; // Coluna do CODAGENTE
            var groupCell = rows[i].getElementsByTagName("td")[1]; // Coluna do NOMEDOGRUPO

            if (agentCell && groupCell) {
                var agentCode = agentCell.textContent || agentCell.innerText;
                var agentName = agentMapping[agentCode]; // Nome do agente associado ao CODAGENTE

                var groupText = groupCell.textContent || groupCell.innerText;

                // Verificar se o agente ou o código do agente correspondem ao filtro
                var agentMatches = (agentName && agentName.toUpperCase().includes(inputAgent)) || agentCode.toUpperCase().includes(inputAgent);
                var groupMatches = groupText.toUpperCase().includes(inputGroup);

                if (agentMatches && groupMatches) {
                    rows[i].style.display = "";
                } else {
                    rows[i].style.display = "none";
                }
            }
        }

        // Exibir o nome do agente ao lado do campo de filtro
        var agentNameDiv = document.getElementById("agentName");
        var filteredAgentCode = document.getElementById("filterAgent").value.toUpperCase();
        agentNameDiv.innerText = agentMapping[filteredAgentCode] || "";
    }

    // Função para salvar as alterações feitas nas metas
    function saveChanges() {
        var table = document.getElementById("salesTable");
        var rows = table.getElementsByTagName("tr");
        var newData = [];

        for (var i = 0; i < rows.length; i++) {
            var cells = rows[i].getElementsByTagName("td");
            var agentCode = cells[0].textContent || cells[0].innerText;
            var newMeta = cells[4].textContent || cells[4].innerText; // Novo valor da meta
            newData.push([agentCode, newMeta]); // Armazenar os novos dados em um array
        }

        // Enviar os dados para o servidor usando uma solicitação HTTP POST
        fetch('/atualizar-metas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newData)
        })
        .then(response => {
            if (response.ok) {
                console.log('Metas atualizadas com sucesso!');
            } else {
                console.error('Falha ao atualizar as metas.');
            }
        })
        .catch(error => {
            console.error('Erro ao enviar solicitação:', error);
        });
    }

    // Adicionar os eventos de escuta para os campos de filtro
    document.getElementById("filterAgent").addEventListener("keyup", filterTable);
    document.getElementById("filterGroup").addEventListener("keyup", filterTable);

    // Carregar a planilha de vendas "vendas.csv"
    Papa.parse("vendas.csv", {
        download: true,
        header: true,
        complete: function(results) {
            var data = results.data;
            var tableBody = document.getElementById('salesTable').getElementsByTagName('tbody')[0];
            data.forEach(function(row) {
                var newRow = tableBody.insertRow();
                Object.values(row).forEach(function(value) {
                    var newCell = newRow.insertCell();
                    var newText = document.createTextNode(value);
                    newCell.appendChild(newText);
                });
            });
        }
    });

    // Adicionar evento de escuta para o botão "Salvar"
    document.getElementById("saveButton").addEventListener("click", saveChanges);
});
