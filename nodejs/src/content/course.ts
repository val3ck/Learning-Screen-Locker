import type { ComponentType } from 'react';
export * from './catalog';
const bodies = import.meta.glob<{ default: ComponentType }>('./lessons/*.mdx', { eager: true });
export const lessonBodies = new Map(Object.entries(bodies).map(([path, body]) => [path.split('/').pop()!.replace('.mdx', ''), body.default]));

