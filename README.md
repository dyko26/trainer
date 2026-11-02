# RunPulse AI — App & Sitio Web de Running Multi-Corredor

Aplicación web progresiva (PWA) y sitio web local diseñado con una estética **económica visualmente, profesional y amigable**, pensada para que **uno o varios corredores en un mismo dispositivo** lleven el control completo de sus entrenamientos, reciban recomendaciones diarias adaptativas, configuren recordatorios y aprendan con datos curiosos científicos del running.

## 🚀 Cómo abrir la aplicación
No requiere servidores ni bases de datos externas:
1. Abre directamente [`index.html`](./index.html) con doble clic en cualquier navegador moderno (Chrome, Edge, Brave, Safari, Firefox).
2. En dispositivos móviles o escritorio puedes instalarla como **App (PWA)** desde el menú del navegador (*"Instalar aplicación"* o *"Agregar a pantalla de inicio"*).

## ✨ Novedades y Funcionalidades Principales

1. **Diseño Económico Visualmente, Profesional y Amigable (Modo Claro + Oscuro)**:
   - Interfaz limpia, clara y descansada para la vista por defecto (con interruptor de **Modo Oscuro Suave** arriba a la derecha).
   - Barra de navegación superior en escritorio y **barra inferior tipo App Móvil** en pantallas pequeñas.

2. **Sistema Multi-Corredor Local (`Cambiar Usuario / Gestionar Corredores`)**:
   - Permite que **varias personas** utilicen la aplicación en el mismo navegador con sus propios datos completamente independientes (perfil fisiológico, calendario, récords, recordatorios, objetivos y favoritos).
   - Incluye asistente rápido para crear nuevos perfiles con color distintivo y plan semanal base opcional.
   - Respaldo `.json` tanto de **todos los corredores** como de un **corredor individual**.

3. **Recomendaciones Diarias según el Progreso Registrado**:
   - Calcula tu **Índice de Disposición Diaria (%)** analizando tus entrenamientos recientes, esfuerzo percibido (RPE), sesiones modificadas, regla de polarización 80/20 e historial de molestias.
   - Genera 4 bloques diarios accionables:
     1. *Enfoque y Ritmo de Hoy*
     2. *Lectura de Fatiga y Carga*
     3. *Prevención Biomecánica y Cadencia*
     4. *Hidratación y Nutrición de la Sesión*

4. **Recordatorios de Entrenamientos y Exportación a Calendario (`.ics`)**:
   - Banner inteligente en el inicio cuando tienes una sesión pendiente hoy.
   - Configura múltiples recordatorios por hora y días de la semana con **Notificaciones del Navegador** y alerta sonora suave.
   - Descarga tu semana en formato universal `.ics` para añadir tus entrenamientos con alarma a **Google Calendar, Apple Calendar o Outlook** en tu teléfono.

5. **Cápsulas y Biblioteca de Datos Curiosos del Running**:
   - Widget interactivo del **"Dato Curioso del Día"** con consejo práctico aplicable, botón para explorar más datos y guardado en **Favoritos ⭐**.
   - Enciclopedia completa filtrable por *Fisiología*, *Biomecánica*, *Nutrición*, *Entrenamiento* e *Historia*, más generador de nuevos datos curiosos con **Gemini IA**.

6. **Fisiología, Escáner de Reloj (Gemini Vision) y Sincronización con Gemini AI**:
   - Cálculo automático de **VDOT (Jack Daniels)** y zonas por **Reserva Cardíaca (Karvonen)**.
   - Gráfica Radar de los 6 sistemas fisiológicos y balance 80/20.
   - Subida o pegado (`Ctrl+V`) de capturas de pantalla de tu reloj deportivo (Garmin, Strava, Coros, Apple, Polar, Huawei) para extraer métricas automáticamente.
   - Ajuste dinámico del plan semanal con Gemini API o mediante modo Copiar/Pegar Prompt.
