describe('Teste da phoebus para o FrontEnd', () => {
  it('Navegar pelo site até a parte de história e anos', () => {
    cy.viewport(1920, 1080);
    cy.visit('https://phoebus.com.br');

    cy.wait(3000);
    cy.get('[data-testid="linkElement"]').contains('HISTÓRIA').click();

    const testedosanos = [2000, 2010, 2020];

    cy.wait(3000);
    testedosanos.forEach((ano) => {
      cy.get('[data-testid="buttonContent"]').contains(ano).click({ scrollBehavior: false, force: true });
      cy.wait(1000);
      cy.get('[data-testid="slidesWrapper"][aria-live="polite"]').should('contain', ano);
      cy.screenshot(`historia-ano-${ano}`, { capture: 'viewport' });
    });
  });
});