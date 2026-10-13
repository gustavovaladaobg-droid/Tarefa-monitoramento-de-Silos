/**
 * AGRO-MONITORING PRO - Módulo de Comunicação SSE & REST HTTP
 * UniRV - Desenvolvimento de Software para Web (Me. Sergio Souza Novak)
 */

const API = {
  // URLs da API
  SSE_STREAM_URL: '/api/silos/stream',
  FALLBACK_EVENTS_URL: '/events',
  BASE_URL: '/api/silos',

  // Áudio de Alarme Industrial (Web Audio API nativa)
  audioCtx: null,
  isMuted: false,

  playAlarmBeep() {
    if (this.isMuted) return;
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      // Tom de alerta industrial alternando frequências (880Hz / 440Hz)
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime + 0.15);
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Alerta sonoro indisponível:', e);
    }
  },

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  },

  /**
   * Conecta ao canal SSE com tolerância a falhas e sincronização imediata
   * Atende ao RF-02 e RNF-02
   */
  connectSSE(callbacks = {}) {
    const { onSensorUpdate, onConsolidado, onStatusChange } = callbacks;
    let eventSource = null;
    let reconnectTimeout = null;

    function conectar() {
      if (onStatusChange) onStatusChange('reconnecting', 'Reconectando ao CLP...');

      try {
        eventSource = new EventSource(API.SSE_STREAM_URL);

        eventSource.onopen = () => {
          if (onStatusChange) onStatusChange('connected', 'EVENTSTREAM ATIVO');
          // RNF-02: Ao restabelecer conexão, solicita estado consolidado imediatamente
          API.buscarTodosSilos().then(res => {
            if (res && res.silos && onConsolidado) {
              onConsolidado(res.silos);
            }
          }).catch(err => console.error('Erro na sincronização pós-reconexão:', err));
        };

        // Escuta evento padronizado RF-02: event: sensor_update
        eventSource.addEventListener('sensor_update', (e) => {
          try {
            const data = JSON.parse(e.data);
            if (onSensorUpdate) onSensorUpdate(data);
          } catch (err) {
            console.error('Erro ao processar sensor_update:', err);
          }
        });

        // Escuta evento consolidado para atualização global do dashboard
        eventSource.addEventListener('telemetria_consolidada', (e) => {
          try {
            const data = JSON.parse(e.data);
            if (onConsolidado && data.silos) onConsolidado(data.silos);
          } catch (err) {
            console.error('Erro ao processar telemetria_consolidada:', err);
          }
        });

        eventSource.onerror = () => {
          if (onStatusChange) onStatusChange('disconnected', 'Falha de Conexão - Reconectando');
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Tenta reconectar periodicamente
          clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(conectar, 3000);
        };
      } catch (e) {
        console.error('Erro ao inicializar EventSource:', e);
        if (onStatusChange) onStatusChange('disconnected', 'Falha de Conexão');
        clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(conectar, 3000);
      }
    }

    conectar();

    return {
      close: () => {
        clearTimeout(reconnectTimeout);
        if (eventSource) eventSource.close();
      }
    };
  },

  // -------------------------------------------------------------------
  // REQUISIÇÕES HTTP REST (RF-06, RF-08, RNF-01, RNF-03)
  // -------------------------------------------------------------------

  async buscarTodosSilos() {
    const res = await fetch('/api/silos');
    return await res.json();
  },

  async buscarSilo(id) {
    const res = await fetch(`/api/silos/${id}`);
    return await res.json();
  },

  async buscarLogs() {
    const res = await fetch('/api/logs');
    return await res.json();
  },

  /**
   * Envia comando de atuador via HTTP REST POST (Listing 2 e Listing 3)
   */
  async comandarAtuadores(siloId, options = {}) {
    const {
      comportaComando = 'MANTER',
      exaustorComando = 'MANTER',
      exaustor1Comando,
      exaustor2Comando,
      modoOperacao,
      sensorChuva,
      sobrecargaMotor,
      operadorId = 'OP-882'
    } = options;

    const payload = {
      siloId: parseInt(siloId, 10),
      comportaComando,
      exaustorComando,
      operadorId
    };

    if (exaustor1Comando) payload.exaustor1Comando = exaustor1Comando;
    if (exaustor2Comando) payload.exaustor2Comando = exaustor2Comando;
    if (modoOperacao) payload.modoOperacao = modoOperacao;
    if (typeof sensorChuva === 'boolean') payload.sensorChuva = sensorChuva;
    if (typeof sobrecargaMotor === 'boolean') payload.sobrecargaMotor = sobrecargaMotor;

    const res = await fetch(`/api/silos/${siloId}/atuadores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.mensagem || 'Erro ao executar comando nos atuadores');
    }
    return data;
  },

  /**
   * Altera modo de operação (AUTOMATICO / MANUAL)
   */
  async alterarModo(siloId, modo, operadorId = 'OP-882') {
    const res = await fetch(`/api/silos/${siloId}/modo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modo, operadorId })
    });
    return await res.json();
  },

  /**
   * Injeta cenário de teste (útil para avaliação das regras automáticas)
   */
  async injetarCenario(dados) {
    const res = await fetch('/api/simulador/injecao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    return await res.json();
  }
};
