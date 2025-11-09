# Contributing to WCAGAI v4.0

Thank you for your interest in contributing to WCAGAI! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior**
- **Actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- **Clear title and description**
- **Use case** - why is this enhancement useful?
- **Possible implementation** if you have ideas

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass (`npm test`)
6. Commit your changes (see commit guidelines below)
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Redis server (or Docker)
- Git

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/wcagai-v4-reality-check.git
cd wcagai-v4-reality-check

# Install dependencies
PUPPETEER_SKIP_DOWNLOAD=true npm install

# Copy environment file
cp .env.example .env

# Start Redis (with Docker)
docker run -d -p 6379:6379 redis:alpine

# Run tests
npm test

# Start development server
npm run dev
```

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run tests in Docker
docker-compose run app npm test
```

## Pull Request Process

1. **Update documentation** - If you change APIs, update the README
2. **Add tests** - Ensure test coverage remains above 50%
3. **Follow code style** - Run `npm run lint` and `npm run format`
4. **Update CHANGELOG.md** - Add your changes under "Unreleased"
5. **Request review** - At least one maintainer must approve
6. **CI must pass** - All GitHub Actions checks must be green

### PR Checklist

- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Code follows style guidelines
- [ ] No merge conflicts
- [ ] CI checks passing

## Coding Standards

### JavaScript Style

We use ESLint and Prettier for code formatting:

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint -- --fix

# Format code with Prettier
npm run format
```

### Code Guidelines

- Use **async/await** over callbacks
- Add **JSDoc comments** for public APIs
- Keep functions **small and focused** (< 50 lines)
- Use **descriptive variable names**
- Handle errors gracefully with **try-catch**
- Log important events with **Winston**

### Example

```javascript
/**
 * Scans a URL for WCAG compliance
 * @param {string} url - The URL to scan
 * @param {Object} options - Scan options
 * @returns {Promise<Object>} Scan results
 */
async function scan(url, options = {}) {
  try {
    // Implementation
  } catch (error) {
    logger.error(`Scan failed for ${url}:`, error);
    throw error;
  }
}
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, build, etc.)

### Examples

```
feat(scanner): add support for WCAG 2.2 Level AAA

Added Axe-core rules for WCAG 2.2 AAA compliance scanning.

Closes #42
```

```
fix(cache): handle Redis connection timeout gracefully

Redis connection now retries with exponential backoff instead
of crashing the application.

Fixes #38
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Writing Tests

- Place unit tests in `tests/unit/`
- Place integration tests in `tests/integration/`
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```javascript
describe('Scanner Service', () => {
  it('should return compliance score between 0 and 100', async () => {
    // Arrange
    const url = 'https://example.com';

    // Act
    const result = await scannerService.scan(url);

    // Assert
    expect(result.complianceScore).toBeGreaterThanOrEqual(0);
    expect(result.complianceScore).toBeLessThanOrEqual(100);
  });
});
```

## Documentation

- Update **README.md** for user-facing changes
- Update **API documentation** for endpoint changes
- Add **JSDoc comments** for new functions
- Update **CHANGELOG.md** for all changes

## Questions?

- Open an [issue](https://github.com/aaj441/wcagai-v4-reality-check/issues)
- Ask in [discussions](https://github.com/aaj441/wcagai-v4-reality-check/discussions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to WCAGAI! 🎉
