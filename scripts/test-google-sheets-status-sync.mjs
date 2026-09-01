import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./google-sheets-status-sync.gs', import.meta.url), 'utf8');
const context = { console };
vm.createContext(context);
vm.runInContext(`${source}\n;globalThis.__shouldReplaceStatus = shouldReplaceStatus_;`, context);

const shouldReplace = context.__shouldReplaceStatus;
const cases = [
  ['', 'Invitación enviada', true],
  ['Invitación enviada', 'Entregado', true],
  ['Entregado', 'Abierto', true],
  ['Abierto', 'Ingresó al portal', true],
  ['Ingresó al portal', 'Abierto', false],
  ['Abierto', 'Error de entrega', false],
  ['Entregado', 'Error de entrega', true],
  ['Error de entrega', 'Entregado', true],
  ['No enviado (acceso único)', 'Ingresó al portal', false],
  ['Acceso configurado manualmente', 'Ingresó al portal', false],
  ['Ingresó (correo alternativo)', 'Ingresó al portal', false],
  ['ya estaba dado de alta', 'Ingresó al portal', false],
];

let failures = 0;
for (const [current, next, expected] of cases) {
  const actual = shouldReplace(current, next);
  if (actual !== expected) {
    failures += 1;
    console.error({ current, next, expected, actual });
  }
}

if (failures) process.exit(1);
console.log(`${cases.length}/${cases.length} casos de prioridad de estado OK`);
