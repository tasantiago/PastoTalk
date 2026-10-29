import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
async function navigate(page: Page, name: string) {
  await page.getByRole('navigation', { name: 'Menu principal' }).waitFor({ state: 'attached' });
  const menu = page.getByRole('button', { name: 'Abrir menu' });
  if (await menu.isVisible()) {
    if ((await menu.getAttribute('aria-expanded')) !== 'true') await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
  }
  await page
    .getByRole('navigation', { name: 'Menu principal' })
    .getByRole('link', { name, exact: true })
    .click();
}
async function logout(page: Page) {
  await page.getByRole('navigation', { name: 'Menu principal' }).waitFor({ state: 'attached' });
  const menu = page.getByRole('button', { name: 'Abrir menu' });
  if (await menu.isVisible()) {
    if ((await menu.getAttribute('aria-expanded')) !== 'true') await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
  }
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page).toHaveURL(/login/);
}
async function login(page: Page, user: { username: string; password: string }) {
  await page.goto('/login');
  await page.getByLabel('Usuário', { exact: true }).fill(user.username);
  await page.getByLabel('Senha', { exact: true }).fill(user.password);
  await page.getByRole('button', { name: 'Entrar na minha conta' }).click();
  await expect(page).toHaveURL(/dashboard/);
}
test('cadastro, propriedade, lançamentos, edição, sessão e saída', async ({ page }, info) => {
  const username = `browser_${Date.now()}_${info.project.name}`;
  await page.goto('/register');
  await page.getByLabel('Seu nome').fill('Marina Teste');
  await page.getByLabel('E-mail').fill(`${username}@example.com`);
  await page.getByLabel('Usuário', { exact: true }).fill(username);
  await page.getByLabel('Senha', { exact: true }).fill('test-password-123');
  await page.getByRole('button', { name: 'Criar conta e entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Dê um lugar aos seus planos.' })).toBeVisible();
  await navigate(page, 'Propriedades');
  await page.getByRole('button', { name: '+ Adicionar propriedade' }).click();
  await page.getByLabel('Nome da propriedade').fill('Fazenda Boa Vista');
  await page.getByLabel('Endereço / localização').fill('Zona rural · Porto Velho, RO');
  await page.getByRole('button', { name: 'Salvar propriedade' }).click();
  await expect(page.getByRole('cell', { name: 'Fazenda Boa Vista', exact: true })).toBeVisible();
  await navigate(page, 'Produção de leite');
  await page.getByRole('button', { name: '+ Adicionar produção' }).click();
  await page.getByLabel('Quantidade (litros)').fill('120.5');
  await page.getByRole('button', { name: 'Salvar produção' }).click();
  await expect(page.getByRole('cell', { name: '120,5 L', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Editar produção' }).click();
  await page.getByLabel('Quantidade (litros)').fill('150.5');
  await page.getByRole('button', { name: 'Salvar produção' }).click();
  await expect(page.getByRole('cell', { name: '150,5 L', exact: true })).toBeVisible();
  for (const [menu, singular, description, value] of [
    ['Receitas', 'receita', 'Venda de leite', '350.25'],
    ['Despesas', 'despesa', 'Ração do rebanho', '80.15'],
  ]) {
    await navigate(page, menu);
    await page.getByRole('button', { name: `+ Adicionar ${singular}` }).click();
    await page.getByRole('textbox', { name: 'Descrição', exact: true }).fill(description);
    await page.getByLabel('Valor total (R$)').fill(value);
    await page.getByRole('button', { name: `Salvar ${singular}` }).click();
    await expect(page.getByRole('cell', { name: description, exact: true })).toBeVisible();
  }
  await navigate(page, 'Visão geral');
  await expect(page.getByText('150,5 L', { exact: true })).toBeVisible();
  await expect(page.getByText('R$ 270,10', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('150,5 L', { exact: true })).toBeVisible();
  await expect(page.locator('body')).toHaveJSProperty(
    'scrollWidth',
    await page.evaluate(() => window.innerWidth),
  );
  await page.screenshot({ path: `test-results/painel-${info.project.name}.png`, fullPage: true });
  await logout(page);
  await page.goto('/animals');
  await expect(page).toHaveURL(/login/);
});
test('login inválido não abre a área protegida', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Usuário', { exact: true }).fill('unknown-user');
  await page.getByLabel('Senha', { exact: true }).fill('invalid-password');
  await page.getByRole('button', { name: 'Entrar na minha conta' }).click();
  await expect(page.getByRole('alert')).toContainText('usuário ou senha incorretos');
  await expect(page).toHaveURL(/login/);
});
test('equipe: inclusão, papéis, consulta, colaboração e remoção', async ({ page }, info) => {
  const suffix = `${Date.now()}_${info.project.name}`;
  const users = ['admin', 'member'].map((role) => ({
    name: role === 'admin' ? 'Ana Administradora' : 'João Colaborador',
    username: `${role}_${suffix}`,
    email: `${role}_${suffix}@example.com`,
    password: 'test-password-123',
  }));
  for (const user of users)
    expect((await page.request.post('/api/users', { data: user })).status()).toBe(201);
  const loginData = (i: number) => ({ username: users[i].username, password: users[i].password });
  const session = await (await page.request.post('/api/login', { data: loginData(0) })).json();
  const headers = { Authorization: `Bearer ${session.token}` };
  const response = await page.request.post('/api/locations', {
    headers,
    data: { name: 'Fazenda Compartilhada', address: 'Zona rural', dairyCattle: true },
  });
  expect(response.status()).toBe(201);
  const location = await response.json();
  await login(page, users[0]);
  await navigate(page, 'Equipe');
  await expect(page.getByText('Último administrador', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '+ Adicionar membro' }).click();
  await page.getByLabel('Nome de usuário').fill(users[1].username);
  await page.getByRole('button', { name: 'Adicionar membro', exact: true }).click();
  await expect(page.getByRole('cell', { name: users[1].username, exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('cell', { name: users[1].username, exact: true })).toBeVisible();
  await expect(page.locator('body')).toHaveJSProperty(
    'scrollWidth',
    await page.evaluate(() => window.innerWidth),
  );
  await page.screenshot({ path: `test-results/equipe-${info.project.name}.png`, fullPage: true });
  await logout(page);
  await login(page, users[1]);
  await navigate(page, 'Equipe');
  await expect(page.getByText('Seu acesso: Somente leitura')).toBeVisible();
  await expect(page.getByRole('button', { name: '+ Adicionar membro' })).toHaveCount(0);
  await navigate(page, 'Produção de leite');
  await expect(page.getByText(/Seu acesso é somente leitura/)).toBeVisible();
  await expect(page.getByRole('button', { name: '+ Adicionar produção' })).toHaveCount(0);
  await navigate(page, 'Propriedades');
  await expect(page.getByRole('button', { name: 'Editar Fazenda Compartilhada' })).toHaveCount(0);
  await logout(page);
  await login(page, users[0]);
  await navigate(page, 'Equipe');
  await page.getByRole('button', { name: `Alterar acesso de ${users[1].username}` }).click();
  await page.getByRole('dialog').locator('.ant-select-selector').click();
  await page
    .locator('.ant-select-item-option-content')
    .getByText('Colaborador', { exact: true })
    .click();
  await page.getByRole('button', { name: 'Salvar acesso', exact: true }).click();
  await expect(
    page
      .getByRole('row')
      .filter({ hasText: users[1].username })
      .getByText('Colaborador', { exact: true }),
  ).toBeVisible();
  await logout(page);
  await login(page, users[1]);
  await navigate(page, 'Equipe');
  await expect(page.getByText('Seu acesso: Colaborador')).toBeVisible();
  await expect(page.getByRole('button', { name: '+ Adicionar membro' })).toHaveCount(0);
  await navigate(page, 'Produção de leite');
  await page.getByRole('button', { name: '+ Adicionar produção' }).click();
  await page.getByLabel('Quantidade (litros)').fill('32.5');
  await page.getByRole('button', { name: 'Salvar produção' }).click();
  await expect(page.getByRole('cell', { name: '32,5 L', exact: true })).toBeVisible();
  await logout(page);
  await login(page, users[0]);
  await navigate(page, 'Equipe');
  await page.getByRole('button', { name: `Remover ${users[1].username}`, exact: true }).click();
  await page.getByRole('button', { name: 'Remover', exact: true }).click();
  await expect(page.getByRole('cell', { name: users[1].username, exact: true })).toHaveCount(0);
  await logout(page);
  await login(page, users[1]);
  await navigate(page, 'Produção de leite');
  await expect(page.getByText('Primeiro, cadastre uma propriedade para começar.')).toBeVisible();
  const memberSession = await (
    await page.request.post('/api/login', { data: loginData(1) })
  ).json();
  expect(
    (
      await page.request.get(`/api/locations/${location.id}/milk-productions`, {
        headers: { Authorization: `Bearer ${memberSession.token}` },
      })
    ).status(),
  ).toBe(404);
});
