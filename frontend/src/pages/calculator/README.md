# Calculator - Componentes Refactorizados

Este directorio contiene la versión refactorizada del componente `Calculator.jsx`, dividido en una arquitectura modular y mantenible.

## 📁 Estructura del Proyecto

```
frontend/src/pages/calculator/
├── components/           # Componentes UI reutilizables
│   ├── DatePicker.jsx
│   ├── CalculatorHeader.jsx
│   ├── CalculatorForm.jsx
│   ├── CalculatorActions.jsx
│   ├── CalculatorResults.jsx
│   ├── SaveCalculationModal.jsx
│   ├── TemplatesModal.jsx
│   ├── CreateTemplateModal.jsx
│   └── index.js         # Exports centralizados
├── hooks/               # Hooks personalizados
│   ├── useCalculatorForm.js
│   ├── useCalculatorResults.js
│   ├── useTemplates.js
│   ├── useSaveCalculation.js
│   ├── useSyncStatus.js
│   └── index.js         # Exports centralizados
├── utils/               # Utilidades y helpers
│   ├── dateUtils.js
│   ├── currencyUtils.js
│   ├── validationUtils.js
│   └── index.js         # Exports centralizados
└── README.md           # Documentación
```

## 🔧 Hooks Personalizados

### `useCalculatorForm`
- **Propósito:** Gestión del formulario de cálculo
- **Responsabilidades:**
  - Estados del formulario (fechas, capital, tasa)
  - Validación de campos
  - Formateo de moneda
  - Carga y guardado de datos del formulario
  - Funciones de limpieza y ejemplo

### `useCalculatorResults`
- **Propósito:** Gestión de resultados de cálculo
- **Responsabilidades:**
  - Estados de resultados y loading
  - Validación de reglas de negocio
  - Cálculo de intereses
  - Exportación a Excel
  - Manejo de errores

### `useTemplates`
- **Propósito:** Gestión de plantillas
- **Responsabilidades:**
  - CRUD de plantillas
  - Estados de modales
  - Uso y eliminación de plantillas
  - Plantillas públicas y privadas

### `useSaveCalculation`
- **Propósito:** Gestión de guardado de cálculos
- **Responsabilidades:**
  - Estados de diálogo de guardado
  - Generación de nombres por defecto
  - Guardado en historial
  - Validación de nombres

### `useSyncStatus`
- **Propósito:** Gestión del estado de sincronización
- **Responsabilidades:**
  - Monitoreo de conectividad
  - Estados de sincronización
  - Actualización automática
  - Eventos de online/offline

## 🧩 Componentes

### Componentes de Layout
- **`CalculatorHeader`:** Header principal con navegación y dropdown de usuario
- **`CalculatorForm`:** Formulario completo de entrada de datos
- **`CalculatorActions`:** Botones de acción y resumen de resultados

### Componentes de Contenido
- **`CalculatorResults`:** Tabla de resultados con períodos y totales
- **`DatePicker`:** Componente personalizado para selección de fechas

### Componentes Modales
- **`SaveCalculationModal`:** Modal para guardar cálculos
- **`TemplatesModal`:** Modal para gestionar plantillas
- **`CreateTemplateModal`:** Modal para crear nuevas plantillas

## 🛠️ Utilidades

### `dateUtils.js`
- `validateDate()` - Validación de formato de fecha
- `toIsoFromDisplay()` - Conversión de formato dd/mm/yyyy a ISO
- `fromIsoToDisplay()` - Conversión de ISO a dd/mm/yyyy
- `parseDate()` - Parsing de string a Date
- `formatDateForDisplay()` - Formateo de Date a string

### `currencyUtils.js`
- `formatCurrency()` - Formateo de moneda colombiana
- `formatCurrencyInput()` - Formateo para inputs de moneda
- `parseCurrencyInput()` - Parsing de input de moneda
- `formatCurrencyForDisplay()` - Formateo para display

### `validationUtils.js`
- `validateBusinessRules()` - Validación de reglas de negocio
- `validateFormFields()` - Validación de campos del formulario

## ⚡ Optimizaciones de Performance

### Memoización
- Todos los componentes UI utilizan `React.memo()`
- Componentes costosos como `CalculatorResults` están optimizados
- Prevención de re-renders innecesarios

### Separación de Responsabilidades
- Lógica de estado separada en hooks
- Componentes puros y reutilizables
- Estados localizados donde corresponde

### Lazy Loading
- Skeleton loaders para estados de carga
- Componentes condicionales para modales
- Renderizado optimizado de tablas grandes

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
import Calculator from './pages/Calculator'

// Después  
import CalculatorRefactored from './pages/CalculatorRefactored'
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
import { useCalculatorForm } from '../hooks/useCalculatorForm'

test('should load form data', () => {
  const { result } = renderHook(() => useCalculatorForm())
  // assertions
})
```

## 🎯 Funcionalidades Principales

### Cálculo de Intereses
- ✅ Validación de fechas y capital
- ✅ Cálculo por períodos mensuales
- ✅ Exportación a Excel
- ✅ Guardado en historial

### Plantillas
- ✅ Creación de plantillas personalizadas
- ✅ Plantillas públicas y privadas
- ✅ Uso y eliminación de plantillas
- ✅ Contador de usos

### Sincronización
- ✅ Estado de conectividad
- ✅ Sincronización automática
- ✅ Indicadores visuales
- ✅ Manejo de errores

---

*Esta refactorización mejora significativamente la mantenibilidad, performance y escalabilidad del componente Calculator manteniendo toda su funcionalidad original.*
