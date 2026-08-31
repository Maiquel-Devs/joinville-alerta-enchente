# 🌧️ Monitor Hidrometeorológico Comunitário — Joinville/SC

> Protótipo voluntário de monitoramento preventivo e simplificado de condições favoráveis a alagamentos e transbordamentos em Joinville.

---

## 🎯 1. Objetivo do Projeto
Em Joinville, a dúvida *"vai alagar a minha rua ou o caminho do meu trabalho?"* é frequente durante dias chuvosos. A maioria das pessoas comuns não sabe interpretar mapas meteorológicos complexos ou gráficos cheios de siglas técnicas.

O objetivo deste projeto voluntário é **democratizar a informação**: traduzir dados meteorológicos oficiais e características do relevo da cidade em um indicador visual simples (🟢 Normal, 🟡 Atenção, 🟠 Alerta, 🔴 Alerta Máximo), ajudando as pessoas a tomarem decisões preventivas (tirar o carro de áreas baixas, mudar rotas ou antecipar deslocamentos).

---

## 💡 2. A Solução
Desenvolvemos uma aplicação web leve e acessível diretamente pelo navegador (desktop e celular), sem necessidade de login ou instalação, composta por:
1. **Indicador de Risco:** Um painel colorido central que resume a gravidade do momento em linguagem clara.
2. **Painel de Métricas:** Valores diretos de chuva recente, chuva atual e tendência para as próximas horas.
3. **Mapeamento de Bacias:** Visualização interativa que destaca as principais calhas e várzeas de rios da cidade.
4. **Painel de Teste/Simulação:** Botões dedicados para demonstrar o comportamento do sistema diante de tempestades severas, mesmo em dias de sol.

---

## 🧮 3. Como o Cálculo Funciona (A "Conta" do Sistema)

### A analogia da esponja
O solo da cidade funciona como uma esponja de cozinha:
- Se a esponja estiver **seca**, ela absorve bastante água antes de deixar vazar.
- Se a esponja já estiver **encharcada de ontem**, qualquer chuva nova escorre direto para o asfalto, rios e bueiros.

### A fórmula matemática do sistema
O sistema não analisa apenas os minutos atuais. Ele combina passado e futuro em uma janela móvel de saturação:

$$\text{Volume Crítico Considerado} = \text{Chuva das últimas 24h (Passado)} + \text{Previsão das próximas 6h (Futuro)}$$

1. **Chuva das últimas 24h:** Mede o nível de encharcamento do solo (*solo saturado*).
2. **Previsão das próximas 6h:** Mede a quantidade de nova água a caminho.
3. **Classificação (Régua da Defesa Civil de SC):**
   - 🟢 **Abaixo de 30 mm:** **Observação Regular.** O solo e as galerias dão conta do escoamento.
   - 🟡 **De 30 a 49 mm:** **Estado de Atenção.** Risco de poças grandes e sobrecarga na microdrenagem (bueiros) em vias baixas.
   - 🟠 **De 50 a 79 mm:** **Alerta.** Solo saturado; canais secundários começam a reter água e subir para as ruas.
   - 🔴 **80 mm ou mais:** **Alerta Máximo.** Risco iminente de transbordamento de rios principais (calhas saturadas).

---

## 🔍 4. O que é REAL vs. O que é FICTÍCIO no Protótipo

Transparência sobre a integridade dos dados atuais:

### ✅ O que é REAL:
* **Modo "Tempo Real (Open-Meteo)":** Todos os números de chuva das últimas 24h, chuva atual e previsão vêm ao vivo dos servidores meteorológicos para Joinville (`lat: -26.3044`, `lon: -48.8456`).
* **Os Limiares de Risco:** As linhas de corte de 30 mm, 50 mm e 80 mm são baseadas nos parâmetros de alerta da Defesa Civil de Santa Catarina e do CEMADEN.
* **Georreferenciamento das Bacias:** As localizações das bacias dos rios Cachoeira, Água Vermelha e Itaum correspondem às coordenadas geográficas reais de Joinville.

### ⚠️ O que é APROXIMAÇÃO / SIMULAÇÃO:
* **Botões de Simulação (40mm e 85mm):** Os valores desses botões são fixos no código (*hardcoded*). Foram criados apenas para testes visuais de interface em reuniões e apresentações.
* **Polígonos das Bacias:** As áreas desenhadas no mapa são aproximações visuais desenhadas para o protótipo, não os arquivos vetoriais completos oficiais.
* **Ponto Único de Coleta:** A API meteorológica lê uma coordenada média central de Joinville; portanto, ainda não distingue uma tempestade no Vila Nova de uma garoa no Espinheiros.

---

## 🛠️ 5. Tecnologias e APIs Utilizadas

* **HTML5:** Estruturação semântica e acessível.
* **CSS3:** Estilização moderna, responsiva (*mobile-first*) e sistema de cores de advertência.
* **JavaScript (Vanilla / ES6+):** Lógica assíncrona (`async/await`), manipulação do DOM e cálculo da matriz de risco.
* **Leaflet.js:** Biblioteca open-source para mapas interativos leves.
* **OpenStreetMap:** Camada base de mapa público e gratuito.
* **Open-Meteo API:** Serviço de dados meteorológicos globais gratuito, com CORS liberado, sem necessidade de chave de autenticação e com suporte ao histórico horária das últimas 24h (`past_days=1`).

---

## 🚀 6. O que Pode Ser Melhorado (Ao Nosso Alcance)

Para evoluir este protótipo inicial para uma ferramenta de alta precisão e utilidade real na comunidade:

1. **Integração com a Tábua de Marés (Crucial para Joinville):**
   - *Por que:* O Rio Cachoeira deságua na Baía da Babitonga. Quando a maré sobe, a água da chuva não tem para onde escoar.
   - *Como fazer:* Consumir os horários e alturas da maré (dados públicos da Marinha do Brasil / Praticagem de São Francisco do Sul) e somar esse fator multiplicador ao risco.
2. **Importação dos Arquivos Oficiais do SIMGeo:**
   - *Por que:* A Prefeitura de Joinville fornece gratuitamente o mapa oficial de **Manchas de Inundação (AUC)** em formato Shapefile.
   - *Como fazer:* Converter os Shapefiles para `GeoJSON` e desenhar as ruas exatas que sofrem com inundações.
3. **Integração com Pluviômetros Físicos do CEMADEN:**
   - *Por que:* Joinville possui pluviômetros automáticos instalados em bairros diferentes.
   - *Como fazer:* Coletar dados dessas estações físicas para permitir que o usuário veja a chuva do seu bairro específico, e não uma média da cidade.
4. **Construção de um Backend e Alertas Automáticos:**
   - *Por que:* As pessoas nem sempre lembram de abrir um site durante uma chuva forte.
   - *Como fazer:* Criar uma API em Node.js ou C#/.NET com um bot no Telegram que avise automaticamente: *"Atenção: o acumulado no Vila Nova acabou de atingir 50 mm"*.

---

## 📚 7. Fontes Oficiais e Referências

Para garantir a transparência técnica e a confiabilidade do protótipo, a lógica de alertas e os mapeamentos baseiam-se exclusivamente em bases de dados governamentais e científicas abertas:

### Dados Geográficos e Topográficos
* **SIMGeo (Prefeitura de Joinville):** Fornece as diretrizes cartográficas oficiais, incluindo o Modelo Digital de Elevação e os polígonos das **Manchas de Inundação (AUC)**. 
  * 🔗 [Acessar Portal SIMGeo](https://www.joinville.sc.gov.br/publicacoes/downloads-sistema-de-informacoes-municipais-georreferenciadas-simgeo/)

### Meteorologia e Previsão
* **Open-Meteo API:** Serviço global de telemetria meteorológica open-source. Utilizado para buscar a chuva acumulada nas últimas 24h e a previsão horária, sem uso de chaves comerciais.
  * 🔗 [Acessar Documentação](https://open-meteo.com/en/docs)
* **CEMADEN:** Centro Nacional de Monitoramento e Alertas de Desastres Naturais. Referência futura para integração de leitura dos pluviômetros físicos instalados nos bairros de Joinville.
  * 🔗 [Acessar Mapa Interativo](http://www.cemaden.gov.br/mapainterativo/)

### Regras de Negócio e Limiares de Alerta
* **Defesa Civil de Santa Catarina e PLANCON (Joinville):** O Plano de Contingência municipal e estadual fundamenta as linhas de corte do código (`30 mm`, `50 mm` e `80 mm`). Estes valores representam o limite físico de saturação do solo arenoso/argiloso da região litorânea antes do colapso da drenagem pluvial.
  * 🔗 [Plano de Contingência de Joinville](https://www.joinville.sc.gov.br/publicacoes/plano-de-contingencia-de-joinville/)

### Hidrologia e Oceanografia (Próximas Fases)
* **Marinha do Brasil (DHN):** Fornece a tábua de marés da Baía da Babitonga / São Francisco do Sul, dado essencial para calcular o bloqueio do escoamento do Rio Cachoeira.
  * 🔗 [Tábuas de Maré](https://www.marinha.mil.br/chm/dados-do-segmar/tabuas-de-mare)
* **Epagri/Ciram:** Órgão estadual responsável pelo monitoramento oficial do nível da calha dos rios em tempo real.
  * 🔗 [Acessar Epagri/Ciram](https://ciram.epagri.sc.gov.br/)