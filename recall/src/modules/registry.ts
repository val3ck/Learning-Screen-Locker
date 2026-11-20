import type {LearningModule} from '../core/contracts';
import {postgresql} from './postgresql';
import {english} from './english';
export const modules:ReadonlyMap<string,LearningModule>=new Map([[postgresql.manifest.id,postgresql],[english.manifest.id,english]]);
export function getModule(id:string):LearningModule {const module=modules.get(id);if(!module)throw new Error('Навчальний модуль недоступний.');return module;}
