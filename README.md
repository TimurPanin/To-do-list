# Todo List

A small **learning project** for practicing task-management UI and browser persistence.

The repository contains two stages of the project:

- a legacy vanilla HTML/CSS/JavaScript implementation in the repository root;
- a React 18 rewrite under `src/`.

The React version is the main development version. The older static implementation is kept as part of the project's learning history and for the original GitHub Pages demo.

## Implemented features

- Add tasks
- Mark tasks as completed
- Edit task text
- Delete individual tasks
- Clear all tasks
- Completion counter and progress bar
- Browser persistence with `localStorage`
- Responsive styling
- Lucide icons in the React version

## Tech stack

### React version

- **React 18**
- **JavaScript / JSX**
- **Create React App / react-scripts**
- **CSS**
- **Lucide React**
- **localStorage**

### Legacy version

- HTML
- CSS
- Vanilla JavaScript

## Project structure

```text
src/                 React application source
public/              React public assets
index.html            Legacy static entry point
css/                  Legacy styles
js/                   Legacy JavaScript
media/                Legacy responsive styles
```

## Run the React version locally

### Requirements

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Development server

```bash
npm start
```

### Production build

```bash
npm run build
```

## Scope

This repository is intentionally presented as a compact learning project rather than a production task-management application. Its purpose is to demonstrate basic React state handling, CRUD-style UI interactions, local persistence and responsive frontend styling.
