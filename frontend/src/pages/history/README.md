# History Advanced - Componentes Refactorizados

Este directorio contiene la versión refactorizada del componente `HistoryAdvanced.jsx`, dividido en una arquitectura modular y mantenible.

## 📁 Estructura del Proyecto

```
frontend/src/pages/history/
├── components/           # Componentes UI reutilizables
│   ├── BatchActionsPanel.jsx
│   ├── CalculationCard.jsx
│   ├── CalculationsList.jsx
│   ├── CreateFolderModal.jsx
│   ├── CreateTagModal.jsx
│   ├── FilterPanel.jsx
│   ├── FolderExplorer.jsx
│   ├── HistoryHeader.jsx
│   ├── MoveCalculationModal.jsx
│   ├── SearchAndFilters.jsx
│   └── index.js         # Exports centralizados
├── hooks/               # Hooks personalizados
│   ├── useCalculationActions.js
│   ├── useDragAndDrop.js
│   ├── useFoldersAndTags.js
│   ├── useHistoryData.js
│   ├── useHistoryFilters.js
│   └── index.js         # Exports centralizados
├── utils/               # Utilidades y helpers
│   ├── folderTree.js
│   ├── formatters.js
│   └── index.js         # Exports centralizados
└── README.md           # Documentación
```

## 🔧 Hooks Personalizados

### `useHistoryData`
- **Propósito:** Gestión de datos principales (cálculos, carpetas, etiquetas)
- **Responsabilidades:**
  - Cargar datos iniciales
  - Sincronización con el servicio
  - Gestión de estados de carpetas específicas
  - Funciones de refresco y navegación

### `useHistoryFilters`
- **Propósito:** Gestión de filtros y búsqueda
- **Responsabilidades:**
  - Estados de filtros avanzados
  - Búsqueda en tiempo real con debounce
  - Aplicación y reseteo de filtros

### `useDragAndDrop`
- **Propósito:** Funcionalidad de arrastrar y soltar
- **Responsabilidades:**
  - Estados de drag & drop
  - Handlers de eventos de arrastre
  - Lógica de movimiento de cálculos

### `useCalculationActions`
- **Propósito:** Acciones sobre cálculos individuales y en lote
- **Responsabilidades:**
  - CRUD de cálculos (editar, duplicar, eliminar)
  - Selección múltiple
  - Acciones en lote
  - Navegación a calculadora

### `useFoldersAndTags`
- **Propósito:** Gestión de carpetas y etiquetas
- **Responsabilidades:**
  - CRUD de carpetas y etiquetas
  - Estados de modales
  - Edición inline
  - Movimiento de cálculos

## 🧩 Componentes

### Componentes de Layout
- **`HistoryHeader`:** Header principal con navegación y dropdown de usuario
- **`SearchAndFilters`:** Barra de búsqueda y controles de filtros
- **`FilterPanel`:** Panel expandible con filtros avanzados

### Componentes de Contenido
- **`FolderExplorer`:** Explorador de carpetas con estructura jerárquica
- **`CalculationsList`:** Lista grid de cálculos con estados de carga
- **`CalculationCard`:** Card individual de cálculo (memoized)
- **`BatchActionsPanel`:** Panel de acciones en lote

### Componentes Modales
- **`CreateTagModal`:** Modal para crear nuevas etiquetas
- **`CreateFolderModal`:** Modal para crear nuevas carpetas
- **`MoveCalculationModal`:** Modal para mover cálculos entre carpetas

## 🛠️ Utilidades

### `formatters.js`
- `formatCurrency()` - Formateo de moneda colombiana
- `formatDate()` - Formateo de fechas localizadas
- `getCapitalFromFormData()` - Extracción de capital de datos JSON

### `folderTree.js`
- `buildFolderTree()` - Construcción de jerarquía de carpetas

## ⚡ Optimizaciones de Performance

### Memoización
- Todos los componentes UI utilizan `React.memo()`
- Componentes costosos como `CalculationCard` están optimizados
- Prevención de re-renders innecesarios

### Separación de Responsabilidades
- Lógica de estado separada en hooks
- Componentes puros y reutilizables
- Estados localizados donde corresponde

### Lazy Loading
- Skeleton loaders para estados de carga
- Componentes condicionales para modales
- Renderizado optimizado de listas grandes

## 📈 Beneficios del Refactor

### Mantenibilidad
- ✅ Componentes pequeños y enfocados
- ✅ Lógica de negocio separada
- ✅ Fácil testing individual
- ✅ Reutilización de código

### Performance
- ✅ Menor cantidad de re-renders
- ✅ Memoización estratégica
- ✅ Estados localizados
- ✅ Componentes optimizados

### Escalabilidad
- ✅ Estructura modular
- ✅ Hooks reutilizables
- ✅ Fácil adición de features
- ✅ Principios SOLID aplicados

### Developer Experience
- ✅ Imports organizados
- ✅ Código autodocumentado
- ✅ Debugging simplificado
- ✅ Hot reload optimizado

## 🔄 Migración

### Reemplazar el componente original:

```jsx
// Antes
import HistoryAdvanced from './pages/HistoryAdvanced'

// Después  
import HistoryAdvancedFinal from './pages/HistoryAdvancedFinal'
```

### Compatibilidad
- ✅ Misma funcionalidad que el original
- ✅ Misma interfaz de usuario
- ✅ Mismos props y comportamiento
- ✅ No breaking changes

## 📝 Convenciones de Código

- **Naming:** PascalCase para componentes, camelCase para hooks
- **Structure:** Un hook/componente por archivo
- **Exports:** Exports nombrados con índices centralizados
- **Performance:** React.memo para componentes costosos
- **State:** Estados localizados en el hook correspondiente

## 🧪 Testing

Cada hook y componente está diseñado para ser testeable individualmente:

```jsx
// Ejemplo de test para hook
import { renderHook } from '@testing-library/react'
import { useHistoryData } from '../hooks/useHistoryData'

test('should load initial data', () => {
  const { result } = renderHook(() => useHistoryData(mockUser, mockUserId))
  // assertions
})
```

---

*Esta refactorización mejora significativamente la mantenibilidad, performance y escalabilidad del componente HistoryAdvanced manteniendo toda su funcionalidad original.*
