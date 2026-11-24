import type {Task} from '../../core/contracts';
import type {SQLPayload} from './types';

type Value = string | number;
type Literal = Value | {literal: Value};
type Comparison = '=' | '<>' | '>' | '>=' | '<' | '<=';
type Expression = string | {literal: Value}
  | {op: '+' | '-' | '*' | '/'; left: Expression; right: Expression}
  | {fn: 'COALESCE'; arg: Expression; fallback: Literal}
  | {fn: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX'; arg: Expression}
  | {when: Condition; then: Literal; else: Literal};
type Condition = {and: Condition[]} | {or: Condition[]} | {
  left: Expression;
  op: Comparison | 'IS NULL' | 'IS NOT NULL' | 'BETWEEN' | 'IN' | 'LIKE' | 'ILIKE';
  value?: Literal | Literal[];
};
type TaskPlan = {
  from: string;
  select: ('*' | {expr: Expression; as?: string})[];
  joins?: {table: string; type: 'INNER' | 'LEFT'; left: string; right: string}[];
  where?: Condition;
  groupBy?: string[];
  having?: Condition;
  distinct?: boolean;
  orderBy?: {column: string; direction: 'ASC' | 'DESC'}[];
  limit?: number;
};

const heading = 'Вимоги до результату\n\n';
const oldHeading = '\n\nТочні вимоги:\n';
const sqlRecipe = /\b(?:SELECT|FROM|WHERE|JOIN|HAVING|DISTINCT|LIMIT|LIKE|ILIKE|BETWEEN|COALESCE|CASE|COUNT|SUM|AVG|MIN|MAX|GROUP\s+BY|ORDER\s+BY|IS\s+(?:NOT\s+)?NULL)\b|\b(?:IN|ANY|LOWER|UPPER|CAST)\s*\(|`|[<>=]|(?:^|[\s'«])%\S|\S%(?:$|[\s'»])|айлайк|коалесц/i;

const unwrap = (value: Literal) => typeof value === 'object' ? value.literal : value;
const display = (value: Literal) => {
  const text = unwrap(value);
  return typeof text === 'number' ? String(text) : `«${text}»`;
};

type PatternPart = {kind: 'text'; text: string} | {kind: 'any' | 'one'};

function describePattern(field: string, pattern: string, ignoreCase: boolean) {
  const parts: PatternPart[] = [];
  const characters = [...pattern];
  let text = '';
  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    if (char === '\\' && i + 1 < characters.length) {
      text += characters[++i];
    } else if (char === '%' || char === '_') {
      if (text) parts.push({kind: 'text', text});
      text = '';
      const kind = char === '%' ? 'any' : 'one';
      if (kind === 'one' || parts.at(-1)?.kind !== 'any') parts.push({kind});
    } else {
      text += char;
    }
  }
  if (text) parts.push({kind: 'text', text});

  const caseRule = ignoreCase ? ' без урахування регістру літер' : ' з урахуванням регістру літер';
  const fragments = parts.filter(part => part.kind === 'text');
  if (!parts.length) return `${field} дорівнює порожньому рядку`;
  if (parts.length === 1 && parts[0].kind === 'any') return `${field} має значення (порожній рядок також підходить)`;
  if (fragments.length === 1 && parts.every(part => part.kind !== 'one')) {
    const startsAnywhere = parts[0].kind === 'any';
    const endsAnywhere = parts.at(-1)?.kind === 'any';
    const verb = startsAnywhere
      ? endsAnywhere ? 'містить' : 'закінчується на'
      : endsAnywhere ? 'починається з' : 'точно збігається з';
    return `${field} ${verb} ${display(fragments[0].text)}${caseRule}`;
  }
  const sequence = parts.map(part => part.kind === 'text' ? display(part.text)
    : part.kind === 'any' ? 'будь-яка кількість символів, зокрема нуль' : 'рівно один довільний символ');
  return `${field} від початку до кінця відповідає послідовності (${sequence.join(' → ')})${caseRule}`;
}

const comparisons: Record<Comparison, string> = {
  '=': 'дорівнює', '<>': 'відрізняється від', '>': 'більше за', '>=': 'не менше ніж',
  '<': 'менше за', '<=': 'не більше ніж',
};
const aggregations = {COUNT: 'кількість заповнених значень', SUM: 'сума значень',
  AVG: 'середнє значення', MIN: 'найменше значення', MAX: 'найбільше значення'};

function describeExpression(expr: Expression): string {
  if (typeof expr === 'string') return expr;
  if ('literal' in expr) return display(expr);
  if ('op' in expr) {
    const left = describeExpression(expr.left), right = describeExpression(expr.right);
    switch (expr.op) {
      case '+': return `сума (${left} та ${right})`;
      case '-': return `різниця (${left} мінус ${right})`;
      case '*': return `добуток (${left} та ${right})`;
      case '/': return `результат ділення (${left} на ${right})`;
    }
  }
  if ('when' in expr) return `${display(expr.then)}, якщо ${describeCondition(expr.when)}, інакше ${display(expr.else)}`;
  if (expr.fn === 'COALESCE') return `${describeExpression(expr.arg)}, а для відсутнього значення — ${display(expr.fallback)}`;
  if (expr.fn === 'COUNT' && expr.arg === '*') return 'кількість рядків';
  return `${aggregations[expr.fn]} ${describeExpression(expr.arg)}`;
}

function describeCondition(condition: Condition): string {
  if ('and' in condition) return `виконуються всі умови (${condition.and.map(describeCondition).join('; ')})`;
  if ('or' in condition) return `виконується хоча б одна з умов (${condition.or.map(describeCondition).join('; ')})`;
  const field = describeExpression(condition.left);
  const {op, value} = condition;
  switch (op) {
    case 'IS NULL': return `значення ${field} відсутнє`;
    case 'IS NOT NULL': return `значення ${field} присутнє`;
    case 'BETWEEN': {
      const [min, max] = value as Literal[];
      return `${field} у межах від ${display(min)} до ${display(max)} включно`;
    }
    case 'IN': return `${field} має одне зі значень (${(value as Literal[]).map(display).join(', ')})`;
    case 'LIKE':
    case 'ILIKE': return describePattern(field, String(unwrap(value as Literal)), op === 'ILIKE');
    default: return `${field} ${comparisons[op]} ${display(value as Literal)}`;
  }
}

function describePlan(plan: TaskPlan) {
  const columns = plan.select.map(column => column === '*' ? 'усі колонки' :
    `${column.as ? column.as + ' — ' : ''}${describeExpression(column.expr)}`);
  return [
    `Візьми дані з таблиці ${plan.from}.`,
    ...(plan.joins ?? []).map(join => {
      const match = `Зістав рядки за однаковими значеннями ${join.left} та ${join.right}.`;
      return join.type === 'LEFT'
        ? `${match} Збережи й рядки з попередніх джерел, для яких у ${join.table} немає відповідника.`
        : `${match} Враховуй лише збіги.`;
    }),
    `Колонки результату в такому порядку — ${columns.join('; ')}.`,
    plan.where && `Залиш рядки, де ${describeCondition(plan.where)}.`,
    plan.groupBy?.length === 1 ? `Поверни один рядок для кожного значення ${plan.groupBy[0]}.`
      : plan.groupBy?.length && `Поверни один рядок для кожної комбінації ${plan.groupBy.join(', ')}.`,
    plan.having && `Залиш групи, для яких ${describeCondition(plan.having)}.`,
    plan.distinct && 'Покажи кожен унікальний рядок результату один раз.',
    plan.orderBy?.length
      ? `Впорядкуй рядки за ${plan.orderBy.map(rule => `${rule.column} ${rule.direction === 'DESC' ? 'за спаданням' : 'за зростанням'}`).join(', потім за ')}.`
      : 'Порядок рядків довільний.',
    plan.limit != null && `Покажи щонайбільше ${plan.limit} перших рядків у цьому порядку.`,
  ].filter(Boolean).join('\n\n');
}

export function withoutAIRecipe(task: Task): Task {
  const ai = task.moduleId === 'postgresql' ? (task.payload as SQLPayload)?.ai : undefined;
  if (!ai) return task;

  const context = task.brief.startsWith(heading)
    ? ''
    : task.brief.split('\n\n'+heading, 1)[0].split(oldHeading, 1)[0].trim();
  const safeContext = sqlRecipe.test(context) ? '' : context;
  const title = sqlRecipe.test(task.title)
    ? [task.title.split(' · ', 1)[0], 'Робочий звіт'].filter(part => !sqlRecipe.test(part)).join(' · ')
    : task.title;
  try {
    const brief = [safeContext, heading + describePlan(ai.plan as TaskPlan)].filter(Boolean).join('\n\n');
    return {...task, title, brief};
  } catch {
    // Older records may have lost the plan. Keep any usable description and avoid repeating obsolete SQL fragments.
    return {...task, title, brief: safeContext};
  }
}
