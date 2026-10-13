/**
 * Sistema Agroindustrial SSE2 - Servidor Node.js / Express
 * Atividade Prática — SSE2 (UML Completo)
 * Me. Sergio Souza Novak - UniRV
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// =====================================================================
// ESTADO EM MEMÓRIA DO SISTEMA AGROINDUSTRIAL
// =====================================================================

// Definição dos 6 silos industriais
const silos = [
  {
    siloId: 1,
    codigo: 'SILO-01',
    tipoGrao: 'MILHO',
    capacidadeTotalTon: 5000,
    nivelPreenchimento: 75.0, // %
    temperatura: 26.2,        // °C
    tempTopo: 26.2,
    tempMeio: 25.8,
    tempFundo: 24.5,
    co2: 620,                 // ppm
    umidade: 12.5,            // %
    comporta: 'FECHADA',      // 'ABERTA' | 'FECHADA'
    exaustor: 'DESLIGADO',    // 'LIGADO' | 'DESLIGADO'
    exaustor1: 'DESLIGADO',
    exaustor2: 'DESLIGADO',
    modoOperacao: 'AUTOMATICO', // 'AUTOMATICO' | 'MANUAL'
    alarme: 'NORMAL',         // 'NORMAL' | 'CO2_ELEVADO' | 'ALERTA_TEMPERATURA' | 'CRITICO'
    statusOperacional: 'NORMAL',
    sensorChuva: false,
    sobrecargaMotor: false,
    falhaComunicacao: false,
    dataUltimaInspecao: '2026-09-01'
  },
  {
    siloId: 2,
    codigo: 'SILO-02',
    tipoGrao: 'SOJA',
    capacidadeTotalTon: 5000,
    nivelPreenchimento: 82.0,
    temperatura: 31.7,
    tempTopo: 31.7,
    tempMeio: 28.4,
    tempFundo: 25.1,
    co2: 1450, // Conforme protótipo inicial (CO2 elevado)
    umidade: 14.2,
    comporta: 'ABERTA',
    exaustor: 'LIGADO',
    exaustor1: 'LIGADO',
    exaustor2: 'LIGADO',
    modoOperacao: 'AUTOMATICO',
    alarme: 'CO2_ELEVADO',
    statusOperacional: 'ALERTA_CO2',
    sensorChuva: false,
    sobrecargaMotor: false,
    falhaComunicacao: false,
    dataUltimaInspecao: '2026-09-05'
  },
  {
    siloId: 3,
    codigo: 'SILO-03',
    tipoGrao: 'TRIGO',
    capacidadeTotalTon: 5000,
    nivelPreenchimento: 60.0,
    temperatura: 25.4,
    tempTopo: 25.4,
    tempMeio: 24.9,
    tempFundo: 24.0,
    co2: 580,
    umidade: 11.8,
    comporta: 'FECHADA',
    exaustor: 'DESLIGADO',
    exaustor1: 'DESLIGADO',
    exaustor2: 'DESLIGADO',
    modoOperacao: 'AUTOMATICO',
    alarme: 'NORMAL',
    statusOperacional: 'NORMAL',
    sensorChuva: false,
    sobrecargaMotor: false,
    falhaComunicacao: false,
    dataUltimaInspecao: '2026-09-08'
  },
  {
    siloId: 4,
    codigo: 'SILO-04',
    tipoGrao: 'SORGO',
    capacidadeTotalTon: 5000,
    nivelPreenchimento: 24.0,
    temperatura: 24.1,
    tempTopo: 24.1,
    tempMeio: 23.8,
    tempFundo: 23.0,
    co2: 510,
    umidade: 13.1,
    comporta: 'FECHADA',
    exaustor: 'LIGADO',
    exaustor1: 'LIGADO',
    exaustor2: 'DESLIGADO',
    modoOperacao: 'AUTOMATICO',
    alarme: 'NORMAL',
    statusOperacional: 'NORMAL',
    sensorChuva: false,
    sobrecargaMotor: false,
    falhaComunicacao: false,
    dataUltimaInspecao: '2026-09-10'
  },
  {
    siloId: 5,
    codigo: 'SILO-05',
    tipoGrao: 'ARROZ',
    capacidadeTotalTon: 5000,
    nivelPreenchimento: 97.5,
    temperatura: 27.8,
    tempTopo: 27.8,
    tempMeio: 27.0,
    tempFundo: 26.2,
    co2: 780,
    umidade: 13.8,
    comporta: 'FECHADA',
    exaustor: 'DESLIGADO',
    exaustor1: 'DESLIGADO',
    exaustor2: 'DESLIGADO',
    modoOperacao: 'AUTOMATICO',
    alarme: 'NORMAL',
    statusOperacional: 'NORMAL',
    sensorChuva: false,
    sobrecargaMotor: false,
    falhaComunicacao: false,
    dataUltimaInspecao: '2026-09-11'
  },
  {
    siloId: 6,
    codigo: 'SILO-06',
    tipoGrao: 'CEVADA',
    capacidadeTotalTon: 5000,
    nivelPreenchimento: 45.0,
    temperatura: 25.0,
    tempTopo: 25.0,
    tempMeio: 24.6,
    tempFundo: 23.9,
    co2: 600,
    umidade: 12.0,
    comporta: 'FECHADA',
    exaustor: 'DESLIGADO',
    exaustor1: 'DESLIGADO',
    exaustor2: 'DESLIGADO',
    modoOperacao: 'AUTOMATICO',
    alarme: 'NORMAL',
    statusOperacional: 'NORMAL',
    sensorChuva: false,
    sobrecargaMotor: false,
    falhaComunicacao: false,
    dataUltimaInspecao: '2026-09-12'
  }
];

// Histórico de logs de auditoria em memória (RF-08: Mantém últimas 20 ocorrências)
const MAX_LOGS = 20;
let auditoriaLogs = [];

function registrarLog(tipo, mensagem, siloId = null, operador = 'SISTEMA') {
  const agora = new Date();
  const horaFormatada = agora.toTimeString().split(' ')[0];
  const registro = {
    id: Date.now() + Math.random().toString(36).substring(2, 5),
    timestamp: agora.toISOString(),
    horaFormatada,
    tipo,       // 'ATUADOR', 'ALARME', 'SEGURANCA', 'SISTEMA'
    siloId,
    operador,
    mensagem: `[${horaFormatada}] ${mensagem}`
  };

  auditoriaLogs.unshift(registro);
  if (auditoriaLogs.length > MAX_LOGS) {
    auditoriaLogs = auditoriaLogs.slice(0, MAX_LOGS);
  }
  return registro;
}

// Inicializa alguns logs para demonstração inicial
registrarLog('SISTEMA', 'Sistema Agroindustrial UniRV inicializado com sucesso.');
registrarLog('ATUADOR', 'Exaustor 01 LIGADO por Operador OP-882', 2, 'OP-882');
registrarLog('ALARME', 'CO2_ELEVADO detectado no Silo 02 (1450 PPM)', 2, 'SISTEMA');

// =====================================================================
// GERENCIADOR DE CLIENTES SSE (Server-Sent Events)
// =====================================================================
const sseClients = new Set();

function enviarSSEParaTodos(evento, dados) {
  const payload = `event: ${evento}\ndata: ${JSON.stringify(dados)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

// =====================================================================
// MOTOR DE SIMULAÇÃO DE TELEMETRIA EM SEGUNDO PLANO (RF-01, RF-03, RF-04, RF-05)
// =====================================================================

function executarCicloSimulacao() {
  const agoraISO = new Date().toISOString();

  silos.forEach(silo => {
    // Se estiver com falha de comunicação forçada, não atualiza
    if (silo.falhaComunicacao) return;

    // 1. Dinâmica de ventilação / resfriamento / acúmulo de gases
    const aereando = silo.exaustor === 'LIGADO' || silo.exaustor1 === 'LIGADO' || silo.exaustor2 === 'LIGADO';
    const ventilando = silo.comporta === 'ABERTA';

    // Variação de temperatura
    if (aereando) {
      // Exaustores diminuem temperatura gradualmente
      if (silo.temperatura > 22.0) {
        silo.temperatura = +(silo.temperatura - (0.05 + Math.random() * 0.1)).toFixed(1);
      }
    } else {
      // Sem exaustão, tendência orgânica de leve oscilação ou subida por respiração
      const delta = (Math.random() * 0.15 - 0.05);
      silo.temperatura = +(Math.max(20.0, silo.temperatura + delta)).toFixed(1);
    }

    // Termopares estratificados (Topo mais quente, Fundo mais ameno)
    silo.tempTopo = +(silo.temperatura).toFixed(1);
    silo.tempMeio = +(silo.temperatura - 1.8 + (Math.random() * 0.3)).toFixed(1);
    silo.tempFundo = +(silo.temperatura - 3.5 + (Math.random() * 0.3)).toFixed(1);

    // Variação de CO2
    if (ventilando || aereando) {
      // Comporta e exaustor dispersam CO2
      if (silo.co2 > 450) {
        silo.co2 = Math.max(450, Math.round(silo.co2 - (15 + Math.random() * 20)));
      }
    } else {
      // Sem ventilação, CO2 oscila ou sobe levemente
      const deltaCO2 = Math.round(Math.random() * 12 - 4);
      silo.co2 = Math.max(400, silo.co2 + deltaCO2);
    }

    // Umidade oscila levemente
    const deltaUmid = (Math.random() * 0.08 - 0.04);
    silo.umidade = +(Math.min(18.0, Math.max(9.0, silo.umidade + deltaUmid))).toFixed(1);

    // =================================================================
    // REGRAS AUTOMÁTICAS (RF-03, RF-04, RF-05)
    // =================================================================

    // [RF-05] Trava de Segurança por Capacidade Máxima de Carga (>= 98%)
    if (silo.nivelPreenchimento >= 98.0) {
      if (!silo.bloqueadoCarga) {
        silo.bloqueadoCarga = true;
        silo.statusOperacional = 'BLOQUEADO_CARGA';
        registrarLog('SEGURANCA', `Silo ${silo.codigo} atingiu ${silo.nivelPreenchimento}%. Trava de derramamento ativada: Bloqueado para Carga!`, silo.siloId);
      }
    } else {
      silo.bloqueadoCarga = false;
    }

    // [RF-03] Automação e Alertas por Nível de CO2
    // CO2 >= 1500 ppm: aciona comporta automaticamente (se automático)
    if (silo.co2 >= 1500) {
      silo.alarme = 'CO2_ELEVADO';
      if (silo.statusOperacional !== 'SUPERAQUECIDO') {
        silo.statusOperacional = 'ALERTA_CO2';
      }

      if (silo.modoOperacao === 'AUTOMATICO' && silo.comporta !== 'ABERTA') {
        silo.comporta = 'ABERTA';
        registrarLog('ATUADOR', `Automação CO2 (>=1500 ppm): Comporta de ventilação do ${silo.codigo} aberta automaticamente.`, silo.siloId);
      }
    } else if (silo.co2 >= 1000) {
      silo.alarme = 'CO2_ELEVADO';
      if (silo.statusOperacional !== 'SUPERAQUECIDO') {
        silo.statusOperacional = 'ALERTA_CO2';
      }
    } else {
      if (silo.alarme === 'CO2_ELEVADO') {
        silo.alarme = 'NORMAL';
        if (silo.statusOperacional === 'ALERTA_CO2') {
          silo.statusOperacional = 'NORMAL';
        }
      }
    }

    // [RF-04] Automação por Regras de Temperatura e Superaquecimento
    // Temp >= 30.0°C: aciona exaustores automaticamente
    if (silo.temperatura >= 35.0) {
      silo.alarme = 'CRITICO';
      silo.statusOperacional = 'SUPERAQUECIDO';
      // Se ainda não ligado, liga exaustores
      if (silo.modoOperacao === 'AUTOMATICO') {
        silo.exaustor = 'LIGADO';
        silo.exaustor1 = 'LIGADO';
        silo.exaustor2 = 'LIGADO';
      }
    } else if (silo.temperatura >= 30.0) {
      if (silo.alarme !== 'CO2_ELEVADO') {
        silo.alarme = 'ALERTA_TEMPERATURA';
      }
      if (silo.modoOperacao === 'AUTOMATICO' && silo.exaustor !== 'LIGADO') {
        silo.exaustor = 'LIGADO';
        silo.exaustor1 = 'LIGADO';
        silo.exaustor2 = 'LIGADO';
        registrarLog('ATUADOR', `Automação Térmica (>=30°C): Exaustores do ${silo.codigo} ligados automaticamente.`, silo.siloId);
      }
    } else {
      if (silo.alarme === 'ALERTA_TEMPERATURA' || (silo.alarme === 'CRITICO' && silo.temperatura < 35.0)) {
        silo.alarme = (silo.co2 >= 1000) ? 'CO2_ELEVADO' : 'NORMAL';
        if (silo.statusOperacional === 'SUPERAQUECIDO') {
          silo.statusOperacional = (silo.co2 >= 1000) ? 'ALERTA_CO2' : 'NORMAL';
        }
      }
    }

    // =================================================================
    // [RF-02] EMISSÃO SSE DOS EVENTOS FORMATADOS
    // =================================================================
    // Formato exato do Listing 1 do PDF UniRV
    const payloadSilo = {
      siloId: silo.siloId,
      temperatura: silo.temperatura,
      co2: silo.co2,
      umidade: silo.umidade,
      comporta: silo.comporta,
      exaustor: silo.exaustor,
      alarme: silo.alarme,
      timestamp: agoraISO,
      // Metadados adicionais para exibição rica nos cards e SVG
      codigo: silo.codigo,
      tipoGrao: silo.tipoGrao,
      nivelPreenchimento: silo.nivelPreenchimento,
      tempTopo: silo.tempTopo,
      tempMeio: silo.tempMeio,
      tempFundo: silo.tempFundo,
      exaustor1: silo.exaustor1,
      exaustor2: silo.exaustor2,
      modoOperacao: silo.modoOperacao,
      statusOperacional: silo.statusOperacional,
      bloqueadoCarga: silo.bloqueadoCarga,
      sensorChuva: silo.sensorChuva,
      sobrecargaMotor: silo.sobrecargaMotor,
      capacidadeTotalTon: silo.capacidadeTotalTon
    };

    enviarSSEParaTodos('sensor_update', payloadSilo);
  });

  // Evento consolidado com todos os silos para atualização global do dashboard
  enviarSSEParaTodos('telemetria_consolidada', {
    timestamp: agoraISO,
    silos: silos.map(s => ({ ...s, timestamp: agoraISO }))
  });
}

// Inicia simulação em segundo plano a cada 1.5 segundos (RF-01)
const SIMULATION_INTERVAL_MS = 1500;
setInterval(executarCicloSimulacao, SIMULATION_INTERVAL_MS);

// =====================================================================
// ROTAS SSE (Server-Sent Events - RF-02 e RNF-01)
// =====================================================================

function handleSSEConnection(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no'
  });

  // Envia comentário de handshake inicial
  res.write(': handshake SSE Agroindustrial UniRV conectado\n\n');

  // Envia estado inicial imediato de todos os silos
  silos.forEach(silo => {
    res.write(`event: sensor_update\ndata: ${JSON.stringify({
      siloId: silo.siloId,
      temperatura: silo.temperatura,
      co2: silo.co2,
      umidade: silo.umidade,
      comporta: silo.comporta,
      exaustor: silo.exaustor,
      alarme: silo.alarme,
      timestamp: new Date().toISOString(),
      codigo: silo.codigo,
      tipoGrao: silo.tipoGrao,
      nivelPreenchimento: silo.nivelPreenchimento,
      tempTopo: silo.tempTopo,
      tempMeio: silo.tempMeio,
      tempFundo: silo.tempFundo,
      exaustor1: silo.exaustor1,
      exaustor2: silo.exaustor2,
      modoOperacao: silo.modoOperacao,
      statusOperacional: silo.statusOperacional,
      bloqueadoCarga: silo.bloqueadoCarga
    })}\n\n`);
  });

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
}

// Endpoint primário (RF-02 especificado na seção 2.1)
app.get('/events', handleSSEConnection);

// Endpoint alternativo (especificado na seção 6.1.2 e 7.1)
app.get('/api/silos/stream', handleSSEConnection);

// =====================================================================
// ROTAS REST HTTP (RF-06, RF-08, RNF-02, RNF-03)
// =====================================================================

// [RNF-02] Busca estado consolidado de todos os silos
app.get('/api/silos', (req, res) => {
  res.json({
    sucesso: true,
    quantidade: silos.length,
    silos: silos
  });
});

// Busca dados de um silo específico
app.get('/api/silos/:id', (req, res) => {
  const siloId = parseInt(req.params.id, 10);
  const silo = silos.find(s => s.siloId === siloId);
  if (!silo) {
    return res.status(404).json({ sucesso: false, mensagem: `Silo ${siloId} não encontrado.` });
  }
  res.json({ sucesso: true, silo });
});

// [RF-08] Consulta dos últimos 20 registros do log de auditoria industrial
app.get('/api/logs', (req, res) => {
  res.json({
    sucesso: true,
    total: auditoriaLogs.length,
    logs: auditoriaLogs
  });
});

// [RF-06] Endpoint de Acionamento Manual de Atuadores (Listing 2 e Listing 3)
// POST /api/silos/:id/atuadores
app.post('/api/silos/:id/atuadores', (req, res) => {
  const idParam = parseInt(req.params.id, 10);
  const {
    siloId,
    comportaComando,
    exaustorComando,
    exaustor1Comando,
    exaustor2Comando,
    modoOperacao,
    sensorChuva,
    sobrecargaMotor,
    operadorId = 'OP-882'
  } = req.body;

  const targetId = siloId ? parseInt(siloId, 10) : idParam;
  const silo = silos.find(s => s.siloId === targetId);

  if (!silo) {
    return res.status(404).json({
      sucesso: false,
      mensagem: `Silo ${targetId} não encontrado no complexo.`
    });
  }

  // Atualização de modo de operação se fornecido
  if (modoOperacao && (modoOperacao === 'AUTOMATICO' || modoOperacao === 'MANUAL')) {
    silo.modoOperacao = modoOperacao;
    registrarLog('ATUADOR', `Modo de operação do ${silo.codigo} alterado para ${modoOperacao} por Operador ${operadorId}.`, silo.siloId, operadorId);
  }

  // Simulação de Sensores Externos (Chuva e Sobrecarga)
  if (typeof sensorChuva === 'boolean') {
    silo.sensorChuva = sensorChuva;
  }
  if (typeof sobrecargaMotor === 'boolean') {
    silo.sobrecargaMotor = sobrecargaMotor;
  }

  // Fluxo Alternativo 6.3.4: Bloqueio Automático por Chuva
  if (comportaComando === 'ABRIR' && silo.sensorChuva) {
    return res.status(400).json({
      sucesso: false,
      siloId: silo.siloId,
      mensagem: `[Ação Bloqueada: Sensor de Chuva Ativo] A comporta superior do ${silo.codigo} não pode ser aberta com chuva.`
    });
  }

  // Fluxo de Exceção 6.3.4: Sobrecarga no Motor do Exaustor
  if ((exaustorComando === 'LIGAR' || exaustor1Comando === 'LIGAR' || exaustor2Comando === 'LIGAR') && silo.sobrecargaMotor) {
    return res.status(400).json({
      sucesso: false,
      siloId: silo.siloId,
      mensagem: `[Falha: Sobrecarga no Motor do Exaustor] Relé térmico disparado no ${silo.codigo}. Exige reset presencial no painel elétrico.`
    });
  }

  // Executa comandos na comporta
  if (comportaComando === 'ABRIR') {
    silo.comporta = 'ABERTA';
    registrarLog('ATUADOR', `Comporta do ${silo.codigo} ABERTA por Operador ${operadorId}`, silo.siloId, operadorId);
  } else if (comportaComando === 'FECHAR') {
    silo.comporta = 'FECHADA';
    registrarLog('ATUADOR', `Comporta do ${silo.codigo} FECHADA por Operador ${operadorId}`, silo.siloId, operadorId);
  }

  // Executa comandos no exaustor geral e individuais
  if (exaustorComando === 'LIGAR') {
    silo.exaustor = 'LIGADO';
    silo.exaustor1 = 'LIGADO';
    silo.exaustor2 = 'LIGADO';
    registrarLog('ATUADOR', `Exaustores do ${silo.codigo} LIGADOS por Operador ${operadorId}`, silo.siloId, operadorId);
  } else if (exaustorComando === 'DESLIGAR') {
    silo.exaustor = 'DESLIGADO';
    silo.exaustor1 = 'DESLIGADO';
    silo.exaustor2 = 'DESLIGADO';
    registrarLog('ATUADOR', `Exaustores do ${silo.codigo} DESLIGADOS por Operador ${operadorId}`, silo.siloId, operadorId);
  }

  if (exaustor1Comando === 'LIGAR') {
    silo.exaustor1 = 'LIGADO';
    silo.exaustor = 'LIGADO';
    registrarLog('ATUADOR', `Exaustor 01 do ${silo.codigo} LIGADO por Operador ${operadorId}`, silo.siloId, operadorId);
  } else if (exaustor1Comando === 'DESLIGAR') {
    silo.exaustor1 = 'DESLIGADO';
    if (silo.exaustor2 === 'DESLIGADO') silo.exaustor = 'DESLIGADO';
    registrarLog('ATUADOR', `Exaustor 01 do ${silo.codigo} DESLIGADO por Operador ${operadorId}`, silo.siloId, operadorId);
  }

  if (exaustor2Comando === 'LIGAR') {
    silo.exaustor2 = 'LIGADO';
    silo.exaustor = 'LIGADO';
    registrarLog('ATUADOR', `Exaustor 02 do ${silo.codigo} LIGADO por Operador ${operadorId}`, silo.siloId, operadorId);
  } else if (exaustor2Comando === 'DESLIGAR') {
    silo.exaustor2 = 'DESLIGADO';
    if (silo.exaustor1 === 'DESLIGADO') silo.exaustor = 'DESLIGADO';
    registrarLog('ATUADOR', `Exaustor 02 do ${silo.codigo} DESLIGADO por Operador ${operadorId}`, silo.siloId, operadorId);
  }

  // Notifica imediatamente via SSE a mudança de estado dos atuadores
  enviarSSEParaTodos('sensor_update', {
    siloId: silo.siloId,
    temperatura: silo.temperatura,
    co2: silo.co2,
    umidade: silo.umidade,
    comporta: silo.comporta,
    exaustor: silo.exaustor,
    alarme: silo.alarme,
    timestamp: new Date().toISOString(),
    codigo: silo.codigo,
    tipoGrao: silo.tipoGrao,
    nivelPreenchimento: silo.nivelPreenchimento,
    tempTopo: silo.tempTopo,
    tempMeio: silo.tempMeio,
    tempFundo: silo.tempFundo,
    exaustor1: silo.exaustor1,
    exaustor2: silo.exaustor2,
    modoOperacao: silo.modoOperacao,
    statusOperacional: silo.statusOperacional,
    bloqueadoCarga: silo.bloqueadoCarga,
    sensorChuva: silo.sensorChuva,
    sobrecargaMotor: silo.sobrecargaMotor
  });

  // Retorno estrito conforme Listing 3 do PDF
  return res.json({
    sucesso: true,
    siloId: silo.siloId,
    novoEstado: {
      comporta: silo.comporta,
      exaustor: silo.exaustor
    },
    mensagem: `Comando executado com sucesso nos atuadores do ${silo.codigo}.`
  });
});

// Rotas REST simplificadas pontuais descritas no RF-06
app.post('/api/silos/:id/comporta/:acao', (req, res) => {
  const siloId = parseInt(req.params.id, 10);
  const acao = req.params.acao.toLowerCase();
  const comportaComando = acao === 'abrir' ? 'ABRIR' : 'FECHAR';
  req.body = { siloId, comportaComando, exaustorComando: 'MANTER', operadorId: req.body.operadorId || 'OP-882' };
  return app._router.handle(req, res);
});

app.post('/api/silos/:id/exaustor/:acao', (req, res) => {
  const siloId = parseInt(req.params.id, 10);
  const acao = req.params.acao.toLowerCase();
  const exaustorComando = acao === 'ligar' ? 'LIGAR' : 'DESLIGAR';
  req.body = { siloId, comportaComando: 'MANTER', exaustorComando, operadorId: req.body.operadorId || 'OP-882' };
  return app._router.handle(req, res);
});

// Rota para alternar modo operacional (AUTOMATICO / MANUAL)
app.post('/api/silos/:id/modo', (req, res) => {
  const siloId = parseInt(req.params.id, 10);
  const { modo, operadorId = 'OP-882' } = req.body;
  const silo = silos.find(s => s.siloId === siloId);
  if (!silo) return res.status(404).json({ sucesso: false, mensagem: 'Silo não encontrado' });

  silo.modoOperacao = modo.toUpperCase() === 'MANUAL' ? 'MANUAL' : 'AUTOMATICO';
  registrarLog('ATUADOR', `Modo do ${silo.codigo} alterado para ${silo.modoOperacao} por Operador ${operadorId}`, silo.siloId, operadorId);
  
  res.json({ sucesso: true, siloId, modoOperacao: silo.modoOperacao });
});

// Endpoint facilitador para injeção de cenários de teste (avaliador/professor testar alertas e regras)
app.post('/api/simulador/injecao', (req, res) => {
  const { siloId, temperatura, co2, nivelPreenchimento, sensorChuva, sobrecargaMotor, falhaComunicacao } = req.body;
  const silo = silos.find(s => s.siloId === parseInt(siloId, 10));
  if (!silo) return res.status(404).json({ sucesso: false, mensagem: 'Silo não encontrado' });

  if (temperatura !== undefined) silo.temperatura = parseFloat(temperatura);
  if (co2 !== undefined) silo.co2 = parseInt(co2, 10);
  if (nivelPreenchimento !== undefined) silo.nivelPreenchimento = parseFloat(nivelPreenchimento);
  if (sensorChuva !== undefined) silo.sensorChuva = Boolean(sensorChuva);
  if (sobrecargaMotor !== undefined) silo.sobrecargaMotor = Boolean(sobrecargaMotor);
  if (falhaComunicacao !== undefined) silo.falhaComunicacao = Boolean(falhaComunicacao);

  registrarLog('SISTEMA', `Injeção de parâmetros de teste aplicada no ${silo.codigo}`, silo.siloId);
  res.json({ sucesso: true, silo });
});

// Rota raiz redireciona para tela1-dashboard.html
app.get('/', (req, res) => {
  res.redirect('/tela1-dashboard.html');
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(` AGRO-MONITORING PRO - UniRV (Me. Sergio Souza Novak)`);
  console.log(` Servidor rodando em: http://localhost:${PORT}`);
  console.log(` SSE Stream: http://localhost:${PORT}/api/silos/stream`);
  console.log(` Dashboard: http://localhost:${PORT}/tela1-dashboard.html`);
  console.log(`================================================================`);
});
