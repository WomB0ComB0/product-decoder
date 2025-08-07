// Define custom commands
Cypress.Commands.add('scrollToSection', (sectionName: string) => {
  cy.contains(sectionName).scrollIntoView()
  cy.contains(sectionName).should('be.visible')
})

// Custom command to check if an element exists
Cypress.Commands.add('assertElementExists', (selector: string) => {
  cy.get(selector).should('exist')
})

// Custom command to check visibility of multiple elements
Cypress.Commands.add('assertAllVisible', (selectors: string[]) => {
  selectors.forEach(selector => {
    cy.get(selector).should('be.visible')
  })
})

// Custom command to log page title
Cypress.Commands.add('logPageTitle', () => {
  cy.title().then(title => {
    cy.task('log', `Current page title: ${title}`)
  })
})

// Custom command to check a11y of a section
Cypress.Commands.add('checkSectionA11y', (sectionSelector: string) => {
  cy.get(sectionSelector).should('have.attr', 'role').then(role => {
    cy.task('log', `Section has role: ${role}`)
  })
})
