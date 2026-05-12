import { expect, test } from "@playwright/test";

test.describe("Happy path — navegação", () => {
  test("início tem CTA para /analise", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main h1")).toContainText(/Laudo de neuromarketing/i);
    await expect(page.getByRole("link", { name: /Começar análise/i })).toHaveAttribute("href", "/analise");
  });

  test("/analise mostra formulário de laudo", async ({ page }) => {
    await page.goto("/analise");
    await expect(page.getByRole("heading", { name: /Gerar laudo/i })).toBeVisible();
    await expect(page.getByLabel(/URL da página/i)).toBeVisible();
    await expect(page.getByLabel(/Setor/i)).toBeVisible();
  });

  test("/api/health responde ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { ok?: boolean };
    expect(json.ok).toBe(true);
  });
});
