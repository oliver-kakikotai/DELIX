# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Runaway Rabbit IP showcase website** - a trilingual (English/Chinese/Japanese) portfolio site for an original character IP. Built with Next.js 15 + TypeScript, featuring space-themed visuals, 3D animations with Three.js, and comprehensive internationalization.

## Development Commands

```bash
# Development server with Turbopack (faster builds)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Type checking
npx tsc --noEmit
```

**Development URL:** http://localhost:3000

## Architecture & Key Concepts

### App Router Structure
- Uses Next.js App Router (not Pages Router)
- Root layout in `app/layout.tsx` with comprehensive SEO metadata
- Main page in `app/page.tsx` with elaborate space/galaxy background

### Internationalization System
- **Core:** `contexts/LanguageContext.tsx` - comprehensive i18n system
- **Languages:** English (`en`), Chinese Simplified (`zh`), Japanese (`ja`)
- **Storage:** Client-side language persistence via localStorage
- **Usage:** Import `useLanguage()` hook, access translations via `t` object
- **40+ translation keys** covering all UI elements

### Component Architecture

**Main Layout Components:**
- `CompactLayout.tsx` - Primary layout orchestrating all content sections
- `MainContentCard.tsx` - Hero section with character introduction
- `CharacterCard.tsx` - Character showcase component

**Interactive Components:**
- `RotatingPlanet.tsx` - Three.js 3D planet animation
- `CubeFlipSection.tsx` - 3D cube interactions
- `SpaceInteractionSection.tsx` - Space-themed interactions

**UI Components:**
- `Navigation.tsx` - Fixed nav with language switcher
- `LanguageSwitcher.tsx` - Language selection dropdown
- `Footer.tsx`, `CookieNotice.tsx`, `StatsCard.tsx`

### Styling & Visual Theme
- **Primary:** Tailwind CSS 4.x with PostCSS
- **Theme:** Space/galaxy aesthetic with purple cosmic colors
- **Animations:** Extensive CSS animations and 3D graphics
- **Fonts:** Geist Sans & Geist Mono optimized via Next.js
- **Responsive:** Mobile-first design approach

### Asset Management
- **Images:** Located in `public/images/` (18 character artwork files)
- **Format:** PNG/JPG character illustrations and artwork
- **Naming:** IMG_XXXX format from original photo imports

## Technology Stack

- **Framework:** Next.js 15.3.3 with App Router
- **Language:** TypeScript 5.x with strict mode
- **Styling:** Tailwind CSS 4.x
- **3D Graphics:** Three.js 0.178.x
- **Fonts:** Next.js font optimization (Geist family)
- **Build Tool:** Turbopack for development

## Development Guidelines

### TypeScript Configuration
- Strict mode enabled with comprehensive type checking
- Path alias `@/*` maps to root directory
- ES2017 target with ESNext modules

### Component Patterns
- All components use TypeScript with proper type definitions
- Client components marked with `'use client'` directive
- Internationalization via `useLanguage()` hook
- State management through React hooks and context

### File Structure Conventions
- Components in `/components/` directory
- Contexts in `/contexts/` directory  
- Static assets in `/public/images/`
- Global styles in `app/globals.css`

### SEO & Metadata
- Comprehensive multilingual metadata in `app/layout.tsx`
- OpenGraph and Twitter card optimization
- Language-specific alternate links for SEO
- Character IP focused keywords and descriptions