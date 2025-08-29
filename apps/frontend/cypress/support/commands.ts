/**
 * Copyright 2025 Product Decoder
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
