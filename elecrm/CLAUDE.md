# ELECRM Development Guide

## Commands
- **Start Development**: `npm run dev` (runs client and server concurrently)
- **Start Client**: `npm run client:local` 
- **Start Server**: `npm run server`
- **Build Client**: `npm run build`
- **Build Server**: `npm run build --prefix "Server Side"`
- **Lint Server**: `npm run lint --prefix "Server Side"`
- **Lint Check**: `npm run lint:check --prefix "Server Side"`
- **Start Electron**: `npm run electron:dev`
- **Build Electron**: `npm run electron:build`
- **Start Softphone**: `npm run softphone`

## Code Style Guidelines
- **Naming**: PascalCase for components/classes, camelCase for variables/functions
- **File Structure**: Components in PascalCase, services with .service.ts suffix
- **Types**: Use strict TypeScript typing, define interfaces for all props
- **Error Handling**: Try/catch for async, Logger.error() for server errors
- **Formatting**: 2-space indentation, consistent braces (same line)
- **Imports**: Group by external/internal, alphabetize within groups
- **State Management**: Use React context providers for global state
- **API Calls**: Use service classes, handle errors consistently
- **Comments**: Use JSDoc for important functions, section headers with comment blocks