import { expect, test } from "@playwright/test";

test.describe("Happy path — navegação", () => {
  test("início tem hero e CTA de registo antes da análise", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1, name: /perdendo receita/i })).toBeVisible();
    const cta = page.getByRole("link", { name: /Começar grátis/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", /\/conta\/criar\?redirect=/);
  });

  test("/analise pede conta, formulário ou aviso de config", async ({ page }) => {
    await page.goto("/analise");
    const h1 = page.locator("main h1");
    await expect(h1).toHaveText(/Configuração em falta|Crie uma conta para analisar|Gerar laudo/, { timeout: 15000 });
    const t = await h1.textContent();
    if (t?.includes("conta para analisar")) {
      await expect(page.getByRole("link", { name: /Criar conta gratuita/i })).toBeVisible();
    } else if (t?.includes("Gerar laudo")) {
      await expect(page.getByLabel(/URL da página/i)).toBeVisible();
      await expect(page.getByLabel(/Setor/i)).toBeVisible();
    }
  });
  test("/api/health responde ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { ok?: boolean };
    expect(json.ok).toBe(true);
  });
});
