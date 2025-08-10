# جيش المفديين - Copilot Instructions

## 🏗️ Project Overview
This is "Gaish Elmafdein" (Army of the Redeemed) - an innovative Orthodox digital cathedral combining faith, AI, and art. The project is built with Next.js 14 and features a sacred Orthodox aesthetic with interactive elements.

## 🎯 Current Architecture
- **Frontend**: Next.js 14 with App Router (TypeScript)
- **Styling**: Tailwind CSS + Framer Motion animations + next-themes
- **UI Components**: Custom Orthodox-themed components
- **Internationalization**: RTL support for Arabic, LTR for English
- **Fonts**: Cairo + Lemonada (Arabic), Playfair Display (English)

## 🛕 Key Features Implemented
1. **Sacred Background**: Interactive particle system with Orthodox symbols (crosses, stars)
2. **Orthodox Cross Component**: Animated, glowing cross with divine light rays
3. **Hero Section**: Multilingual welcome with sacred search functionality
4. **Theme System**: Dark/light mode with Orthodox color palette
5. **Toast Notifications**: Sacred-themed user feedback system

## 📁 Project Structure
```
gaish-elmafdein-nextjs/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Main layout with RTL/fonts
│   │   ├── page.tsx          # Hero section homepage
│   │   └── globals.css       # Sacred CSS styles
│   └── components/
│       ├── providers/
│       │   └── theme-provider.tsx  # Dark/light theme management
│       └── ui/
│           ├── orthodox-cross.tsx   # Animated sacred cross
│           └── sacred-background.tsx # Interactive particle system
├── tailwind.config.ts        # Sacred color palette & animations
└── package.json
```

## 🎨 Sacred Design System
- **Colors**: 
  - Gold (#f1c40f) - Divine light, sacred elements
  - Midnight Blue (#243b53) - Deep contemplation, background
  - Flame Red (#dc2626) - Holy fire, call-to-action elements
- **Typography**: RTL-aware with context switching
- **Animations**: Floating, glowing, rotating effects for sacred atmosphere

## 🔄 Development Workflow
- Use `npm run dev` for development server (http://localhost:3000)
- Components are built with Framer Motion for sacred animations
- All text supports RTL/LTR automatic switching
- Color classes follow pattern: `gold-500`, `midnight-800`, `flame-600`

## 🌍 Internationalization Patterns
- `dir="rtl"` for Arabic content, automatic LTR for English
- Font variables: `--font-cairo`, `--font-lemonada`, `--font-playfair`
- Text classes: `font-arabic`, `font-english`, `font-display`

## 🧠 AI Integration Goals (To Implement)
- RAG system with Orthodox theological embeddings
- Bilingual AI responses (Classical Arabic/Egyptian dialect)
- Citation system linking to St-Takla.org and Dr. Ghaly resources
- Voice synthesis for radio AI responses

## � Interactive Features (Current)
- **Amen Counter**: Community engagement with toast feedback
- **Sacred Search**: GPT-powered theological query interface
- **Holy War Button**: Flame animation with sacred notifications
- **Floating Navigation**: Sacred journey pathway selection

## � Technical Considerations
- All animations use Framer Motion for performance
- Backdrop blur effects for sacred depth
- CSS custom properties for theme consistency
- TypeScript strict mode for code reliability

## 🚀 Next Development Priorities
1. **Defense Bot Page**: Theological Q&A with citation system
2. **Radio Streaming**: Live RTMP integration with AI voice
3. **Digital Library**: PDF viewer with search functionality
4. **Live Debates**: Real-time theological analysis
5. **PWA Support**: Offline functionality for spiritual content

## 🎨 Component Patterns
- Use `motion.div` for animated containers
- Sacred buttons: `btn-sacred` or `btn-sacred-outline` classes
- Cross component: `<OrthodoxCross size="xl" animated glowing />`
- Background: `<SacredBackground />` for particle effects

## � Development Notes
- Always include `'use client'` for interactive components
- Use semantic HTML with proper ARIA labels
- Implement proper TypeScript types for props
- Follow Orthodox theological accuracy in content

When implementing new features, maintain the sacred aesthetic while ensuring modern web standards and accessibility.
