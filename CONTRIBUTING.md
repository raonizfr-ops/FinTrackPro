# Guia de Contribuição - FinTrackPro

Obrigado por se interessar em contribuir para o FinTrackPro! Este documento fornece diretrizes e instruções para contribuir com o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Processo de Pull Request](#processo-de-pull-request)
- [Padrões de Código](#padrões-de-código)
- [Commit Messages](#commit-messages)
- [Testes](#testes)
- [Documentação](#documentação)

## 🤝 Código de Conduta

Este projeto adota um Código de Conduta para garantir um ambiente acolhedor para todos. Esperamos que todos os contribuidores sigam estes princípios:

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros

## 🚀 Como Contribuir

### Reportar Bugs

Antes de criar um relatório de bug, verifique a lista de issues, pois você pode descobrir que o bug já foi relatado. Se você encontrar um bug, crie uma issue com as seguintes informações:

- **Título descritivo** - Use um título claro e descritivo
- **Descrição exata do problema** - Forneça exemplos específicos para demonstrar as etapas
- **Comportamento observado** - Descreva o comportamento observado
- **Comportamento esperado** - Descreva qual era o comportamento esperado
- **Screenshots/Logs** - Se possível, inclua screenshots ou logs relevantes
- **Ambiente** - Inclua seu SO, versão do Node.js, etc.

### Sugerir Melhorias

Sugestões de melhorias são bem-vindas! Ao criar uma issue de sugestão, inclua:

- **Título descritivo** - Use um título claro
- **Descrição detalhada** - Explique a melhoria sugerida em detalhes
- **Exemplos** - Forneça exemplos específicos para demonstrar a ideia
- **Caso de uso** - Explique por que essa melhoria seria útil

## 📝 Processo de Pull Request

1. **Fork o repositório** e crie sua branch a partir de `main`
   ```bash
   git checkout -b feature/AmazingFeature
   ```

2. **Faça suas mudanças** seguindo os padrões de código do projeto

3. **Escreva ou atualize testes** para suas mudanças

4. **Atualize a documentação** se necessário

5. **Faça commit das suas mudanças** com mensagens descritivas
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

6. **Push para a branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

7. **Abra um Pull Request** com uma descrição clara do que foi feito

### Checklist do Pull Request

Antes de submeter seu PR, verifique:

- [ ] Meu código segue os padrões de estilo do projeto
- [ ] Executei `pnpm lint` e corrigir erros
- [ ] Executei `pnpm test` e todos os testes passam
- [ ] Adicionei testes para novas funcionalidades
- [ ] Atualizei a documentação relevante
- [ ] Meus commits têm mensagens claras e descritivas
- [ ] Não há conflitos com a branch `main`

## 💻 Padrões de Código

### TypeScript

- Use tipos explícitos quando possível
- Evite `any` - use `unknown` se necessário
- Mantenha a coerência com o código existente

```typescript
// ✅ Bom
interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): Promise<User> {
  // ...
}

// ❌ Ruim
function getUser(id: any): any {
  // ...
}
```

### React

- Use functional components
- Use hooks ao invés de class components
- Mantenha componentes pequenos e focados

```typescript
// ✅ Bom
export function UserCard({ user }: { user: User }) {
  return (
    <div className="p-4 bg-card rounded-lg">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// ❌ Ruim
export class UserCard extends React.Component {
  // ...
}
```

### Tailwind CSS

- Use classes do Tailwind ao invés de CSS customizado quando possível
- Mantenha a consistência com o design system
- Use as variáveis CSS definidas em `index.css`

```tsx
// ✅ Bom
<div className="p-4 bg-card border border-border rounded-lg">
  <h2 className="text-lg font-semibold text-foreground">Título</h2>
</div>

// ❌ Ruim
<div style={{ padding: '16px', backgroundColor: '#fff' }}>
  <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Título</h2>
</div>
```

## 📌 Commit Messages

Siga o padrão de commit messages convencional:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Tipos de Commit

- `feat`: Uma nova feature
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Mudanças que não afetam o significado do código (formatação, etc)
- `refactor`: Refatoração de código sem mudanças de feature ou fix
- `perf`: Melhorias de performance
- `test`: Adição ou atualização de testes
- `chore`: Mudanças em dependências ou configurações

### Exemplos

```
feat(transactions): add recurring transaction support

Add support for recurring transactions with daily, weekly, monthly, and yearly frequencies.

Closes #123
```

```
fix(budgets): correct budget calculation for multiple categories

The budget calculation was not properly handling multiple categories in the same month.
```

## 🧪 Testes

Todos os PRs devem incluir testes. Siga estas diretrizes:

### Testes Unitários

```typescript
import { describe, it, expect } from 'vitest';
import { calculateBudgetPercentage } from './budget.utils';

describe('calculateBudgetPercentage', () => {
  it('should return 0 when spent is 0', () => {
    const result = calculateBudgetPercentage(0, 100);
    expect(result).toBe(0);
  });

  it('should return 100 when spent equals limit', () => {
    const result = calculateBudgetPercentage(100, 100);
    expect(result).toBe(100);
  });

  it('should handle decimal values', () => {
    const result = calculateBudgetPercentage(50.5, 100);
    expect(result).toBeCloseTo(50.5);
  });
});
```

### Testes de Componentes

```typescript
import { render, screen } from '@testing-library/react';
import { BudgetCard } from './BudgetCard';

describe('BudgetCard', () => {
  it('should render budget information', () => {
    const budget = {
      id: 1,
      name: 'Alimentação',
      limit: 500,
      spent: 250,
    };

    render(<BudgetCard budget={budget} />);

    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('R$ 250.00')).toBeInTheDocument();
  });
});
```

### Executar Testes

```bash
# Testes unitários
pnpm test

# Testes E2E
pnpm test:e2e

# Cobertura de testes
pnpm test:coverage
```

## 📚 Documentação

- Atualize o README.md se adicionar novas features
- Adicione comentários JSDoc para funções complexas
- Mantenha a documentação da API tRPC atualizada
- Documente variáveis de ambiente necessárias

### Exemplo de JSDoc

```typescript
/**
 * Calcula a porcentagem de utilização do orçamento
 * @param spent - Valor gasto
 * @param limit - Limite do orçamento
 * @returns Porcentagem de utilização (0-100)
 */
export function calculateBudgetPercentage(spent: number, limit: number): number {
  if (limit === 0) return 0;
  return (spent / limit) * 100;
}
```

## 🔍 Revisão de Código

Todos os PRs serão revisados por pelo menos um mantenedor. Esperamos:

- Código limpo e bem estruturado
- Testes adequados
- Documentação atualizada
- Sem conflitos com a branch principal

## ❓ Dúvidas?

Sinta-se livre para abrir uma issue ou entrar em contato com os mantenedores!

---

**Obrigado por contribuir para o FinTrackPro!** 🙏

