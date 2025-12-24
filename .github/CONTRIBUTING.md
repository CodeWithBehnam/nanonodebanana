# Contributing to NanoNodeBanana

Thank you for your interest in contributing to NanoNodeBanana! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates. When creating a bug report, include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, browser, Node/Bun version)

### Suggesting Features

Feature requests are welcome! Please:

- Check existing issues and discussions first
- Provide a clear description of the feature
- Explain the use case and benefits
- Include mockups or examples if possible

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the branching convention**:
   - `feature/<name>` - New features
   - `fix/<name>` - Bug fixes
   - `docs/<name>` - Documentation updates
   - `refactor/<name>` - Code refactoring
   - `test/<name>` - Test additions

3. **Set up the development environment**:
   ```bash
   # Clone your fork
   git clone https://github.com/YOUR_USERNAME/nanonodebanana.git
   cd nanonodebanana

   # Install dependencies
   bun install

   # Set up environment variables
   cp .env.example .env
   # Add your API keys to .env

   # Run development servers
   bun run dev
   ```

4. **Make your changes**:
   - Write clear, readable code
   - Follow existing code style and patterns
   - Add comments for complex logic
   - Update documentation if needed

5. **Test your changes**:
   ```bash
   # Type checking
   bun run typecheck

   # Linting
   bun run lint

   # Build
   bun run build
   ```

6. **Commit your changes**:
   - Use conventional commit messages:
     - `feat:` - New feature
     - `fix:` - Bug fix
     - `docs:` - Documentation only
     - `refactor:` - Code refactoring
     - `test:` - Test additions
     - `chore:` - Maintenance tasks
   - Example: `feat: add batch processing to Gemini node`

7. **Push and create a Pull Request**:
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a PR on GitHub with a clear description.

## Development Guidelines

### Project Structure

```
nanonodebanana/
├── src/
│   ├── nodes/           # LiteGraph node definitions
│   │   ├── base/        # BaseNode factory
│   │   ├── input/       # Input nodes
│   │   ├── processing/  # Processing nodes
│   │   ├── generation/  # AI generation nodes
│   │   └── output/      # Output nodes
│   ├── components/      # React components
│   ├── context/         # React contexts
│   ├── lib/             # Utilities and API client
│   └── types/           # TypeScript types
├── server/
│   ├── routes/          # API routes
│   ├── services/        # AI service integrations
│   └── db/              # Database schema
└── .github/             # GitHub templates and workflows
```

### Adding a New Node

1. Create the node file in the appropriate category folder
2. Use the `createNodeClass()` factory from `base/BaseNode.ts`
3. Register the node in `src/nodes/index.ts`
4. Add to `src/components/NodePanel.tsx` for the UI
5. If needed, add backend service in `server/services/`

Example node structure:
```typescript
import { createNodeClass, getInputValue } from '../base/BaseNode'
import { NODE_TYPE_COLOURS } from '../../types/nodes'

export const MyNewNode = createNodeClass(
  {
    title: 'My New Node',
    category: 'processing',
    colour: NODE_TYPE_COLOURS.myNode,
    inputs: [{ name: 'input', type: 'string' }],
    outputs: [{ name: 'output', type: 'string' }],
    widgets: [],
  },
  async (node) => {
    const input = getInputValue<string>(node, 'input')
    // Processing logic
    return { output: result }
  }
)
```

### Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for public APIs

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>: <description>

[optional body]

[optional footer]
```

## Getting Help

- Open an issue for bugs or feature requests
- Check existing documentation in the README
- Review the codebase for examples

## Recognition

Contributors will be recognized in the project. Thank you for helping make NanoNodeBanana better!
