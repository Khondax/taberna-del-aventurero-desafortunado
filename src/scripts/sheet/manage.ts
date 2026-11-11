// Pestaña Gestión de la ficha: exportar el archivo JSON, reemplazar la ficha con uno
// importado y eliminarla del servidor.
import { actions, isInputError } from 'astro:actions';
import { $, currentFile, log, slug, state, update } from './state';

$('#export').addEventListener('click', () => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([`${JSON.stringify(currentFile(), null, 2)}\n`], { type: 'application/json' }));
  link.download = `${slug}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
});

// Importar: el servidor valida y migra el archivo, y su contenido sustituye al de la ficha
// como cualquier otro cambio (se guarda solo y se puede deshacer, salvo las notas).
const importStatus = $('#importStatus');
const fileInput = $<HTMLInputElement>('#importFile');
$('#importButton').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  fileInput.value = '';
  if (!file) return;
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    importStatus.textContent = `${file.name} no es un archivo JSON válido.`;
    return;
  }
  importStatus.textContent = `Importando ${file.name}…`;
  const { data, error } = await actions.parseCharacter(parsed as Parameters<typeof actions.parseCharacter>[0]);
  if (error) {
    const issue = isInputError(error) ? error.issues[0] : undefined;
    importStatus.textContent = issue
      ? `${file.name} no es una ficha válida: ${issue.path.join('.') || 'raíz'} · ${issue.message}`
      : `No se pudo importar: ${error.message}`;
    return;
  }
  update(() => {
    Object.assign(state, data.character);
    log('Ficha importada', file.name);
  });
  $<HTMLTextAreaElement>('#notes').value = state.notes;
  importStatus.textContent = `Ficha reemplazada con ${file.name}.`;
});

// Eliminar: pide confirmación y, si el servidor borra el archivo, vuelve a la mesa.
const deleteDialog = $<HTMLDialogElement>('#deleteDialog');
const deleteStatus = $('#deleteStatus');
$('#openDelete').addEventListener('click', () => {
  $('#deleteName').textContent = state.name;
  deleteStatus.textContent = '';
  deleteDialog.showModal();
});
$<HTMLButtonElement>('#confirmDelete').addEventListener('click', async (event) => {
  const button = event.currentTarget as HTMLButtonElement;
  button.disabled = true;
  const { error } = await actions
    .deleteCharacter({ slug })
    .catch(() => ({ error: { code: 'NETWORK', message: 'Sin conexión con el servidor.' } }));
  button.disabled = false;
  if (error && error.code !== 'NOT_FOUND') {
    deleteStatus.textContent = `No se pudo eliminar: ${error.message}`;
    return;
  }
  location.href = '/';
});
