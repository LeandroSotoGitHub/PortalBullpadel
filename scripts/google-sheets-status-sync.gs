/**
 * Portal Bullpadel — sincronización automática de estados de acceso.
 *
 * Este archivo se copia en un proyecto de Apps Script vinculado a la hoja
 * "Alta clientes portal". El secreto nunca se escribe acá: se solicita una
 * sola vez y queda guardado en Script Properties.
 */

const PORTAL_STATUS_CONFIG = Object.freeze({
  spreadsheetId: '1mmldAhDFzuEQcARN37Dm05kftN1gz4JN-CGcrlyi-Sg',
  sheetName: 'Respuestas de formulario 1',
  exportUrl: 'https://zzvdrnwotxrgvncbsaez.supabase.co/functions/v1/sheet-status-export',
  emailColumn: 7,  // G
  statusColumn: 10, // J
  firstDataRow: 2,
  triggerMinutes: 15,
});

const AUTO_STATUS_RANK = Object.freeze({
  '': 0,
  'Invitación enviada': 1,
  'Entregado': 2,
  'Abierto': 3,
  'Ingresó al portal': 4,
});

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Portal Bullpadel')
    .addItem('Actualizar estados ahora', 'syncPortalStatuses')
    .addItem('Configurar automatización', 'configurePortalStatusSync')
    .addToUi();
}

/**
 * Solicita el token una única vez e instala un trigger cada 15 minutos.
 * Ejecutar manualmente desde el menú Portal Bullpadel.
 */
function configurePortalStatusSync() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Configurar actualización automática',
    'Pegá el token de sincronización provisto por el administrador técnico.',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;
  const token = response.getResponseText().trim();
  if (token.length < 32) {
    ui.alert('El token no es válido. No se modificó la configuración.');
    return;
  }

  PropertiesService.getScriptProperties().setProperty('SHEET_SYNC_TOKEN', token);
  installPortalStatusTrigger_();

  const result = syncPortalStatuses();
  ui.alert(`Automatización activa. ${result.updated} estado(s) actualizado(s).`);
}

function installPortalStatusTrigger_() {
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === 'syncPortalStatuses')
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger('syncPortalStatuses')
    .timeBased()
    .everyMinutes(PORTAL_STATUS_CONFIG.triggerMinutes)
    .create();
}

/**
 * Lee email (G), conserva estados manuales/especiales y modifica solo J.
 * La función usa un lock para evitar dos ejecuciones simultáneas.
 */
function syncPortalStatuses() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) throw new Error('Ya hay otra sincronización en curso.');

  try {
    const token = PropertiesService.getScriptProperties().getProperty('SHEET_SYNC_TOKEN');
    if (!token) throw new Error('Falta configurar SHEET_SYNC_TOKEN.');

    const response = UrlFetchApp.fetch(PORTAL_STATUS_CONFIG.exportUrl, {
      method: 'post',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      muteHttpExceptions: true,
    });

    if (response.getResponseCode() !== 200) {
      throw new Error(`La consulta de estados respondió HTTP ${response.getResponseCode()}.`);
    }

    const body = JSON.parse(response.getContentText());
    if (!body || !Array.isArray(body.accounts)) {
      throw new Error('La respuesta de estados no tiene el formato esperado.');
    }

    const statusByEmail = new Map(
      body.accounts
        .filter((account) => account && typeof account.email === 'string' && typeof account.status === 'string')
        .map((account) => [normalizeEmail_(account.email), account.status])
    );

    const spreadsheet = SpreadsheetApp.openById(PORTAL_STATUS_CONFIG.spreadsheetId);
    const sheet = spreadsheet.getSheetByName(PORTAL_STATUS_CONFIG.sheetName);
    if (!sheet) throw new Error(`No existe la pestaña ${PORTAL_STATUS_CONFIG.sheetName}.`);

    const lastRow = sheet.getLastRow();
    if (lastRow < PORTAL_STATUS_CONFIG.firstDataRow) return { updated: 0, checked: 0 };

    const rowCount = lastRow - PORTAL_STATUS_CONFIG.firstDataRow + 1;
    const emails = sheet
      .getRange(PORTAL_STATUS_CONFIG.firstDataRow, PORTAL_STATUS_CONFIG.emailColumn, rowCount, 1)
      .getDisplayValues();
    const statusRange = sheet
      .getRange(PORTAL_STATUS_CONFIG.firstDataRow, PORTAL_STATUS_CONFIG.statusColumn, rowCount, 1);
    const statuses = statusRange.getDisplayValues();

    let updated = 0;
    for (let index = 0; index < rowCount; index += 1) {
      const email = normalizeEmail_(emails[index][0]);
      if (!email) continue;

      const nextStatus = statusByEmail.get(email);
      const currentStatus = String(statuses[index][0] || '').trim();
      if (nextStatus && shouldReplaceStatus_(currentStatus, nextStatus)) {
        statuses[index][0] = nextStatus;
        updated += 1;
      }
    }

    if (updated > 0) statusRange.setValues(statuses);
    console.log(JSON.stringify({ event: 'portal_status_sync_completed', checked: rowCount, updated }));
    return { updated, checked: rowCount };
  } finally {
    lock.releaseLock();
  }
}

function shouldReplaceStatus_(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return false;

  // Decisiones manuales/históricas que el sincronizador jamás debe pisar.
  const protectedStatus = [
    'No enviado (acceso único)',
    'Acceso configurado manualmente',
    'Ingresó (correo alternativo)',
    'ya estaba dado de alta',
  ].includes(currentStatus);
  if (protectedStatus) return false;

  // Si un reenvío posterior resolvió un error, la fuente remota vuelve a ser
  // autoritativa. Un error nunca reemplaza una apertura o un ingreso.
  if (currentStatus === 'Error de entrega') return nextStatus !== 'Error de entrega';
  if (nextStatus === 'Error de entrega') {
    return (AUTO_STATUS_RANK[currentStatus] || 0) < AUTO_STATUS_RANK.Abierto;
  }

  return (AUTO_STATUS_RANK[nextStatus] || 0) > (AUTO_STATUS_RANK[currentStatus] || 0);
}

function normalizeEmail_(value) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}
