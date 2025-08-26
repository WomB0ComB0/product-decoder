/**
 * Copyright 2025 Mike Odnis
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

describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.logPageTitle() // Using our custom command to log the page title
  })

  it('should have semantic landmarks', () => {
    // Assert that key semantic elements exist
    cy.assertElementExists('main')
    cy.assertElementExists('header')
    cy.assertElementExists('footer')

    // Use our custom command to check if multiple elements are visible
    cy.assertAllVisible(['nav', 'main', 'footer'])
  })

  it('should have proper roles on interactive elements', () => {
    // Check navbar for proper a11y attributes
    cy.get('nav').should('have.attr', 'role', 'navigation')

    // Use our custom command to check accessibility of main section
    cy.checkSectionA11y('main')

    // Check that buttons have proper roles
    cy.get('button').each($button => {
      cy.wrap($button).should('have.attr', 'role', 'button')
    })
  })

  it('should have proper heading hierarchy', () => {
    // Check that there's exactly one h1 on the page
    cy.get('h1').should('have.length', 1)

    // Check that h2 elements exist for section headers
    cy.get('h2').should('exist')

    // Check that headings have proper contrast
    cy.get('h1, h2, h3, h4, h5, h6').should('be.visible')
  })

  it('should have alt text on images', () => {
    // Get all images and verify they have alt text
    cy.get('img').each($img => {
      cy.wrap($img).should('have.attr', 'alt')
    })
  })

  it('should have accessible form elements', () => {
    // If there are any forms, check for labels
    cy.get('form').each($form => {
      cy.wrap($form).find('input, textarea, select').each($input => {
        // Check if input has an id and a corresponding label
        cy.wrap($input).invoke('attr', 'id').then(id => {
          if (id) {
            cy.get(`label[for="${id}"]`).should('exist')
          }
        })
      })
    })
  })
})
