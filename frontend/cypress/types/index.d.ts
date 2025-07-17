/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to scroll to a specific section by its name
     * @example cy.scrollToSection('About')
     */
    scrollToSection(sectionName: string): Chainable<JQuery<HTMLElement>>

    /**
     * Custom command to check if an element exists
     * @example cy.assertElementExists('.header')
     */
    assertElementExists(selector: string): Chainable<JQuery<HTMLElement>>

    /**
     * Custom command to check visibility of multiple elements
     * @example cy.assertAllVisible(['.header', '.footer'])
     */
    assertAllVisible(selectors: string[]): Chainable<JQuery<HTMLElement>>

    /**
     * Custom command to log page title
     * @example cy.logPageTitle()
     */
    logPageTitle(): Chainable<string>

    /**
     * Custom command to check accessibility attributes of a section
     * @example cy.checkSectionA11y('main')
     */
    checkSectionA11y(sectionSelector: string): Chainable<JQuery<HTMLElement>>
  }
}
