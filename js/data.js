/* =====================================================================
   ORBITA — Sistema de Alerta Climático por Satélite
   data.js — Base de dados simulada (apenas para fins acadêmicos)
   ---------------------------------------------------------------------
   Todos os dados são FICTÍCIOS e gerados estaticamente para demonstrar a
   plataforma. Nada vem de satélite real, backend ou banco de dados.

   Mapa de pesos de risco usado em cálculos do dashboard:
     Baixo = 25 · Médio = 50 · Alto = 75 · Crítico = 100
   ===================================================================== */

/* Pesos numéricos de cada nível de risco (escala 0–100) */
const PESO_RISCO = { Baixo: 25, "Médio": 50, Alto: 75, "Crítico": 100 };

/* ---------------------------------------------------------------------
   CONSTELAÇÃO DE SATÉLITES SIMULADOS
   cobertura  -> % do território brasileiro coberto na órbita atual
   sinal      -> qualidade do enlace de telemetria (%)
   passagem   -> próxima janela de captura sobre o Brasil
   --------------------------------------------------------------------- */
const SATELITES = [
  { id: "ORB-1", nome: "Orbita-Alfa",    tipo: "Óptico / Infravermelho", orbita: "LEO · 540 km",  status: "Operacional", cobertura: 92, sinal: 98, passagem: "00:07 min" },
  { id: "ORB-2", nome: "Orbita-Beta",    tipo: "Radar SAR",              orbita: "LEO · 510 km",  status: "Operacional", cobertura: 88, sinal: 95, passagem: "00:21 min" },
  { id: "ORB-3", nome: "Orbita-Gama",    tipo: "Multiespectral",         orbita: "Heliossíncrona",status: "Operacional", cobertura: 96, sinal: 91, passagem: "00:03 min" },
  { id: "ORB-4", nome: "Orbita-Delta",   tipo: "Sensor Térmico",         orbita: "LEO · 560 km",  status: "Manutenção",  cobertura: 40, sinal: 62, passagem: "Indisponível" },
  { id: "ORB-5", nome: "Orbita-Épsilon", tipo: "Hiperespectral",         orbita: "MEO · 8 200 km",status: "Operacional", cobertura: 99, sinal: 89, passagem: "00:48 min" }
];

/* ---------------------------------------------------------------------
   REGIÕES MONITORADAS
   coordX / coordY -> posição percentual (0–100) sobre o mapa estilizado
   tendencia       -> evolução do risco: "subindo" | "estavel" | "caindo"
   --------------------------------------------------------------------- */
const REGIOES = [
  { id: 1, nome: "Vale do Itajaí",       estado: "SC", area: "Urbana",    temperatura: 24, umidade: 88, chuva: 156, vegetacao: 0.62, risco: "Crítico", tipoRisco: "Enchente",     tendencia: "subindo", coordX: 60, coordY: 83, atualizado: "há 2 min" },
  { id: 2, nome: "Petrópolis",           estado: "RJ", area: "Urbana",    temperatura: 21, umidade: 91, chuva: 134, vegetacao: 0.71, risco: "Alto",    tipoRisco: "Deslizamento", tendencia: "subindo", coordX: 71, coordY: 71, atualizado: "há 4 min" },
  { id: 3, nome: "Pantanal Norte",       estado: "MT", area: "Florestal", temperatura: 38, umidade: 22, chuva: 4,   vegetacao: 0.41, risco: "Crítico", tipoRisco: "Queimada",     tendencia: "subindo", coordX: 45, coordY: 55, atualizado: "há 1 min" },
  { id: 4, nome: "Sertão Central",       estado: "CE", area: "Rural",     temperatura: 36, umidade: 18, chuva: 0,   vegetacao: 0.19, risco: "Alto",    tipoRisco: "Seca",         tendencia: "estavel", coordX: 80, coordY: 26, atualizado: "há 6 min" },
  { id: 5, nome: "Litoral Sul",          estado: "BA", area: "Costeira",  temperatura: 29, umidade: 79, chuva: 62,  vegetacao: 0.58, risco: "Médio",   tipoRisco: "Enchente",     tendencia: "estavel", coordX: 80, coordY: 52, atualizado: "há 9 min" },
  { id: 6, nome: "Floresta de Carajás",  estado: "PA", area: "Florestal", temperatura: 34, umidade: 48, chuva: 11,  vegetacao: 0.83, risco: "Médio",   tipoRisco: "Queimada",     tendencia: "subindo", coordX: 58, coordY: 29, atualizado: "há 7 min" },
  { id: 7, nome: "Grande São Paulo",     estado: "SP", area: "Urbana",    temperatura: 26, umidade: 74, chuva: 48,  vegetacao: 0.35, risco: "Baixo",   tipoRisco: "Enchente",     tendencia: "caindo",  coordX: 65, coordY: 74, atualizado: "há 3 min" },
  { id: 8, nome: "Cerrado Goiano",       estado: "GO", area: "Rural",     temperatura: 33, umidade: 27, chuva: 6,   vegetacao: 0.44, risco: "Alto",    tipoRisco: "Seca",         tendencia: "subindo", coordX: 60, coordY: 56, atualizado: "há 5 min" }
];

/* ---------------------------------------------------------------------
   LEITURAS SATELITAIS RECENTES
   Fluxo simulado de telemetria captada pela constelação.
   --------------------------------------------------------------------- */
const LEITURAS = [
  { hora: "14:38", satelite: "Orbita-Beta",    regiao: "Vale do Itajaí",       dado: "Nível dos rios +2,4 m",  risco: "Crítico" },
  { hora: "14:31", satelite: "Orbita-Gama",    regiao: "Pantanal Norte",       dado: "47 focos de calor ativos",risco: "Crítico" },
  { hora: "14:22", satelite: "Orbita-Alfa",    regiao: "Petrópolis",           dado: "Solo saturado a 94%",     risco: "Alto" },
  { hora: "14:10", satelite: "Orbita-Épsilon", regiao: "Sertão Central",       dado: "Umidade do solo a 11%",   risco: "Alto" },
  { hora: "13:58", satelite: "Orbita-Gama",    regiao: "Cerrado Goiano",       dado: "Índice de vegetação ↓ 0,06",risco: "Alto" },
  { hora: "13:44", satelite: "Orbita-Beta",    regiao: "Litoral Sul",          dado: "Chuva acumulada 62 mm",   risco: "Médio" },
  { hora: "13:30", satelite: "Orbita-Alfa",    regiao: "Floresta de Carajás",  dado: "Pluma de fumaça detectada",risco: "Médio" },
  { hora: "13:12", satelite: "Orbita-Gama",    regiao: "Grande São Paulo",     dado: "Reflectância estável",    risco: "Baixo" }
];

/* ---------------------------------------------------------------------
   ALERTAS SIMULADOS
   Eventos gerados pelo cruzamento automático das leituras satelitais.
   --------------------------------------------------------------------- */
const ALERTAS = [
  { id: 101, tipo: "Enchente",     regiao: "Vale do Itajaí",      estado: "SC", nivel: "Crítico", data: "07/06/2026 14:38", status: "Ativo",      mensagem: "Elevação acelerada do nível dos rios detectada por radar SAR. Risco iminente de transbordamento em áreas urbanas. Evacuação preventiva recomendada à Defesa Civil." },
  { id: 102, tipo: "Queimada",     regiao: "Pantanal Norte",      estado: "MT", nivel: "Crítico", data: "07/06/2026 14:31", status: "Ativo",      mensagem: "47 focos de calor confirmados por sensor térmico orbital. Propagação rápida favorecida por baixa umidade e ventos fortes. Acionamento de brigadas." },
  { id: 103, tipo: "Deslizamento", regiao: "Petrópolis",          estado: "RJ", nivel: "Alto",    data: "07/06/2026 14:22", status: "Ativo",      mensagem: "Solo saturado em encostas após chuvas contínuas. Alto risco de movimentação de massa em áreas de ocupação. Monitoramento de moradores em zonas de risco." },
  { id: 104, tipo: "Seca",         regiao: "Sertão Central",      estado: "CE", nivel: "Alto",    data: "07/06/2026 14:10", status: "Ativo",      mensagem: "Umidade do solo em nível crítico e ausência prolongada de precipitação. Impacto direto na agricultura familiar e no abastecimento de água." },
  { id: 105, tipo: "Seca",         regiao: "Cerrado Goiano",      estado: "GO", nivel: "Alto",    data: "07/06/2026 13:58", status: "Em análise", mensagem: "Queda contínua do índice de vegetação (NDVI) indica estresse hídrico severo nas lavouras. Recomendado planejamento de irrigação emergencial." },
  { id: 106, tipo: "Enchente",     regiao: "Litoral Sul",         estado: "BA", nivel: "Médio",   data: "07/06/2026 13:44", status: "Em análise", mensagem: "Chuva acumulada acima da média sazonal. Monitoramento reforçado em bairros próximos a cursos d'água e zonas de drenagem deficiente." },
  { id: 107, tipo: "Queimada",     regiao: "Floresta de Carajás", estado: "PA", nivel: "Médio",   data: "07/06/2026 13:30", status: "Em análise", mensagem: "Detecção de pluma de fumaça e ponto de calor isolado. Equipes de campo notificadas para verificação e contenção preventiva." },
  { id: 108, tipo: "Enchente",     regiao: "Grande São Paulo",    estado: "SP", nivel: "Baixo",   data: "07/06/2026 13:12", status: "Encerrado",  mensagem: "Acúmulo pontual de água em vias após chuva moderada. Situação normalizada pelo sistema de drenagem urbana. Alerta encerrado." }
];

/* ---------------------------------------------------------------------
   SÉRIE HISTÓRICA DE RISCO (gráfico de barras)
   Índice médio de risco da rede nos últimos 7 dias (escala 0–100).
   --------------------------------------------------------------------- */
const SERIE_RISCO = [
  { dia: "Seg", valor: 38 },
  { dia: "Ter", valor: 45 },
  { dia: "Qua", valor: 52 },
  { dia: "Qui", valor: 49 },
  { dia: "Sex", valor: 61 },
  { dia: "Sáb", valor: 74 },
  { dia: "Dom", valor: 83 }
];
