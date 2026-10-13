# Especificação Arquitetural e Diagramas UML
## Atividade Prática — SSE2 (UML Completo)
**Docente:** Me. Sergio Souza Novak  
**Disciplina:** Desenvolvimento de Software para Web  
**Instituição:** UniRV - Universidade de Rio Verde  

---

### 1. Diagrama de Casos de Uso (TikZ UML / Mermaid)

Atores do sistema:
- **Operador Industrial (Dashboard Web)**: Acessa o dashboard, monitora telemetria, visualiza cortes térmicos e opera atuadores manuais via HTTP REST.
- **Sensores de Campo (Ator de Sistema / CLP)**: Coleta e transmite telemetria em tempo real dos silos verticais.

```mermaid
flowchart LR
    subgraph Atores
        OP["Operador Industrial<br>(Dashboard Web)"]
        SC["Sensores de Campo<br>(Ator de Sistema / CLP)"]
    end

    subgraph Sistema ["Sistema de Automação de Silos (SSE + HTTP)"]
        UC1(["Monitorar Telemetria<br>[RF-01, RF-02]"])
        UC2(["Operar Comporta (POST)<br>[RF-06]"])
        UC3(["Ligar Exaustor (POST)<br>[RF-06]"])
        UC4(["Executar Regras CO2<br>[RF-03]"])
        UC5(["Executar Regras Temp<br>[RF-04]"])
        UC6(["Gerar Log Industrial<br>[RF-08]"])
    end

    SC --> UC1
    OP --> UC1
    OP --> UC2
    OP --> UC3
    UC1 -.-> UC4
    UC1 -.-> UC5
    UC4 -.-> UC6
    UC5 -.-> UC6
    UC2 -.-> UC6
    UC3 -.-> UC6
```

---

### 2. Diagrama de Sequência de Automação e SSE

Detalhamento da linha do tempo: detecção de $CO_2$ elevado ($\ge 1500$ ppm), disparo automático de abertura da comporta de ventilação e push via Server-Sent Events para os dashboards conectados:

```mermaid
sequenceDiagram
    autonumber
    participant Sensores as Simulador Sensores (CLP)
    participant Servidor as Servidor Express (Regras)
    participant Atuador as Atuador Comporta
    participant Dashboard as Dashboard Operador (SSE)

    Sensores->>Servidor: Telemetria {CO2: 1550 ppm, Temp: 31.7°C}
    Note over Servidor: 2. Avalia Regra (CO2 >= 1500 -> ABRIR)
    Servidor->>Atuador: 3. Sinal Físico de Abertura (Relé PLC)
    Atuador-->>Servidor: 4. Estado Atuador: ABERTA [*]
    Servidor->>Dashboard: 5. SSE EventStream (event: sensor_update)
    Note over Dashboard: 6. Atualiza Badge Silo 02: ABERTA [*] e Alerta Sonoro
```

---

### 3. Diagrama Entidade-Relacionamento do Banco de Dados (PlantUML ERD)

```plantuml
@startuml
skinparam linetype ortho

entity UNIDADE_ARMAZENAMENTO {
    * id_unidade : INT <<PK>>
    --
    nome_fazenda : VARCHAR(100)
    localizacao_geografica : VARCHAR(100)
    capacidade_total_toneladas : DECIMAL(10,2)
    responsavel_tecnico : VARCHAR(100)
}

entity SILO {
    * id_silo : INT <<PK>>
    --
    id_unidade : INT <<FK>>
    codigo_silo : VARCHAR(20)
    capacidade_maxima_m3 : DECIMAL(10,2)
    tipo_grao_armazenado : VARCHAR(50)
    status_operacional : VARCHAR(30)
    data_ultima_inspecao : DATE
}

entity LEITURA_TELEMETRIA {
    * id_leitura : INT <<PK>>
    --
    id_silo : INT <<FK>>
    temperatura_celsius : DECIMAL(5,2)
    umidade_relativa_pct : DECIMAL(5,2)
    co2_ppm : DECIMAL(7,2)
    nivel_preenchimento_pct : DECIMAL(5,2)
    data_hora_leitura : TIMESTAMP
}

entity ATUADOR {
    * id_atuador : INT <<PK>>
    --
    id_silo : INT <<FK>>
    tipo_atuador : VARCHAR(40)
    status_atual : VARCHAR(20)
    modo_operacao : VARCHAR(20)
    data_ultima_acao : TIMESTAMP
}

entity OCORRENCIA_ALERTA {
    * id_alerta : INT <<PK>>
    --
    id_silo : INT <<FK>>
    tipo_evento : VARCHAR(50)
    nivel_severidade : VARCHAR(20)
    mensagem_detalhe : TEXT
    data_hora_evento : TIMESTAMP
    reconhecido : BOOLEAN
}

UNIDADE_ARMAZENAMENTO ||--|{ SILO : "possui (1:N)"
SILO ||--|{ LEITURA_TELEMETRIA : "registra (1:N)"
SILO ||--|{ ATUADOR : "equipa (1:N)"
SILO ||--|{ OCORRENCIA_ALERTA : "dispara (1:N)"
@enduml
```
