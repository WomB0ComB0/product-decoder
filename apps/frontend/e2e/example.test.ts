import { test, expect } from '@playwright/test';

/**
 * FAQ section test suite
 * Testing the FAQ accordion functionality
 */
test.describe('FAQ Section', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage and scroll to FAQ section
    await page.goto('/');
    await page.locator('text=FAQ').scrollIntoViewIfNeeded();
  });

  test('displays FAQ section with correct title', async ({ page }) => {
    // Check for the FAQ section heading
    await expect(page.locator('section#faq h2, [id="faq"] h2')).toBeVisible();

    // Verify the heading contains the expected text
    const headingText = await page.locator('section#faq h2, [id="faq"] h2').textContent();
    expect(headingText).toContain('Questions');
  });

  test('displays multiple FAQ items', async ({ page }) => {
    // Look for accordion items in the FAQ section
    const accordionItems = page.locator('[class*="Accordion"] [class*="AccordionItem"], [role="region"]');

    // Verify there are multiple FAQ items (at least 3)
    await expect(accordionItems).toHaveCount({ min: 3 });
  });

  test('expands and collapses FAQ items when clicked', async ({ page }) => {
    // Find all accordion triggers/questions
    const accordionTriggers = page.locator('[class*="AccordionTrigger"], [role="button"][aria-expanded]');

    // Get the first FAQ trigger
    const firstTrigger = accordionTriggers.first();
    await expect(firstTrigger).toBeVisible();

    // First, make sure it's collapsed
    // We'll use aria-expanded attribute to check state
    let isExpanded = await firstTrigger.getAttribute('aria-expanded');
    if (isExpanded === 'true') {
      // If it's already expanded, click to collapse it first
      await firstTrigger.click();
      await page.waitForTimeout(300); // Wait for animation
    }

    // Now click to expand
    await firstTrigger.click();
    await page.waitForTimeout(300); // Wait for animation

    // Verify it's expanded now
    isExpanded = await firstTrigger.getAttribute('aria-expanded');
    expect(isExpanded).toBe('true');

    // Find the content panel that should be visible
    const contentPanel = page.locator('[class*="AccordionContent"][data-state="open"], [role="region"]:visible');
    await expect(contentPanel).toBeVisible();

    // Click again to collapse
    await firstTrigger.click();
    await page.waitForTimeout(300); // Wait for animation

    // Verify it's collapsed
    isExpanded = await firstTrigger.getAttribute('aria-expanded');
    expect(isExpanded).toBe('false');
  });

  test('contains specific frequently asked questions', async ({ page }) => {
    // Common FAQs we expect to find
    const expectedQuestions = [
      'What is a hackathon',
      'Who can participate',
      'Do I need to know how to code',
      'Do I need to have a team'
    ];

    // Check if at least one of these questions exists in the FAQ
    let foundQuestion = false;

    for (const question of expectedQuestions) {
      const questionElement = page.locator(`text=${question}`, { exact: false });

      if (await questionElement.count() > 0) {
        foundQuestion = true;

        // Click to expand this question
        await questionElement.click();
        await page.waitForTimeout(300); // Wait for animation

        // Verify the answer is visible
        const answer = questionElement.locator('xpath=..').locator('xpath=following-sibling::*');
        await expect(answer).toBeVisible();

        break;
      }
    }

    // Assert that we found at least one of the expected questions
    expect(foundQuestion).toBe(true);
  });

  test('shows contact information for additional questions', async ({ page }) => {
    // Look for contact information section
    const contactSection = page.locator('text=Still have questions', { exact: false });
    await expect(contactSection).toBeVisible();

    // Check for email link
    const emailLink = page.locator('a[href^="mailto:"]');
    await expect(emailLink).toBeVisible();

    // Verify it's the correct email
    const emailHref = await emailLink.getAttribute('href');
    expect(emailHref).toContain('ferdt4@farmingdale.edu');
  });
});
