#!/usr/bin/env tsx
import { PortfolioSchema } from '../src/lib/validatePortfolio';
import portfolioRaw from '../src/data/portfolio.json';

const result = PortfolioSchema.safeParse(portfolioRaw);

if (!result.success) {
  const issues = result.error.issues;
  issues.forEach(issue => {
    const field = issue.path.join('.');
    console.error(`❌ portfolio.json validation error at "${field}": ${issue.message}`);
  });
  process.exit(1);
}

console.log('✅ portfolio.json validation passed.');
process.exit(0);
