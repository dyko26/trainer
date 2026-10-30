# RunPulse AI — Control de Running & Entrenador Adaptativo Gemini

Aplicación web local para corredores diseñada para llevar el control fisiológico de tu progreso, planificar entrenamientos diarios, visualizar qué sistemas mejora cada sesión y **sincronizar tus planes dinámicamente con Gemini AI**.

## 🚀 Cómo abrir la aplicación
No requiere instalación de servidores ni bases de datos externas:
1. Abre directamente el archivo [`index.html`](./index.html) con doble clic en cualquier navegador moderno (Chrome, Edge, Brave, Firefox).
2. Todos tus datos se guardan automáticamente en el almacenamiento local de tu navegador (`localStorage`) y puedes exportar/importar copias de seguridad en `.json` desde el ícono de base de datos arriba a la derecha.

## ✨ Funcionalidades Principales

1. **Perfil Fisiológico y Cálculo Automático de Zonas (`Perfil Fisiológico & Zonas`)**:
   - Edad, peso, estatura, IMC, FC en reposo, FC máxima, FC de umbral de lactato, cadencia, VO2max, días disponibles, rotación de zapatillas e historial de molestias/lesiones.
   - Cálculo automático de **VDOT (Fórmula Jack Daniels)** a partir de tus mejores marcas (5K, 10K, 21K, 42K) y zonas de entrenamiento por **Reserva Cardíaca (Karvonen)** y ritmos min/km (Z1 a Z5).

2. **Objetivos y Predictor de Carrera (`Objetivos & Retos`)**:
   - Fija carreras objetivo (prioridad A, B o C) con fecha, distancia y tiempo meta.
   - Calcula el ritmo objetivo requerido, el VDOT necesario para lograrlo y la proyección actual de tus tiempos equivalentes en 5K, 10K, Media Maratón y Maratón.

3. **Organizador Semanal y Bitácora Comparativa (`Calendario y Entrenamientos`)**:
   - Vista de calendario de 7 días (Lunes a Domingo) + tabla filtrable.
   - Registra para cada sesión lo **Planeado por Gemini** vs lo **Realmente Completado** (distancia real, tiempo, ritmo autocalculado, pulsaciones medias, esfuerzo percibido **RPE 1-10** y notas/sensaciones).

4. **Mapa Visual de Adaptaciones Fisiológicas (`¿Qué Mejora Cada Entrenamiento?`)**:
   - Gráfica Radar interactiva que compara los 6 sistemas fisiológicos que desarrolla cada tipo de sesión:
     - *Base Aeróbica y Capilares*
     - *Umbral de Lactato*
     - *Potencia VO2 Máx*
     - *Economía de Carrera*
     - *Fuerza Muscular / Tendinosa*
     - *Resistencia y Glucógeno*
   - Compara cada tipo de sesión contra tu **Estímulo Acumulado Real** (calculado a partir de los entrenamientos que ya completaste) y revisa tu balance de polarización **Regla 80/20**.

5. **Centro Gemini AI (`Centro Gemini AI`)**:
   - **Opción A (Automática con API Key)**: Ingresa tu API Key de Google AI Studio (`gemini-2.5-flash` o `gemini-2.5-pro`) y con un clic en **"Auto-Ajustar Plan con API"** o **"Generar Próxima Semana con API"**, Gemini analizará tus desviaciones (sesiones modificadas, RPE alto, fatiga o mejoras de ritmo) y actualizará automáticamente los entrenamientos de tu calendario.
   - **Opción B (Flujo Copiar / Pegar sin API Key)**: Con un clic genera el prompt estructurado con todo tu contexto fisiológico y tus últimos entrenamientos completados, pégalo en tu chat habitual de Gemini, y pega la respuesta de Gemini de vuelta en la app para aplicar los entrenamientos ajustados a tu calendario.
