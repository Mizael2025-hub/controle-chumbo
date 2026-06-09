import { test, expect } from '@playwright/test'

test.describe('Infra + Offline', () => {
  test('exibe status da infra e sync na sidebar (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await expect(page.getByTestId('app-sidebar')).toBeVisible()
    await expect(page.getByTestId('infra-usuario')).toBeVisible()
    await expect(page.getByTestId('infra-data-source')).toHaveText('local')
    await expect(page.getByTestId('sync-status')).toBeVisible()
  })

  test('permite trocar perfil mock em dev', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('btn-mock-operador').click()
    await expect(page.getByTestId('infra-role')).toHaveText('operador')
    await expect(page.getByTestId('infra-usuario')).toHaveText('Operador Setor')
  })
})

test.describe('Navegação', () => {
  test('sidebar visível no desktop e dock oculto', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/estoque')
    await expect(page.getByTestId('app-sidebar')).toBeVisible()
    await expect(page.getByTestId('app-tab-bar')).toBeHidden()
    await expect(page.getByTestId('nav-estoque')).toBeVisible()
  })

  test('dock flutuante visível no mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/estoque')
    await expect(page.locator('#app-dock-root')).toBeAttached()
    await expect(page.getByTestId('app-tab-bar')).toBeVisible()
    await expect(page.getByTestId('app-sidebar')).toBeHidden()
  })

  test('menu + admin exibe contagem, entrada e consumo', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/estoque')
    await page.getByTestId('nav-add-btn').click()
    await expect(page.getByTestId('nav-add-menu-web')).toBeVisible()
    await expect(page.getByTestId('nav-add-contagem')).toBeVisible()
    await expect(page.getByTestId('nav-add-entrada')).toBeVisible()
    await expect(page.getByTestId('nav-add-consumo')).toBeVisible()
  })

  test('menu + operador oculta entrada', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.getByTestId('btn-mock-operador').click()
    await page.goto('/estoque')
    await page.getByTestId('nav-add-btn').click()
    await expect(page.getByTestId('nav-add-menu-mobile')).toBeVisible()
    await expect(page.getByTestId('nav-add-contagem')).toBeVisible()
    await expect(page.getByTestId('nav-add-consumo')).toBeVisible()
    await expect(page.getByTestId('nav-add-entrada')).toBeHidden()
  })
})
