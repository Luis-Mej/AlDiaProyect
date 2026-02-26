import { chromium, firefox, webkit } from 'playwright';

/**
 * consultarCNEL(claveBusqueda, options)
 * - claveBusqueda: cuenta / cédula / RUC
 * - options: { headless: boolean, screenshotOnError: boolean, slowMo: number }
 *
 * Devuelve { ok: true, cuenta, unidadNegocio, identificacion, estado, deuda, mesesDeuda, fechaVencimiento, raw }
 * o { ok: false, error, screenshot } si falla (screenshot en base64 si screenshotOnError).
 */
export const consultarCNEL = async (claveBusqueda, options = {}) => {
  const browserType = options.browser === 'firefox' ? firefox : options.browser === 'webkit' ? webkit : chromium;
  const browser = await browserType.launch({
    headless: options.headless ?? true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    slowMo: options.slowMo ?? 0
  });

  const page = await browser.newPage();

  // Emular dispositivo móvil si se especifica
  if (options.device) {
    await page.emulate(options.device);
  }

  try {
    await page.goto("https://serviciosenlinea.cnelep.gob.ec/consulta-cuen/", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Seleccionar tipo de búsqueda: CUENTA CONTRATO
    // Buscar select o radio buttons para "CUENTA CONTRATO"
    const tipoSelect = await page.$('select[name="tipoBusqueda"], select');
    if (tipoSelect) {
      // Asumir value="cuenta" o similar; ajustar si es diferente
      await tipoSelect.select('cuenta');
    } else {
      // Si es radio button
      const radioCuenta = await page.$('input[type="radio"][value="cuenta"], input[type="radio"]');
      if (radioCuenta) {
        await radioCuenta.click();
      } else {
        // Fallback: buscar label o texto "CUENTA CONTRATO"
        const label = await page.$('label:has-text("CUENTA CONTRATO"), [text*="CUENTA CONTRATO"]');
        if (label) {
          await label.click();
        }
      }
    }

    // Esperar un poco después de seleccionar
    await page.waitForTimeout(500);

    // Selector del campo de cuenta contrato (más específico)
    const input = await page.$('input[name="cuenta"], input[type="text"], input');
    if (!input) throw new Error("No se encontró campo de búsqueda en CNEL");

    await input.click({ clickCount: 3 });
    await input.type(String(claveBusqueda), { delay: 40 });

    // Buscar botón Buscar
    const btn = await page.$("button[type='submit'], input[type='submit'], button");
    if (btn) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }).catch(() => {}),
        btn.click().catch(() => {}),
      ]);
    } else {
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1500);
    }

    // Esperar el contenido; si la respuesta viene en un panel, usamos waitForSelector
    await page.waitForTimeout(1000);

    // Extraer texto y buscar labels (más robusto que depender de selectores exactos)
    const result = await page.evaluate(() => {
      const t = document.body.innerText || "";
      const lines = t.split("\n").map(l => l.trim()).filter(Boolean);

      const findNext = (regex) => {
        const re = new RegExp(regex, "i");
        for (let i = 0; i < lines.length; i++) {
          if (re.test(lines[i])) {
            return lines[i+1] ?? lines[i];
          }
        }
        return null;
      };

      return {
        raw: t,
        unidadNegocio: findNext("Unidad de Negocios|Unidad"),
        identificacion: findNext("Identificaci[oó]n|C[IÍ]A|C[eé]dula"),
        cuenta: findNext("Cuenta contrato|Cuenta contrato:|Cuenta"),
        estadoCuenta: findNext("Estado de cuenta contrato|Estado de cuenta|ACTIVO|INACTIVO") || null,
        deuda: findNext("Deuda|Saldo|Valor a pagar|Deuda:|$"),
        mesesDeuda: findNext("Meses de deuda|Meses de deuda:"),
        fechaVencimiento: findNext("Fecha de vencimiento|Vence el|Fecha vencimiento")
      };
    });

    await browser.close();

    // Normalizar/devolver
    return {
      ok: true,
      cuenta: result.cuenta || claveBusqueda,
      unidadNegocio: result.unidadNegocio || null,
      identificacion: result.identificacion || null,
      estado: result.estadoCuenta || null,
      deuda: parseNumber(result.deuda),
      mesesDeuda: parseIntOrNull(result.mesesDeuda),
      fechaVencimiento: result.fechaVencimiento || null,
      raw: result.raw
    };
  } catch (error) {
    // tomar screenshot si se pidió
    let screenshotBase64 = null;
    try {
      if (options.screenshotOnError) {
        const ss = await page.screenshot({ encoding: "base64", fullPage: false }).catch(()=>null);
        screenshotBase64 = ss ? `data:image/png;base64,${ss}` : null;
      }
    } catch(e) { /* ignore */ }
    await browser.close();
    return { ok: false, error: error.message, screenshot: screenshotBase64 };
  }
};

// Helpers
function parseNumber(text) {
  if (!text) return null;
  const m = text.replace(/\./g, "").match(/-?[\d,\.]+/);
  if (!m) return null;
  const n = m[0].replace(/,/g, "").replace(/\s/g, "");
  const num = Number(n);
  return isNaN(num) ? null : num;
}
function parseIntOrNull(text) {
  if (!text) return null;
  const m = text.match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}
