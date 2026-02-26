import { chromium, firefox, webkit } from 'playwright';

/**
 * consultarInteragua(numero, options)
 * - numero: contrato o cédula
 * - options: { headless, screenshotOnError, slowMo }
 *
 * Devuelve { ok:true, cuenta, saldoActual, planillasAdeudadas, fechaVencimiento, fechaEmision, ultimoPago, fechaUltimoPago, raw }
 */
export const consultarInteragua = async (numero, options = {}) => {
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
    await page.goto("https://www.interagua.com.ec/", { waitUntil: "networkidle2", timeout: 30000 });

    // IRIS puede ser un widget; buscamos inputs visibles y escribimos el número.
    // Si IRIS abre un modal, esperamos y actuamos.
    // (Si falla, hacer debug headless:false y ver selectores exactos)
    const input = await page.$("input[type='text'], input");
    if (!input) {
      // si no hay input visible, seguir y buscar texto que indique IRIS
      // fallback: no input -> error
      throw new Error("Campo de consulta no encontrado en Interagua (IRIS)");
    }

    await input.click({ clickCount: 3 });
    await input.type(String(numero), { delay: 40 });

    // Intentar hallar botón o enviar Enter
    const btn = await page.$("button[type='submit'], input[type='submit'], button");
    if (btn) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }).catch(()=>{}),
        btn.click().catch(()=>{})
      ]);
    } else {
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1500);
    }

    await page.waitForTimeout(1200);

    // Extraer texto (IRIS responde en chat/ventana; extraemos texto)
    const result = await page.evaluate(() => {
      const txt = document.body.innerText || "";
      const lines = txt.split("\n").map(l => l.trim()).filter(Boolean);

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
        raw: txt,
        nombre: findNext("Nombre|Titular|Cliente"),
        direccion: findNext("Direcci[oó]n"),
        saldoActual: findNext("Saldo actual|Saldo:|Saldo"),
        planillasAdeudadas: findNext("Planillas adeudadas|Planillas"),
        fechaVencimiento: findNext("Fecha de vencimiento|Vence"),
        fechaEmision: findNext("Fecha de emisi[oó]n"),
        ultimoPago: findNext("Último pago|Ultimo pago|Último pago realizado"),
        fechaUltimoPago: findNext("Fecha último pago|Fecha ultimo pago|Fecha de pago")
      };
    });

    await browser.close();

    return {
      ok: true,
      cuenta: numero,
      saldoActual: parseNumber(result.saldoActual),
      planillasAdeudadas: parseIntOrNull(result.planillasAdeudadas),
      fechaVencimiento: result.fechaVencimiento || null,
      fechaEmision: result.fechaEmision || null,
      ultimoPago: parseNumber(result.ultimoPago),
      fechaUltimoPago: result.fechaUltimoPago || null,
      raw: result.raw
    };
  } catch (error) {
    let screenshotBase64 = null;
    try {
      if (options.screenshotOnError) {
        const ss = await page.screenshot({ encoding: "base64", fullPage: false }).catch(()=>null);
        screenshotBase64 = ss ? `data:image/png;base64,${ss}` : null;
      }
    } catch (e) {}
    await browser.close();
    return { ok: false, error: error.message, screenshot: screenshotBase64 };
  }
};

// Helpers (copiados)
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
