const TEST_EMAIL_DOMAINS = ['@test.com', '@selenium.test'] as const;

const TEST_ISBN_PREFIXES = [
  '978-empr-',
  '978-biblio-',
  '978-dune-',
  '978-sel-',
] as const;

const TEST_BOOK_TITLES = new Set(['Emprunt Test', 'Test Biblio']);
const TEST_BOOK_TITLE_PREFIXES = ['Livre Selenium ', 'Biblio Book '] as const;

const JEST_ISBN_PATTERN = /^978-\d+-[\d.]+$/;

export function isTestEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  return TEST_EMAIL_DOMAINS.some((domain) => email.endsWith(domain));
}

export function isTestBook(
  titre: string | null | undefined,
  isbn: string | null | undefined
): boolean {
  if (isbn) {
    if (TEST_ISBN_PREFIXES.some((prefix) => isbn.startsWith(prefix))) {
      return true;
    }

    if (JEST_ISBN_PATTERN.test(isbn)) {
      return true;
    }
  }

  if (!titre) {
    return false;
  }

  if (TEST_BOOK_TITLES.has(titre)) {
    return true;
  }

  return TEST_BOOK_TITLE_PREFIXES.some((prefix) => titre.startsWith(prefix));
}
