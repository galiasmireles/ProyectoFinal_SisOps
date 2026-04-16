# Plantilla de Diseno para el Simulador Visual de Sistemas Operativos

## Proposito del documento

Este archivo define de forma clara y reutilizable lo que busca el proyecto, la direccion visual temporal que se usara como referencia y las reglas de representacion que deben seguir futuras implementaciones. Su objetivo es servir como contexto legible tanto para personas como para otras IAs.

Este documento no describe el producto final cerrado. Describe una base temporal de diseno para alinear decisiones tempranas de interfaz, visualizacion y experiencia de usuario.

## Naturaleza del proyecto

El proyecto es una pagina web educativa, visual e interactiva enfocada en representar de manera extrema, clara y configurable el funcionamiento interno de procesos, planificacion de CPU, memoria paginada, reemplazo de paginas y threads.

No es un sistema administrativo. No esta orientado a capturar tramites ni a gestionar usuarios. Toda decision de diseno debe favorecer:

- comprension visual
- trazabilidad de eventos
- personalizacion de parametros
- comparacion entre algoritmos
- animacion de cambios de estado
- lectura inmediata de lo que esta ocurriendo

## Objetivo principal de experiencia

La interfaz debe permitir que un alumno observe, casi cuadro por cuadro, como cambia el sistema operativo simulado.

La representacion debe mostrar con extrema claridad:

- que proceso existe
- en que estado se encuentra
- cuando cambia de estado
- que recurso esta usando
- cuanto tiempo ha consumido
- cuanta memoria ocupa
- cuantas paginas tiene
- que thread pertenece a que proceso
- que pagina entra y cual sale
- por que ocurrio un page fault
- como afecta una configuracion al comportamiento del sistema

La interfaz no debe esconder informacion relevante. Debe priorizar visibilidad, relaciones claras entre entidades y lectura rapida de eventos.

## Principios de diseno

### 1. Representacion extrema de eventos

Todo evento importante debe tener una representacion visible o consultable en pantalla.

Ejemplos:

- Si nace un proceso, debe verse su origen, sus atributos y su aparicion en el flujo.
- Si un thread es creado, debe verse de que proceso se origino, su identificador, su estado, su tiempo de CPU y su consumo de memoria asociado.
- Si ocurre un cambio de contexto, debe verse que salio de CPU, que entro, en que instante y por que.
- Si entra una pagina a memoria, debe verse que marco ocupa, que pagina reemplazo y que algoritmo tomo la decision.

### 2. Diferenciacion visual fuerte

Los elementos visuales deben distinguirse claramente unos de otros. No basta con cambiar solo texto. La distincion debe existir por:

- color
- forma o borde
- etiqueta
- iconografia o marcador
- posicion o agrupacion
- estado visual

Procesos, threads, paginas, marcos, colas, CPU y metricas no deben confundirse entre si.

### 3. Interactividad alta

El usuario debe poder alterar parametros y ver los efectos sin friccion. La interfaz debe favorecer exploracion.

Se espera alta personalizacion en:

- quantum
- priorities
- arrival time
- burst time
- numero de paginas
- tamano de memoria
- tamano de pagina
- numero de marcos
- velocidad de animacion
- algoritmo activo
- nivel de detalle visual

### 4. Visualizacion por capas

La pagina debe permitir entender el sistema desde varias capas:

- capa general: resumen global del sistema
- capa operativa: estado actual de CPU, ready queue, memoria y reemplazo
- capa temporal: linea del tiempo y diagrama de Gantt
- capa analitica: metricas por proceso, promedios y comparacion de algoritmos
- capa forense: eventos paso a paso, causas y efectos

### 5. Coherencia semantica

Cada color y patron visual debe tener un significado consistente en toda la interfaz.

Ejemplo recomendado:

- `Running`: color de alta energia
- `Ready`: color de espera activa
- `Waiting`: color de pausa o bloqueo
- `Terminated`: color apagado o neutral
- `Page Fault`: color de alerta
- `Success / loaded`: color de confirmacion

## Direccion visual temporal

### Estilo general

La plantilla temporal debe usar una estetica moderna, tecnica y de laboratorio visual. Debe transmitir que el usuario esta observando la actividad interna de un sistema operativo en tiempo real.

### Fondo

Se requiere fondo oscuro para aumentar contraste y enfocar la atencion en los elementos dinamicos. El fondo no debe ser plano sin intencion; debe tener profundidad sutil.

Recomendacion temporal:

- fondo base: `#07111f`
- panel principal: `#0d1726`
- panel secundario: `#101d30`
- borde suave: `rgba(130, 163, 255, 0.16)`

### Colores de acento

Los colores deben resaltar con fuerza sobre el fondo oscuro y permitir distinguir entidades con claridad.

Paleta temporal:

- cian brillante: `#4de2ff`
- azul electrico: `#4c8dff`
- verde neon: `#49f2a5`
- amarillo tecnico: `#ffd166`
- naranja alerta: `#ff9f43`
- rojo fault: `#ff5d73`
- violeta operativo: `#a78bfa`

### Tipografia

La interfaz debe sentirse tecnica y legible. Se recomienda una combinacion de:

- tipografia de display fuerte para titulos
- tipografia limpia para lectura general
- tipografia monoespaciada para metricas, tiempos, PID, marcos y eventos

Recomendacion temporal web:

- Titulos: `Space Grotesk`, `Segoe UI`, sans-serif
- Texto general: `Inter`, `Segoe UI`, sans-serif
- Datos tecnicos: `JetBrains Mono`, `Consolas`, monospace

### Sensacion visual

La UI temporal debe verse:

- intensa
- tecnica
- clara
- modular
- trazable
- educativa
- altamente instrumentada

No debe verse como dashboard corporativo generico.

## Reglas de representacion visual

### Procesos

Cada proceso debe mostrar como minimo:

- PID
- estado actual
- arrival time
- burst time
- priority
- paginas asignadas
- tiempo ejecutado
- tiempo restante
- color identificador unico o variante distinguible

### Threads

Cada thread debe mostrar de manera visible:

- TID
- proceso padre
- estado
- memoria consumida
- tiempo de CPU usado
- cola o recurso donde se encuentra

Un thread nunca debe aparecer como entidad aislada sin indicar de que proceso proviene.

### CPU

La CPU debe mostrar:

- proceso o thread actual
- tiempo actual de simulacion
- quantum restante cuando aplique
- algoritmo activo
- cambio de contexto reciente

### Cola Ready

La cola debe verse como secuencia ordenada, no solo como tabla. Debe ser evidente:

- quien esta primero
- quien acaba de entrar
- quien fue desplazado
- prioridad relativa cuando aplique

### Gantt

El Gantt debe ser central en scheduling. Debe incluir:

- segmentos coloreados por proceso
- marcas temporales claras
- cambios de contexto
- ociosidad de CPU si existe

### Memoria principal y marcos

La memoria debe poder visualizar:

- marcos totales
- marcos ocupados
- marcos libres
- pagina cargada por marco
- proceso propietario
- fragmentacion interna si aplica

### Reemplazo de paginas

La vista debe dejar claro:

- referencia actual
- si hubo page fault
- pagina que entra
- pagina que sale
- criterio usado por el algoritmo
- estado de memoria tras el evento

## Requisitos de personalizacion

La interfaz debe estar preparada para exponer paneles de configuracion visibles y faciles de modificar. El usuario debe poder alterar parametros y ejecutar nuevas simulaciones sin reiniciar toda la experiencia.

La personalizacion debe sentirse parte del aprendizaje. Cambiar valores debe ser una accion natural, no escondida.

## Estructura recomendada de la pagina web

La plantilla temporal debe partir de una pantalla principal que funcione como hub de navegacion, no como simulador total.

La pantalla principal debe incluir:

1. Encabezado del proyecto
2. Explicacion breve del enfoque educativo y visual
3. Menu de acceso a simuladores
4. Tarjetas o bloques de navegacion distinguibles
5. Nota de arquitectura modular del proyecto

La pantalla principal no debe incluir todos los componentes del simulador al mismo tiempo. No debe mezclar Gantt, CPU, marcos de memoria, reemplazo de paginas y metricas completas dentro del home.

La simulacion real debe vivir en pantallas independientes.

## Arquitectura visual y de archivos

Cada simulador debe vivir en su propio archivo HTML para facilitar:

- mejor edicion del repositorio
- separacion clara de responsabilidades
- trabajo paralelo por modulo
- mantenimiento mas simple
- evolucion independiente de cada vista

Estructura temporal sugerida:

1. `temp-design.html` como pantalla principal o hub
2. `process-simulator.html` para procesos y threads
3. `scheduling-simulator.html` para planificacion de CPU
4. `memory-simulator.html` para memoria y paginacion
5. `replacement-simulator.html` para reemplazo de paginas

Si despues se desea agregar una vista extra para metricas o comparacion, tambien debe vivir como archivo separado.

## Comportamiento esperado de futuras implementaciones

Si una IA o desarrollador usa este documento como referencia, debe priorizar:

- claridad antes que minimalismo
- visualizacion antes que decoracion
- relaciones explicitas antes que supuestos
- controles visibles antes que menus escondidos
- detalle tecnico antes que simplificacion excesiva

## Restricciones temporales de esta plantilla

Esta guia es una referencia inicial. Puede cambiar cuando se definan:

- stack tecnologico definitivo
- arquitectura del frontend
- estructura real de datos
- estilo final de marca del proyecto

## Entregables asociados a esta plantilla

Se crea junto con este documento un ejemplo temporal de interfaz web para ilustrar:

- una pantalla principal con menu visual
- fondo oscuro y colores de alto contraste
- acceso a simuladores por modulo
- estructura separada por archivos HTML
- bloques listos para ser reinterpretados por futuras IAs o por el equipo
