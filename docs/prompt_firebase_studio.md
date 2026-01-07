## Proyecto: Club 738 Web Portal - Frontend Facelift

### Contexto
Tengo una aplicación web React + Vite ya construida y funcional, desplegada en Firebase Hosting. Es el portal de un club de tiro deportivo en México (Club de Caza, Tiro y Pesca de Yucatán, A.C.).

**Repositorio GitHub:** https://github.com/smunozsader/club-738-app.git

**URL en producción:** https://club-738-app.web.app

### Stack Actual
- React 18 + Vite 5
- CSS colocalizados por componente (ComponentName.jsx + ComponentName.css)
- Firebase (Auth, Firestore, Storage, Hosting)
- 100% en español

### Lo que NECESITO (Facelift Visual)
Quiero un rediseño visual moderno del frontend SIN cambiar la funcionalidad. Específicamente:

1. **Landing Page (LandingPage.jsx)** - Página pública de inicio
   - Hero section más impactante
   - Tarjetas de features más modernas
   - Mejor tipografía y espaciado
   - Transiciones y micro-animaciones sutiles

2. **Dashboard del Socio** - Portal autenticado
   - Cards más elegantes para estadísticas
   - Mejor organización visual de información
   - Navegación más intuitiva

3. **Componentes comunes**
   - Botones más modernos
   - Formularios más pulidos
   - Modales más elegantes
   - Tablas más limpias

### Restricciones IMPORTANTES
- ⚠️ NO modificar la lógica de negocio ni funcionalidad
- ⚠️ NO cambiar la estructura de componentes React
- ⚠️ Mantener compatibilidad con Firebase
- ⚠️ Todo texto debe permanecer en ESPAÑOL
- ⚠️ NO usar emojis de armas (🔫🎯) - mantener imagen profesional
- ⚠️ Colores institucionales: Verde oscuro (#1a5f2a), Dorado, Blanco

### Estilo Deseado
- Profesional y sobrio (no infantil)
- Clean/minimal con espacios blancos
- Inspiración: dashboards modernos de SaaS
- Accesible (buen contraste, legible)
- Mobile-first / responsive

### Archivos Principales a Revisar
- src/components/LandingPage.jsx + .css
- src/components/Login.jsx + .css
- src/App.jsx + App.css
- src/components/documents/DocumentList.jsx + .css

### Entregables Esperados
Solo necesito cambios en archivos CSS y ajustes menores de estructura JSX para el nuevo diseño. La funcionalidad debe permanecer idéntica.

¿Puedes analizar mi código actual y proponerme un rediseño visual moderno?
