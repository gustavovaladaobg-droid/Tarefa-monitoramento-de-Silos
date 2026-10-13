# Sistema Agroindustrial de Monitoramento de Silos (SSE2)

**Atividade Prática — SSE2 (UML Completo)**  
**Docente:** Me. Sergio Souza Novak  
**Disciplina:** Desenvolvimento de Software para Web  
**Instituição:** UniRV - Universidade de Rio Verde  

---

## 🌾 1. Visão Geral da Solução

O sistema implementa uma arquitetura híbrida para centros de monitoramento e controle de armazéns verticais de grãos:
- **Server-Sent Events (SSE)**: Transmissão contínua unidirecional em tempo real (*push*) de dados de telemetria dos silos (temperatura, concentração de CO₂, umidade e nível de grãos) para os painéis de controle, eliminando o desperdício de banda do *polling* HTTP tradicional.
- **HTTP REST**: Transmissão pontual de requisições de comando de atuadores físicos (comportas de descompressão/aeração e exaustores térmicos) com controle de intertravamento de segurança (*Safety Interlock*).

---

## 🚀 2. Como Executar a Aplicação

### Pré-requisitos
- **Node.js** (v18 ou superior instalado)
- **NPM**

### Instalação e Execução

1. No diretório do projeto, certifique-se de que as dependências estão instaladas:
   ```bash
   npm install
   ```

2. Inicie o servidor Node.js / Express:
   ```bash
   node server.js
   ```

3. Abra o navegador em:
   ```
   http://localhost:3000
   ```
   *(A rota raiz redireciona automaticamente para `tela1-dashboard.html`)*.

---

## 🖥️ 3. Protótipos de Interface Implementados

| Tela | Arquivo | Descrição |
|---|---|---|
| **Tela 1: Dashboard Geral** | `tela1-dashboard.html` | Painel central com cards visuais de todos os silos (01 a 06), atualização em tempo real via SSE sem recarga de página, filtros rápidos por grão e alertas, medidores térmicos/gás, status dos atuadores e alerta sonoro/visual para emergências críticas. |
| **Tela 2: Visão Detalhada com Corte SVG** | `tela2-detalhe.html?siloId=2` | Ilustração em vetor SVG com corte transversal do silo, termopares estratificados em 3 níveis (Topo, Meio, Fundo) com coloração térmica dinâmica, animação rotativa dos exaustores, comporta superior dinâmica, volume de grãos proporcional e gráfico histórico em tempo real. |
| **Tela 3: Parametrização e Controle** | `tela3-controle.html?siloId=2` | Interface de operação com chave seletora (*Toggle*) entre Modo Automático (*Safety Interlock*) e Modo Manual, botões industriais para comando individualizado de comportas e exaustores com confirmação física por LEDs, tratamento de fluxo de chuva/sobrecarga e terminal de auditoria das últimas 20 ocorrências. |

---

## 📡 4. Especificação de Protocolos e Rotas da API

### Server-Sent Events (SSE)
- **`GET /api/silos/stream`** ou **`GET /events`**
  - *Content-Type:* `text/event-stream`
  - *Event:* `sensor_update`
  - *Payload (Listing 1):*
    ```json
    {
      "siloId": 2,
      "temperatura": 31.7,
      "co2": 1450,
      "umidade": 14.2,
      "comporta": "ABERTA",
      "exaustor": "LIGADO",
      "alarme": "CO2_ELEVADO",
      "timestamp": "2026-09-09T14:35:02Z"
    }
    ```

### HTTP REST (Comandos e Auditoria)
- **`GET /api/silos`**: Retorna o estado consolidado de todos os silos (usado na reconexão rápida - RNF-02).
- **`GET /api/silos/:id`**: Retorna os detalhes de um silo individual.
- **`POST /api/silos/:id/atuadores`**: Acionamento manual de atuadores (Listing 2 e Listing 3).
  - *Corpo da Requisição (Listing 2):*
    ```json
    {
      "siloId": 2,
      "comportaComando": "ABRIR",
      "exaustorComando": "LIGAR",
      "operadorId": "OP-882"
    }
    ```
  - *Resposta do Servidor (Listing 3):*
    ```json
    {
      "sucesso": true,
      "siloId": 2,
      "novoEstado": {
        "comporta": "ABERTA",
        "exaustor": "LIGADO"
      },
      "mensagem": "Comando executado com sucesso nos atuadores do Silo 02."
    }
    ```
- **`GET /api/logs`**: Consulta o log de auditoria em memória das últimas 20 ocorrências (RF-08).
- **`POST /api/simulador/injecao`**: Endpoint facilitador para acionamento de cenários de teste pelas bancas de avaliação (ex: disparar superaquecimento imediato).

---

## 📋 5. Atendimento aos Requisitos Formais

- **[RF-01] Coleta e Simulação de Telemetria**: Motor em segundo plano no Node.js atualizando leituras dinâmicas dos silos a cada 1 a 2 segundos.
- **[RF-02] Endpoint SSE**: Rota `GET /events` e `GET /api/silos/stream` emitindo `event: sensor_update`.
- **[RF-03] Automação por CO₂**: Alerta visual quando CO₂ $\ge 1.000$ ppm; abertura automática de comporta quando CO₂ $\ge 1.500$ ppm.
- **[RF-04] Automação por Temperatura**: Aciona exaustores automaticamente quando Temp $\ge 30,0$ °C; alarme sonoro e visual crítico quando Temp $\ge 35,0$ °C.
- **[RF-05] Trava por Capacidade de Carga**: Bloqueio automático para carga quando nível $\ge 98\%$.
- **[RF-06] Controle Manual via POST**: Rotas de controle REST com suporte a sobrescrita e logs imediatos.
- **[RF-07] Dashboard Web Responsivo**: Atualização instantânea sem recarga de página.
- **[RF-08] Log e Auditoria**: Ring buffer de memória mantendo as últimas 20 ocorrências com timestamp.
- **[RNF-01] Separação Arquitetural**: Transmissão unidirecional via SSE e controle pontual via REST POST.
- **[RNF-02] Tolerância a Falhas**: Reconexão periódica com feedback visual e sincronização imediata de estado pós-queda.
- **[RNF-03] Padronização JSON**: Payloads estritamente alinhados aos listings 1, 2 e 3 do documento da disciplina.

---

## 🗄️ 6. Esquema de Banco de Dados e Diagramas UML

- O script de banco de dados relacional completo (PlantUML ERD) está disponível em: [`database/schema.sql`](file:///c:/src/tarefasValadao/tarefaAgro/database/schema.sql).
- Os diagramas UML (Casos de Uso em TikZ/Mermaid, Diagrama de Sequência SSE e ERD) estão disponíveis em: [`docs/UML_DIAGRAMS.md`](file:///c:/src/tarefasValadao/tarefaAgro/docs/UML_DIAGRAMS.md).
