/**
 * PR Open · base de datos (Google Sheets) — N3 Labs
 *
 * Guarda registros y asistencia a mesas en la hoja de cálculo a la que está
 * vinculado este script. La contraseña de administración NO va en el código:
 * se guarda en Propiedades del script (ADMIN_PW). Ver LEEME.md.
 */
var PROPS = PropertiesService.getScriptProperties();
var HEAD = {
  Registrados: ['id', 'fecha', 'nombre', 'empresa', 'whatsapp', 'consentimiento', 'orden_mesas'],
  Eventos: ['fecha', 'id', 'tipo', 'mesa', 'recorder_id', 'recorder_nombre']
};

function sheet_(n) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), s = ss.getSheetByName(n);
  if (!s) {
    s = ss.insertSheet(n);
    s.getRange('A:Z').setNumberFormat('@'); // texto plano: conserva "01" y "+52…"
    s.appendRow(HEAD[n]);
    s.setFrozenRows(1);
  }
  return s;
}

function append_(n, obj) {
  sheet_(n).appendRow(HEAD[n].map(function (h) {
    return String(obj[h] == null ? '' : obj[h]).slice(0, 200);
  }));
}

function rows_(n) {
  var v = sheet_(n).getDataRange().getValues(), h = v.shift();
  return v.map(function (r) {
    var o = {};
    h.forEach(function (k, i) { o[k] = String(r[i]); });
    return o;
  });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json_({ ok: true, servicio: 'PR Open · N3 Labs' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var b = JSON.parse(e.postData.contents);

    if (b.action === 'register') {
      append_('Registrados', b.reg || {});
      return json_({ ok: true });
    }

    if (b.action === 'event') {
      var ev = b.event || {};
      if (['checkin', 'vote', 'sent'].indexOf(ev.tipo) < 0) return json_({ ok: false });
      append_('Eventos', ev);
      return json_({ ok: true });
    }

    // Compañeros que ya marcaron asistencia en una mesa (sin WhatsApp)
    if (b.action === 'peers') {
      var mesa = String(b.mesa || ''), since = Date.now() - 4 * 3600 * 1000, reg = {}, seen = {}, peers = [];
      rows_('Registrados').forEach(function (r) { reg[r.id] = r; });
      rows_('Eventos').forEach(function (x) {
        if (x.tipo === 'checkin' && x.mesa === mesa && !seen[x.id] && reg[x.id] &&
            new Date(x.fecha).getTime() >= since) {
          seen[x.id] = 1;
          peers.push({ id: x.id, nombre: reg[x.id].nombre, empresa: reg[x.id].empresa });
        }
      });
      return json_({ ok: true, peers: peers });
    }

    // Panel de administración: la contraseña se valida aquí, nunca en la página
    if (b.action === 'admin') {
      var pw = PROPS.getProperty('ADMIN_PW');
      if (!pw || String(b.pw || '') !== pw) {
        Utilities.sleep(1000);
        return json_({ ok: false });
      }
      return json_({ ok: true, reg: rows_('Registrados'), ev: rows_('Eventos') });
    }

    return json_({ ok: false });
  } catch (err) {
    return json_({ ok: false });
  } finally {
    lock.releaseLock();
  }
}
