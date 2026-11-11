// Tooltip con la descripción de cualquier elemento con `data-tip`. Aparece al pasar el ratón
// o al enfocarlo con teclado; en pantallas táctiles la misma información está en el diálogo
// de edición. Usa la Popover API para quedar por encima de los diálogos modales.
import { describe, type Description } from '../../lib/describe';
import { $, clamp, onRender, state } from './state';

/** Pinta una descripción (título, datos y texto) dentro de `container`. */
export function renderDescription(container: HTMLElement, description: Description, withTitle = true) {
  const children: HTMLElement[] = [];
  if (withTitle) {
    const title = document.createElement('strong');
    title.textContent = description.title;
    const subtitle = document.createElement('small');
    subtitle.textContent = description.subtitle;
    children.push(title, subtitle);
  }
  const facts = description.facts.filter(([, value]) => value);
  if (facts.length) {
    const list = document.createElement('dl');
    for (const [label, value] of facts) {
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      list.append(dt, dd);
    }
    children.push(list);
  }
  if (description.text) {
    const text = document.createElement('p');
    text.textContent = description.text;
    children.push(text);
  }
  container.replaceChildren(...children);
}

type Source = (el: HTMLElement) => Description | null;
const sources: Record<string, Source> = { entry: (el) => describe(state, el.dataset.entry!) };
/** Añade un origen de descripciones para `data-tip="<name>"` (lo usa el listado). */
export const registerTipSource = (name: string, source: Source) => (sources[name] = source);

const tip = $('#tip');
let current: HTMLElement | null = null;

function show(target: HTMLElement) {
  const description = sources[target.dataset.tip!]?.(target);
  if (!description) return hide();
  current = target;
  renderDescription(tip, description);
  if (!tip.matches(':popover-open')) tip.showPopover();
  const rect = target.getBoundingClientRect();
  const size = tip.getBoundingClientRect();
  const below = rect.bottom + 6;
  const top = below + size.height > innerHeight - 8 ? Math.max(8, rect.top - size.height - 6) : below;
  tip.style.top = `${top}px`;
  tip.style.left = `${clamp(rect.left, 8, innerWidth - size.width - 8)}px`;
}

function hide() {
  current = null;
  if (tip.matches(':popover-open')) tip.hidePopover();
}

document.addEventListener('pointerover', (event) => {
  if (event.pointerType !== 'mouse') return;
  const target = (event.target as Element).closest<HTMLElement>('[data-tip]');
  if (target === current) return;
  if (target) show(target);
  else hide();
});
document.addEventListener('focusin', (event) => {
  const target = (event.target as Element).closest<HTMLElement>('[data-tip]');
  if (target) show(target);
  else hide();
});
document.addEventListener('keydown', (event) => event.key === 'Escape' && hide());
addEventListener('scroll', hide, true);
// Tras un cambio, el contenido puede estar desactualizado o la fila ya no existir.
onRender(() => (current?.isConnected ? show(current) : hide()));
