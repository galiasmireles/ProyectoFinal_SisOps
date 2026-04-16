# 🖥️ OS Nexus — Simulador Visual de Sistemas Operativos

<div align="center">

![OS Nexus Banner](https://img.shields.io/badge/OS%20Nexus-Simulador%20Visual-00d4ff?style=for-the-badge&logo=linux&logoColor=white)
![Algoritmos](https://img.shields.io/badge/Algoritmos-8%20Scheduling%20%7C%205%20Paginación-7c3aed?style=for-the-badge)
![Lenguaje](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JavaScript-f59e0b?style=for-the-badge)
![Estado](https://img.shields.io/badge/Estado-Completado-10b981?style=for-the-badge)

**Simulador educativo e interactivo de Sistemas Operativos**  
Proyecto Final · Materia: Sistemas Operativos · UDEM

[🚀 Demo en Vivo](#demo) · [📖 Documentación](#uso) · [🎥 Video Demo](#video)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Módulos](#módulos)
- [Cómo usar](#cómo-usar)
- [Archivos de entrada](#archivos-de-entrada)
- [Algoritmos implementados](#algoritmos-implementados)
- [Marco Teórico](#marco-teórico)
- [Exportar resultados](#exportar-resultados)
- [Tecnologías](#tecnologías)
- [Equipo](#equipo)

---

## 🎯 Descripción

**OS Nexus** es un simulador visual interactivo que replica el comportamiento interno de un Sistema Operativo moderno. Diseñado con fines educativos, permite visualizar en tiempo real:

- La **gestión de procesos** y sus transiciones de estado
- Los **algoritmos de planificación de CPU** (8 algoritmos)
- La **paginación de memoria** y administración de marcos
- Los **algoritmos de reemplazo de páginas** (5 algoritmos)
- **Métricas de rendimiento** comparativas

> El simulador corre 100% en el navegador — sin instalación, sin dependencias externas, sin servidor.

---

## ✨ Características

| Característica | Descripción |
|---|---|
| 🎨 **Interfaz Dark Mode** | Diseño profesional con tema oscuro, animaciones y UI reactiva |
| ⚡ **Tiempo Real** | Animación paso a paso del scheduling con velocidad configurable |
| 📊 **Gantt Interactivo** | Diagrama de Gantt dinámico por proceso |
| 🔄 **8 Algoritmos Scheduling** | FCFS, SJF, HRRN, RR, SRTF, Priority, MLQ, MLFQ |
| 🧮 **5 Algoritmos Reemplazo** | FIFO, LRU, Óptimo, Clock, Segunda Oportunidad |
| 📈 **Métricas Completas** | TAT, WT, RT, CPU Utilization, Throughput |
| 📥 **Exportar CSV** | Resultados exportables con regex-extracted data |
| 📂 **Carga de Archivos** | Importar procesos desde `.txt` o `.csv` |
| ⚖️ **Comparación** | Benchmarking simultáneo de todos los algoritmos |
| 🗺️ **Diagrama de Estados** | Visualización en tiempo real del estado de cada proceso |

---

## 📦 Módulos

### Módulo 1 — Procesos
- Captura de PID, Arrival Time, Burst Time, Priority, Páginas
- Diagrama de estados interactivo (New → Ready → Running → Waiting → Terminated)
- Tabla de procesos con badges de color únicos por PID
- Carga desde archivo `.txt`

### Módulo 2 — Scheduling (CPU)
Algoritmos implementados:

**No Preemptivos:**
- **FCFS** — First Come First Served
- **SJF** — Shortest Job First
- **HRRN** — Highest Response Ratio Next

**Preemptivos:**
- **Round Robin** — con quantum configurable
- **SRTF** — Shortest Remaining Time First
- **Priority** — planificación por prioridad preemptiva
- **MLQ** — Multilevel Queue (3 niveles)
- **MLFQ** — Multilevel Feedback Queue (aging automático)

Para cada algoritmo se muestra:
- Cola de listos (visual)
- Proceso en ejecución en CPU
- Diagrama de Gantt por proceso
- Tabla con: Completion, Turnaround, Waiting, Response Time + Promedios

### Módulo 3 — Paginación de Memoria
- Configuración de tamaño de memoria, página y marcos
- Tabla de páginas por proceso
- Mapa visual de la memoria principal
- Cálculo de fragmentación interna

### Módulo 4 — Reemplazo de Páginas
- Visualización paso a paso con cadena de referencias
- Conteo de Page Faults y Hits
- Hit Rate con barra de progreso
- Log detallado por paso

### Módulo 5 — Métricas
- Gráficas de Turnaround y Waiting por proceso
- CPU Utilization timeline
- Tabla detallada de todas las métricas

### Módulo 6 — Comparación
- Benchmarking simultáneo de los 8 algoritmos con los mismos procesos
- Gráfica comparativa multi-dataset (Chart.js)
- Ranking por Waiting Time promedio
- Marco teórico integrado

---

## 🚀 Cómo usar

### Opción A — GitHub Pages (Recomendado)

1. Ve a: `https://TU_USUARIO.github.io/os-simulator/`
2. ¡Listo! No requiere instalación.

### Opción B — Local

```bash
# 1. Clona el repositorio
git clone https://github.com/TU_USUARIO/os-simulator.git
cd os-simulator

# 2. Abre directamente en el navegador
# En macOS:
open index.html

# En Windows:
start index.html

# En Linux:
xdg-open index.html
```

---

## 📂 Archivos de entrada

### `procesos.txt`
```
PID,Arrival,Burst,Priority,Pages
1,0,6,3,4
2,1,4,1,3
3,2,8,4,5
4,3,3,2,2
5,4,5,2,4
```

### `memoria.txt`
```
Memoria=128
PageSize=4
Frames=32
```

Para cargar: Ve a **Procesos** → Clic en "📂 Cargar .txt" → Selecciona el archivo.

---

## 🧮 Algoritmos implementados

### Scheduling

| Algoritmo | Tipo | Complejidad | Óptimo para |
|---|---|---|---|
| FCFS | Non-Preemptive | O(n log n) | Batch simple |
| SJF | Non-Preemptive | O(n²) | Min waiting time |
| HRRN | Non-Preemptive | O(n²) | Anti-starvation |
| Round Robin | Preemptive | O(n) | Time-sharing |
| SRTF | Preemptive | O(n²) | Min TAT |
| Priority | Preemptive | O(n log n) | Crítico/tiempo real |
| MLQ | Preemptive | O(n) | Tipos distintos |
| MLFQ | Preemptive | O(n log n) | General purpose (Linux, Windows) |

### Reemplazo de Páginas

| Algoritmo | Descripción | Anomalía Bélády |
|---|---|---|
| FIFO | Reemplaza la más antigua | Sí |
| LRU | Menos recientemente usada | No |
| Óptimo | Mejor teórico (futuro conocido) | No |
| Clock | Aproximación eficiente de LRU | No |
| Segunda Oportunidad | FIFO con bit de referencia | No |

---

## 📐 Marco Teórico

### Métricas de Scheduling

```
Turnaround Time (TAT) = Completion Time − Arrival Time
Waiting Time (WT)     = Turnaround Time − Burst Time
Response Time (RT)    = First CPU Time − Arrival Time
CPU Utilization       = (Busy Time / Total Time) × 100%
Throughput            = Procesos completados / Tiempo total
```

### HRRN Response Ratio
```
Response Ratio = (Waiting Time + Burst Time) / Burst Time
```

### Estados de Proceso
```
NEW → READY → RUNNING → TERMINATED
                ↕
             WAITING
```

---

## 📥 Exportar resultados

El simulador genera un CSV con las siguientes columnas extraídas mediante lógica de parsing (equivalente a regex):

```
PID, Arrival, Burst, Priority, Pages, Algorithm,
CompletionTime, TurnaroundTime, WaitingTime, ResponseTime
```

Para exportar: Ve a **Métricas** → Clic en "📥 Exportar CSV"

El archivo se llama: `os_nexus_results_{ALGORITMO}_{TIMESTAMP}.csv`

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| **HTML5** | Estructura semántica |
| **CSS3** | Grid, Flexbox, Custom Properties, Animaciones |
| **JavaScript ES6+** | Lógica de simulación, algoritmos, DOM |
| **Chart.js 4** | Gráficas de métricas y comparación |
| **Google Fonts** | Syne, JetBrains Mono, Space Mono |

> ⚠️ Sin frameworks. Sin dependencias NPM. 1 solo archivo HTML.

---

## 📊 Estructura del Repositorio

```
os-simulator/
├── index.html          ← Simulador completo (todo en 1 archivo)
├── procesos.txt        ← Ejemplo de entrada de procesos
├── memoria.txt         ← Ejemplo de configuración de memoria
└── README.md           ← Este archivo
```

---

## 🎥 Video

> [Ver Demo en YouTube](#) ← Reemplazar con link real

---

## 👥 Equipo

| Nombre | Matrícula | Rol |
|---|---|---|
| Nombre 1 | 123456 | Frontend & Scheduling |
| Nombre 2 | 123457 | Paginación & Métricas |
| Nombre 3 | 123458 | UI/UX & Documentación |

**Materia:** Sistemas Operativos  
**Institución:** UDEM  
**Semestre:** 2025

---

## 📄 Licencia

MIT License — Uso educativo libre.

---

<div align="center">
<strong>OS Nexus</strong> · Hecho con ❤️ para Sistemas Operativos · UDEM 2025
</div>
