# Guía de Uso de Iconos Dinámicos

Los iconos de servicios ahora aceptan colores dinámicos de **dos formas**:

## 📌 Opción 1: Usando clases de Tailwind CSS (Recomendado)

Es la forma más simple y aprovecha el sistema de diseño:

```jsx
import StarsIcon from '../../assets/icons/starsIcon';

// Color de la paleta del proyecto
<StarsIcon className="w-8 h-8 text-primary" />
<StarsIcon className="w-8 h-8 text-primary-dark" />

// Colores de Tailwind
<StarsIcon className="w-8 h-8 text-red-500" />
<StarsIcon className="w-8 h-8 text-blue-600" />
<StarsIcon className="w-8 h-8 text-green-500" />

// Color personalizado (cualquier código hex)
<StarsIcon className="w-8 h-8 text-[#FF5733]" />
<StarsIcon className="w-8 h-8 text-[#9C27B0]" />
```

---

## 📌 Opción 2: Usando la prop `color` directa

Para colores más dinámicos desde JavaScript:

```jsx
import StarsIcon from '../../assets/icons/starsIcon';
import DimondIcon from '../../assets/icons/dimondIcon';

// Color directo
<StarsIcon className="w-8 h-8" color="#D4B896" />
<DimondIcon className="w-8 h-8" color="#B8956A" />

// Color desde variable
const miColor = "#FF5733";
<StarsIcon className="w-8 h-8" color={miColor} />

// Color condicional
const activo = true;
<StarsIcon 
  className="w-8 h-8" 
  color={activo ? "#D4B896" : "#999999"} 
/>

// Color desde props
const ServicioCard = ({ iconColor }) => (
  <StarsIcon className="w-8 h-8" color={iconColor} />
);
```

---

## 🎨 Ejemplos Prácticos

### Ejemplo 1: Servicios con diferentes colores

```jsx
<div className="grid grid-cols-3 gap-8">
  {/* Servicio 1 - Dorado */}
  <div>
    <StarsIcon className="w-8 h-8 text-primary" />
    <h3>Manicure Premium</h3>
  </div>

  {/* Servicio 2 - Rojo */}
  <div>
    <NailIcon className="w-8 h-8 text-red-500" />
    <h3>Nail Art</h3>
  </div>

  {/* Servicio 3 - Morado */}
  <div>
    <DimondIcon className="w-8 h-8 text-purple-600" />
    <h3>Pedicure Luxury</h3>
  </div>
</div>
```

### Ejemplo 2: Colores desde un array

```jsx
const servicios = [
  { 
    icono: <StarsIcon className="w-8 h-8" color="#D4B896" />,
    nombre: "Manicure Premium" 
  },
  { 
    icono: <NailIcon className="w-8 h-8" color="#FF6B9D" />,
    nombre: "Nail Art" 
  },
  { 
    icono: <DimondIcon className="w-8 h-8" color="#9C27B0" />,
    nombre: "Pedicure Luxury" 
  }
];

servicios.map((servicio) => (
  <div key={servicio.nombre}>
    {servicio.icono}
    <h3>{servicio.nombre}</h3>
  </div>
));
```

### Ejemplo 3: Hover con cambio de color

```jsx
<div className="group">
  <StarsIcon 
    className="w-8 h-8 text-primary group-hover:text-primary-dark transition-colors" 
  />
  <h3>Manicure Premium</h3>
</div>
```

---

## 🎨 Paleta de Colores del Proyecto

Usa estos colores para mantener consistencia:

```javascript
// Colores principales
text-primary         // #D4B896 (Dorado principal)
text-primary-light   // #E5D4BD (Dorado claro)
text-primary-dark    // #B8956A (Dorado oscuro)

// Colores de texto
text-text-dark       // #2D2D2D (Texto oscuro)
text-text-light      // #666666 (Texto claro)

// Colores neutros
text-neutral-light   // #F5F5F5
text-neutral-gray    // #E5E5E5
text-neutral-dark    // #4A4A4A
```

---

## ⚙️ Configuración Actual en Welcome.jsx

```jsx
// Servicio 1 - Manicure Premium
<StarsIcon className="w-8 h-8 text-primary" />

// Servicio 2 - Nail Art (puedes agregar)
<NailIcon className="w-8 h-8 text-primary" />

// Servicio 3 - Pedicure Luxury
<DimondIcon className="w-8 h-8 text-primary" />
```

---

## 💡 Tips

1. **Usa `text-*` cuando quieras aprovechar Tailwind** (hover, responsive, etc.)
2. **Usa `color=` cuando necesites colores dinámicos desde JS**
3. Si no pasas ni `className` con color ni `color`, usa `currentColor` (hereda del padre)
4. Puedes combinar ambos: `className` para tamaño y `color` para el color

---

## 🔄 Si quieres cambiar los colores ahora:

Edita `/src/modules/home/welcome.jsx` líneas 142, 156 y 170 aproximadamente:

```jsx
// De esto:
<StarsIcon className="w-8 h-8 text-primary" />

// A esto (por ejemplo, color rojo):
<StarsIcon className="w-8 h-8 text-red-500" />

// O con color directo:
<StarsIcon className="w-8 h-8" color="#FF5733" />
```
