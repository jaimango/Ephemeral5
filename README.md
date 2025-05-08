# Minimalist Todo List App

A minimalist todo list application built with React, TypeScript, and TailwindCSS. The app features a clean, mobile-first design with automatic task expiration and task management capabilities.

## Features

- Add tasks by clicking [+] button or pressing Enter
- Each task shows:
  - Title
  - Reset Timer button (⟳)
  - Delete button (🗑️)
  - Recurrence icon (🔁) if recurring
- Tasks automatically expire after 24 hours
- Mark tasks as Completed by clicking on them
- Completed tasks move to Completed pane with timestamp
- Expired tasks move to Expired pane with timestamp
- Expired tasks can be Re-added to Active pane
- Basic navigation tabs: [Active] [Completed] [Expired]

## Technical Stack

- React 18
- TypeScript
- TailwindCSS v4
- Vite
- LocalStorage for data persistence

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
  ├── components/
  │   └── TodoItem.tsx    # Individual todo item component
  ├── types/
  │   └── todo.ts         # TypeScript type definitions
  ├── App.tsx             # Main application component
  └── index.css           # Global styles and Tailwind imports
```

## Patterns and Technologies

- Functional Components with Hooks
- TypeScript for type safety
- TailwindCSS for styling
- LocalStorage for data persistence
- Mobile-first responsive design
- Component-based architecture
