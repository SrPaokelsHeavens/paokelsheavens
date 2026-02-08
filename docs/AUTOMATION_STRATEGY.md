# Estrategia de Automatización y APIs

Este documento detalla cómo mantendremos la web actualizada sin costos operativos.

## 1. Fuentes de Datos (The Nexus)

### A. YouTube API (Directa)
- **Uso:** Traer los últimos videos o streams.
- **Costo:** Gratuito (dentro de la cuota diaria).

### B. Discord Hub (El Puente)
Para evitar la burocracia de las APIs oficiales de Meta y TikTok:
- Usaremos el servidor de Discord como "Base de Datos de Tránsito".
- El Bot de la Secta (Gemini 3 Flash) monitoreará canales específicos.
- Cuando se detecte un link de TikTok/FB en esos canales, se extraerá el metadato para el Event Stream de la web.

### C. GitHub Actions (El Motor)
- Se configurará un "Cron Job" que se ejecute cada 12 horas.
- Este proceso reconstruirá la web, integrando las nuevas noticias, capítulos y eventos sociales detectados.

## 2. Gestión de Credenciales
- Todas las API Keys se almacenarán en **GitHub Secrets**.
- Nunca se expondrán en el código fuente (Seguridad de Nivel Ancestral).

## 3. Flujo de Publicación de Capítulos
1. Subida de archivo `.md` a `src/content/chapters/`.
2. GitHub Action detecta el cambio.
3. El Bot de Discord anuncia el capítulo con un resumen de IA.
4. La web se actualiza con el nuevo contenido.
