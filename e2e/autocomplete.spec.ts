import { test, expect } from "@playwright/test";

// Default settings (see src/lib/types.ts): Cheese types dataset, Combined
// strategy, Worker Mode on, 400ms debounce, minChars 3. "Brie" is a real
// entry in that dataset with no prefix match for the typo "Brei" but a close
// (normalized Levenshtein 0.5) fuzzy match, so it's used throughout to
// distinguish Prefix from Fuzzy behavior.

test("hides suggestions below minChars and shows them once reached", async ({
  page,
}) => {
  await page.goto("/");
  const input = page.getByRole("combobox");

  await input.fill("Br");
  await expect(page.getByRole("listbox")).not.toBeVisible();

  await input.fill("Bri");
  await expect(
    page.getByRole("option", { name: "Brie", exact: true }),
  ).toBeVisible();
});

test.describe("matching strategies", () => {
  test("Prefix Match returns exact-prefix matches and nothing for a typo", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("radio", { name: "Prefix Match" }).check();
    const input = page.getByRole("combobox");

    await input.fill("Bri");
    await expect(
      page.getByRole("option", { name: "Brie", exact: true }),
    ).toBeVisible();

    await input.fill("Brei");
    await expect(page.getByRole("listbox")).not.toBeVisible();
  });

  test("Fuzzy Match tolerates a typo that isn't a valid prefix", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("radio", { name: "Fuzzy Match" }).check();
    const input = page.getByRole("combobox");

    await input.fill("Brei");
    await expect(
      page.getByRole("option", { name: "Brie", exact: true }),
    ).toBeVisible();
  });

  test("Combined tries Prefix first and only falls back to Fuzzy when Prefix finds nothing", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("radio", { name: /^Combined/ }).check();
    const input = page.getByRole("combobox");

    // Fuzzy Match only sorts its candidates (see src/lib/matching.ts), so a
    // "sortStart" entry in the Event log is a reliable signal that Prefix
    // Match came up empty and the Fuzzy fallback actually ran.
    await input.fill("Bri");
    await expect(
      page.getByRole("option", { name: "Brie", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".event-log-entry--sortStart")).toHaveCount(0);

    await input.fill("Brei");
    await expect(
      page.getByRole("option", { name: "Brie", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".event-log-entry--sortStart")).toHaveCount(1);
  });
});

test("switching Size Tier swaps in that tier's real dataset", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("radio", { name: /^World cities/ }).check();

  await page.getByRole("combobox").fill("Mosc");
  await expect(
    page.getByRole("option", { name: "Moscow, RU", exact: true }),
  ).toBeVisible();
});

test("Worker Mode off still resolves a Fuzzy Match typo, running synchronously on the main thread", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "Fuzzy Match" }).check();
  const workerModeCheckbox = page.getByRole("checkbox", {
    name: "Run fuzzy matching in a Web Worker",
  });
  await expect(workerModeCheckbox).toBeChecked();
  await workerModeCheckbox.uncheck();

  await page.getByRole("combobox").fill("Brei");
  await expect(
    page.getByRole("option", { name: "Brie", exact: true }),
  ).toBeVisible();
});

test("settings round-trip through the URL across a reload", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "Fuzzy Match" }).check();
  await expect(page).toHaveURL(/strategy=fuzzy/);

  await page.reload();
  await expect(page.getByRole("radio", { name: "Fuzzy Match" })).toBeChecked();
});

test("Steal It prompt reflects the current settings", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-write"]);
  await page.goto("/");
  const promptBox = page.locator(".steal-it-prompt");

  await expect(promptBox).toContainText(
    "Combined — Prefix Match first, falling back to Fuzzy Match when it finds nothing",
  );

  await page.getByRole("radio", { name: "Prefix Match" }).check();
  await expect(promptBox).toContainText(
    "Prefix Match only (case-insensitive startsWith)",
  );

  await page.getByRole("button", { name: "Copy prompt" }).click();
  await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();
});
