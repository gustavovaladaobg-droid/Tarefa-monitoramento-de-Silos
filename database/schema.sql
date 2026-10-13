-- =====================================================================
-- Sistema Agroindustrial SSE2 - UniRV
-- Desenvolvimento de Software para Web - Me. Sergio Souza Novak
-- Esquema de Banco de Dados Relacional (PlantUML ERD - Seção 5)
-- =====================================================================

CREATE TABLE IF NOT EXISTS UNIDADE_ARMAZENAMENTO (
    id_unidade INT PRIMARY KEY,
    nome_fazenda VARCHAR(100) NOT NULL,
    localizacao_geografica VARCHAR(100) NOT NULL,
    capacidade_total_toneladas DECIMAL(10,2) NOT NULL,
    responsavel_tecnico VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS SILO (
    id_silo INT PRIMARY KEY,
    id_unidade INT NOT NULL,
    codigo_silo VARCHAR(20) NOT NULL,
    capacidade_maxima_m3 DECIMAL(10,2) NOT NULL,
    tipo_grao_armazenado VARCHAR(50) NOT NULL,
    status_operacional VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    data_ultima_inspecao DATE NOT NULL,
    FOREIGN KEY (id_unidade) REFERENCES UNIDADE_ARMAZENAMENTO(id_unidade) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS LEITURA_TELEMETRIA (
    id_leitura INT PRIMARY KEY,
    id_silo INT NOT NULL,
    temperatura_celsius DECIMAL(5,2) NOT NULL,
    umidade_relativa_pct DECIMAL(5,2) NOT NULL,
    co2_ppm DECIMAL(7,2) NOT NULL,
    nivel_preenchimento_pct DECIMAL(5,2) NOT NULL,
    data_hora_leitura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_silo) REFERENCES SILO(id_silo) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ATUADOR (
    id_atuador INT PRIMARY KEY,
    id_silo INT NOT NULL,
    tipo_atuador VARCHAR(40) NOT NULL, -- 'COMPORTA_EXAUSTAO', 'EXAUSTOR_TETO'
    status_atual VARCHAR(20) NOT NULL DEFAULT 'FECHADO', -- 'ABERTO', 'FECHADO', 'LIGADO', 'DESLIGADO'
    modo_operacao VARCHAR(20) NOT NULL DEFAULT 'AUTOMATICO', -- 'AUTOMATICO', 'MANUAL'
    data_ultima_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_silo) REFERENCES SILO(id_silo) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS OCORRENCIA_ALERTA (
    id_alerta INT PRIMARY KEY,
    id_silo INT NOT NULL,
    tipo_evento VARCHAR(50) NOT NULL, -- 'SUPERAQUECIMENTO', 'CO2_CRITICO', 'SOBRECARGA', 'BLOQUEIO_CARGA'
    nivel_severidade VARCHAR(20) NOT NULL, -- 'ATENCAO', 'ALERTA', 'CRITICO'
    mensagem_detalhe TEXT NOT NULL,
    data_hora_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reconhecido BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_silo) REFERENCES SILO(id_silo) ON DELETE CASCADE
);

-- =====================================================================
-- Dados Iniciais (Seeds)
-- =====================================================================

INSERT INTO UNIDADE_ARMAZENAMENTO (id_unidade, nome_fazenda, localizacao_geografica, capacidade_total_toneladas, responsavel_tecnico)
VALUES (1, 'Complexo Agroindustrial UniRV Central', 'Rio Verde - GO', 30000.00, 'Dr. Roberto Magalhães (CREA-GO 44821)')
ON CONFLICT (id_unidade) DO NOTHING;

INSERT INTO SILO (id_silo, id_unidade, codigo_silo, capacidade_maxima_m3, tipo_grao_armazenado, status_operacional, data_ultima_inspecao)
VALUES 
    (1, 1, 'SILO-01', 5000.00, 'MILHO', 'NORMAL', '2026-09-01'),
    (2, 1, 'SILO-02', 5000.00, 'SOJA', 'NORMAL', '2026-09-05'),
    (3, 1, 'SILO-03', 5000.00, 'TRIGO', 'NORMAL', '2026-09-08'),
    (4, 1, 'SILO-04', 5000.00, 'SORGO', 'NORMAL', '2026-09-10'),
    (5, 1, 'SILO-05', 5000.00, 'ARROZ', 'NORMAL', '2026-09-11'),
    (6, 1, 'SILO-06', 5000.00, 'CEVADA', 'NORMAL', '2026-09-12')
ON CONFLICT (id_silo) DO NOTHING;

INSERT INTO ATUADOR (id_atuador, id_silo, tipo_atuador, status_atual, modo_operacao, data_ultima_acao)
VALUES
    (1, 1, 'COMPORTA_EXAUSTAO', 'FECHADO', 'AUTOMATICO', CURRENT_TIMESTAMP),
    (2, 1, 'EXAUSTOR_TETO', 'DESLIGADO', 'AUTOMATICO', CURRENT_TIMESTAMP),
    (3, 2, 'COMPORTA_EXAUSTAO', 'FECHADO', 'AUTOMATICO', CURRENT_TIMESTAMP),
    (4, 2, 'EXAUSTOR_TETO', 'DESLIGADO', 'AUTOMATICO', CURRENT_TIMESTAMP),
    (5, 3, 'COMPORTA_EXAUSTAO', 'FECHADO', 'AUTOMATICO', CURRENT_TIMESTAMP),
    (6, 3, 'EXAUSTOR_TETO', 'DESLIGADO', 'AUTOMATICO', CURRENT_TIMESTAMP)
ON CONFLICT (id_atuador) DO NOTHING;
