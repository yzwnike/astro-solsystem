# 🏗️ Arquitectura de Componentes - SolSystems

## 📁 Estructura de Carpetas

```
src/
├── components/
│   ├── layout/          # Componentes de estructura general
│   │   └── Header.astro
│   ├── sections/        # Secciones completas de páginas
│   │   ├── HeroSection.astro
│   │   ├── IntroSection.astro
│   │   └── ServicesSection.astro
│   ├── ui/             # Componentes UI reutilizables
│   │   ├── Button.astro
│   │   └── ServiceCard.astro
│   └── forms/          # Componentes de formularios (futuro)
├── layouts/
│   ├── Layout.astro           # Layout original
│   └── BaseLayout.astro       # Nuevo layout base mejorado
├── pages/
│   ├── index.astro           # Página original
│   ├── legalizacion.astro    # Página original monolítica
│   └── legalizacion-new.astro # Nueva página componentizada
├── scripts/                  # JavaScript modular (futuro)
└── styles/
    ├── components/          # Estilos específicos por componente
    └── legalizacion.css    # CSS existente
```

## 🧩 Componentes Principales

### 🎨 Layout
- **BaseLayout.astro**: Layout base con sistema de animaciones integrado
- **Header.astro**: Componente de navegación reutilizable

### 📋 Sections (Secciones)
- **HeroSection.astro**: Sección hero personalizable
- **IntroSection.astro**: Sección de introducción con animaciones
- **ServicesSection.astro**: Grid de servicios usando ServiceCard

### 🔧 UI Components
- **Button.astro**: Botones reutilizables con múltiples variantes
- **ServiceCard.astro**: Cards de servicios con características y highlights

## 🚀 Ventajas de la Nueva Arquitectura

### ✅ Mantenibilidad
- **Componentes reutilizables**: Un cambio se refleja en toda la aplicación
- **Separación de responsabilidades**: Cada componente tiene un propósito específico
- **Código DRY**: No repetir código, todo centralizado

### ✅ Escalabilidad
- **Fácil expansión**: Agregar nuevas páginas es más rápido
- **Consistencia**: Mismo diseño en toda la aplicación
- **Testing**: Cada componente se puede testear independientemente

### ✅ Performance
- **Scripts centralizados**: Sistema de animaciones unificado
- **CSS optimizado**: Estilos organizados y modularizables
- **Lazy loading**: Componentes se cargan solo cuando se necesitan

## 📝 Cómo usar los Componentes

### Ejemplo: Crear una nueva página
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/layout/Header.astro';
import HeroSection from '../components/sections/HeroSection.astro';
import Button from '../components/ui/Button.astro';
---

<BaseLayout 
  title="Mi Nueva Página"
  includeLegalizationCSS={true}
>
  <Header transparent={true} />
  
  <HeroSection 
    title="Mi título personalizado"
    subtitle="Mi subtítulo aquí"
    ctaText="Mi botón"
  />
  
  <section>
    <Button 
      variant="primary" 
      href="/contacto"
    >
      Contactar Ahora
    </Button>
  </section>
</BaseLayout>
```

### Props de los Componentes

#### HeroSection
```typescript
{
  title: string;           // Título principal
  subtitle: string;        // Subtítulo
  ctaText?: string;        // Texto del botón (opcional)
  ctaAction?: string;      // Acción del botón (opcional)
  showIcons?: boolean;     // Mostrar iconos (opcional)
  backgroundImage?: string; // Imagen de fondo (opcional)
}
```

#### Button
```typescript
{
  variant?: 'primary' | 'secondary' | 'hero' | 'header';
  size?: 'sm' | 'md' | 'lg';
  href?: string;           // Para enlaces
  onclick?: string;        // Para acciones JavaScript
  className?: string;      // Clases CSS adicionales
  disabled?: boolean;      // Estado deshabilitado
}
```

#### ServiceCard
```typescript
{
  icon: string;            // Icono de Material Icons
  title: string;           // Título del servicio
  description: string;     // Descripción principal
  details?: string;        // Detalles adicionales (opcional)
  features: ServiceFeature[]; // Array de características
  highlight?: string;      // Texto destacado (opcional)
  additionalClasses?: string; // Clases CSS extra (opcional)
}
```

## 🎯 Sistema de Animaciones

### Características
- **Intersection Observer**: Detecta elementos al hacer scroll
- **Animaciones fluidas**: Transiciones suaves y profesionales
- **Responsivo**: Se adapta a diferentes tamaños de pantalla
- **Accesible**: Respeta `prefers-reduced-motion`

### Animaciones Implementadas
1. **Intro Section**: Animación word-by-word + icono rebote
2. **Service Cards**: Aparición progresiva al hacer scroll
3. **Hero Title**: Gradiente animado automático
4. **Hover Effects**: Efectos de hover mejorados

## 📋 Próximos Pasos

### 🔄 Refactorizaciones Pendientes
1. **Proceso Section** → ProcesoSection.astro
2. **Why Choose Section** → WhyChooseSection.astro  
3. **Footer** → Footer.astro
4. **WhatsApp Button** → WhatsAppButton.astro

### 🆕 Nuevos Componentes
1. **ContactForm.astro** - Formulario de contacto reutilizable
2. **ReasonCard.astro** - Cards para "Por qué elegir"
3. **ProcesoStep.astro** - Pasos del proceso
4. **IconBox.astro** - Caja de iconos genérica

### 🎨 Mejoras de Estilos
1. **Tokens de diseño**: Variables CSS centralizadas
2. **Theme system**: Soporte para múltiples temas
3. **Component styles**: CSS modular por componente

## 🚀 Comandos Útiles

```bash
# Desarrollar
npm run dev

# Construir
npm run build

# Preview
npm run preview
```

## 📖 Comparación: Antes vs Ahora

### ❌ Antes (Monolítico)
- Un archivo de 700+ líneas
- HTML y CSS mezclados
- JavaScript inline repetido
- Difícil mantenimiento
- No reutilizable

### ✅ Ahora (Componentizado)
- Componentes específicos y pequeños
- Separación clara de responsabilidades
- Sistema de animaciones centralizado  
- Fácil mantenimiento y expansión
- Totalmente reutilizable

---

**✨ Resultado**: Código más limpio, mantenible y escalable que facilita el desarrollo futuro.
