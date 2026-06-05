import { test, expect } from '@playwright/test'

test.describe('Infra + Offline', () => {
  test('exibe status da infra e header sync', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Controle de Chumbo' })).toBeVisible()
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
