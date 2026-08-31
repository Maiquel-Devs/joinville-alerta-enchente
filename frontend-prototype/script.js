// Coordenadas Centrais de Joinville - SC
const JOINVILLE_CENTER = [-26.3044, -48.8456];

// Geometrias simplificadas das principais manchas de inundação e bacias de Joinville
// Dados baseados nos vetores de drenagem do SIMGeo
const BASINS = {
  cachoeira_centro: {
    name: "Bacia do Rio Cachoeira (Centro / Bucarein)",
    center: [-26.3085, -48.8436],
    // Polígono abrangendo a calha central e áreas baixas ao redor do Rio Cachoeira
    polygon: [
      [-26.2950, -48.8480],
      [-26.3020, -48.8350],
      [-26.3150, -48.8380],
      [-26.3220, -48.8470],
      [-26.3130, -48.8550],
      [-26.3000, -48.8520]
    ]
  },
  agua_vermelha: {
    name: "Bacia do Rio Água Vermelha (Vila Nova)",
    center: [-26.2865, -48.9100],
    // Várzea do Rio Água Vermelha / Rodovia XV de Novembro
    polygon: [
      [-26.2750, -48.9250],
      [-26.2800, -48.8950],
      [-26.2950, -48.9000],
      [-26.3020, -48.9220],
      [-26.2900, -48.9320]
    ]
  },
  itaum_morro: {
    name: "Bacia do Rio Itaum / Morro do Meio",
    center: [-26.3260, -48.8780],
    // Zonas de confluência do Rio Itaum e Rio Velho
    polygon: [
      [-26.3200, -48.8500],
      [-26.3350, -48.8400],
      [-26.3450, -48.8650],
      [-26.3380, -48.8950],
      [-26.3180, -48.8800]
    ]
  }
};

// Inicialização do Mapa
const map = L.map("map").setView(JOINVILLE_CENTER, 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let currentPolygonLayer = null;

// Renderização dos polígonos reais no mapa de acordo com o risco
function renderBasinPolygon(basinKey, riskLevel) {
  if (currentPolygonLayer) {
    map.removeLayer(currentPolygonLayer);
  }

  const basin = BASINS[basinKey];

  let color = "#10b981"; // Normal (Verde)
  if (riskLevel === "atencao") color = "#f59e0b"; // Atenção (Amarelo)
  if (riskLevel === "alerta") color = "#ea580c";  // Alerta (Laranja)
  if (riskLevel === "critico") color = "#dc2626"; // Crítico (Vermelho)

  currentPolygonLayer = L.polygon(basin.polygon, {
    color: color,
    weight: 2,
    fillColor: color,
    fillOpacity: 0.45
  }).addTo(map);

  currentPolygonLayer.bindPopup(`<strong>${basin.name}</strong><br>Área sujeita a refluxo e inundação sob precipitação acumulada elevada.`);
  map.flyTo(basin.center, 13);
}

// Matriz de Decisão Baseada nos Protocolos da Defesa Civil de Santa Catarina
function evaluateRiskMatrix(past24hMm, forecast6hMm) {
  // Volume crítico considerado = solo já saturado nas últimas 24h + chuva iminente
  const criticalVolume = past24hMm + forecast6hMm;

  if (criticalVolume >= 80) {
    return {
      level: "critico",
      badge: "🔴 Alerta Máximo: Transbordamento Iminente",
      title: "Risco Severo de Inundação e Alagamento",
      desc: "O volume acumulado (≥ 80mm) ultrapassa o limite de retenção das bacias. Risco iminente de transbordamento de rios principais e refluxo de galerias.",
      totalConsidered: criticalVolume
    };
  } else if (criticalVolume >= 50) {
    return {
      level: "alerta",
      badge: "🟠 Alerta: Risco Elevado",
      title: "Solo Saturado / Escoamento Comprometido",
      desc: "Acumulado crítico (50 a 79mm). Bacias secundárias e vias próximas a mangues e canais com alto risco de retenção de lâmina d'água.",
      totalConsidered: criticalVolume
    };
  } else if (criticalVolume >= 30) {
    return {
      level: "atencao",
      badge: "🟡 Estado de Atenção: Monitoramento Contínuo",
      title: "Acúmulo Pontual em Áreas Baixas",
      desc: "Volume entre 30 e 49mm. Atenção voltada a cruzamentos históricos de alagamento por microdrenagem nas vias arteriais.",
      totalConsidered: criticalVolume
    };
  } else {
    return {
      level: "normal",
      badge: "🟢 Nível 1: Observação Regular",
      title: "Capacidade de Drenagem Estável",
      desc: "O volume acumulado nas últimas 24h está dentro dos parâmetros normais de escoamento. Sem alertas hidrológicos no momento.",
      totalConsidered: criticalVolume
    };
  }
}

// Atualização dos elementos da interface
function updateDashboard(past24h, currentRain, forecast6h, simulatedOverride = null) {
  let assessment;

  if (simulatedOverride) {
    assessment = evaluateRiskMatrix(simulatedOverride.past24h, simulatedOverride.forecast6h);
    document.getElementById("rain-past-24h").textContent = `${simulatedOverride.past24h.toFixed(1)} mm`;
    document.getElementById("rain-current").textContent = `${simulatedOverride.currentRain.toFixed(1)} mm/h`;
    document.getElementById("rain-forecast-6h").textContent = `${simulatedOverride.forecast6h.toFixed(1)} mm`;
  } else {
    assessment = evaluateRiskMatrix(past24h, forecast6h);
    document.getElementById("rain-past-24h").textContent = `${past24h.toFixed(1)} mm`;
    document.getElementById("rain-current").textContent = `${currentRain.toFixed(1)} mm/h`;
    document.getElementById("rain-forecast-6h").textContent = `${forecast6h.toFixed(1)} mm`;
  }

  document.getElementById("total-considered").textContent = `${assessment.totalConsidered.toFixed(1)} mm`;

  // Atualização do Card
  const riskCard = document.getElementById("risk-card");
  riskCard.className = `card risk-${assessment.level}`;
  document.getElementById("risk-badge").textContent = assessment.badge;
  document.getElementById("risk-title").textContent = assessment.title;
  document.getElementById("risk-description").textContent = assessment.desc;

  // Atualização do Mapa
  const selectedBasin = document.getElementById("basin-select").value;
  renderBasinPolygon(selectedBasin, assessment.level);
}

// Consulta Oficial: API Open-Meteo com Parâmetro past_days=1 (Histórico 24h)
async function fetchOfficialTelemetry() {
  // past_days=1 traz as 24 horas anteriores ao dia de hoje
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${JOINVILLE_CENTER[0]}&longitude=${JOINVILLE_CENTER[1]}&current=temperature_2m,precipitation&hourly=precipitation&past_days=1&forecast_days=2&timezone=America%2FSao_Paulo`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Falha na telemetria");
    const data = await res.json();

    const currentRain = data.current.precipitation || 0.0;
    
    // O array hourly contém: 24 horas de ontem + 24 horas de hoje
    // Identificamos a hora atual para somar exatamente as 24 horas anteriores
    const currentTimeISO = data.current.time;
    const currentIndex = data.hourly.time.indexOf(currentTimeISO);

    // Soma das 24 horas anteriores ao momento atual
    const past24HoursSlice = data.hourly.precipitation.slice(Math.max(0, currentIndex - 24), currentIndex);
    const past24hAccumulated = past24HoursSlice.reduce((acc, val) => acc + val, 0);

    // Previsão para as próximas 6 horas
    const forecast6HoursSlice = data.hourly.precipitation.slice(currentIndex + 1, currentIndex + 7);
    const forecast6hAccumulated = forecast6HoursSlice.reduce((acc, val) => acc + val, 0);

    updateDashboard(past24hAccumulated, currentRain, forecast6hAccumulated);
  } catch (err) {
    console.error("Falha ao sincronizar dados meteorológicos:", err);
    document.getElementById("risk-title").textContent = "Falha de Conexão";
    document.getElementById("risk-description").textContent = "Não foi possível recuperar a telemetria horária do Open-Meteo.";
  }
}

// Eventos de Simulação de Limiares Oficiais
document.querySelectorAll(".simulation-bar .btn").forEach(button => {
  button.addEventListener("click", (e) => {
    document.querySelectorAll(".simulation-bar .btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");

    const scenario = e.target.dataset.scenario;

    if (scenario === "real") {
      fetchOfficialTelemetry();
    } else if (scenario === "atencao") {
      updateDashboard(0, 0, 0, { past24h: 30.0, currentRain: 5.0, forecast6h: 10.0 });
    } else if (scenario === "alerta") {
      updateDashboard(0, 0, 0, { past24h: 60.0, currentRain: 12.0, forecast6h: 25.0 });
    }
  });
});

// Evento de troca de bacia hidrográfica
document.getElementById("basin-select").addEventListener("change", () => {
  const activeBtn = document.querySelector(".simulation-bar .btn.active");
  activeBtn.click();
});

// Execução inicial
fetchOfficialTelemetry();