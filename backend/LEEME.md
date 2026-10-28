# Base de datos de PR Open (Google Sheets)

La página es estática, así que los registros se guardan en una hoja de Google
que tú controlas. La contraseña del panel se valida en el servidor (Apps Script),
no en la página.

1. Crea una hoja de cálculo de Google nueva (p. ej. "PR Open · Registros").
2. **Extensiones → Apps Script**. Borra el contenido y pega `Code.gs`.
3. **Configuración del proyecto → Propiedades de la secuencia de comandos →
   Agregar propiedad**: nombre `ADMIN_PW`, valor = la contraseña del panel.
4. **Implementar → Nueva implementación → Aplicación web**
   - Ejecutar como: **yo**
   - Quién tiene acceso: **cualquier persona**
   Autoriza los permisos y copia la URL que termina en `/exec`.
5. En `index.html`, pega esa URL en `var API_URL='';` y sube el cambio.

Resultado:
- Hoja **Registrados**: id, fecha, nombre, empresa, WhatsApp, consentimiento, orden de mesas.
- Hoja **Eventos**: llegada a mesa (`checkin`), voto del responsable de grabación (`vote`) y nota de voz enviada (`sent`).
- Panel en la página: `…/#admin` o el enlace "Admin" del pie. Muestra registrados, reporte por mesa y descarga CSV.

Si cambias el código del script, vuelve a **Implementar → Administrar implementaciones → Editar → Nueva versión**.
