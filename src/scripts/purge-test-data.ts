import { database } from '../config/database';
import { UserService } from '../services/UserService';
import { BookService } from '../services/BookService';
import { EmpruntService } from '../services/EmpruntService';
import { isTestBook, isTestEmail } from '../utils/testDataPatterns';

async function purgeTestData(): Promise<void> {
  await database.ready();

  const userService = new UserService();
  const bookService = new BookService();
  const empruntService = new EmpruntService();

  const users = await userService.getAllUsers();
  const books = await bookService.getAllBooks();

  const testUserIds = new Set(
    users.filter((user) => isTestEmail(user.email)).map((user) => user.id)
  );
  const testBookIds = new Set(
    books
      .filter((book) => isTestBook(book.titre, book.isbn))
      .map((book) => book.id)
  );

  const empruntsEnCours = await empruntService.getAllEmpruntsEnCours();
  const empruntsEnRetard = await empruntService.getEmpruntsEnRetard();

  let returned = 0;
  for (const emprunt of [...empruntsEnCours, ...empruntsEnRetard]) {
    const linkedToTestData =
      testUserIds.has(emprunt.utilisateurId) ||
      testBookIds.has(emprunt.livreId) ||
      isTestEmail(emprunt.utilisateur?.email) ||
      isTestBook(emprunt.livre?.titre, emprunt.livre?.isbn);

    if (!linkedToTestData) {
      continue;
    }

    if (emprunt.statut === 'EN_COURS') {
      await empruntService.returnBook(emprunt.id);
      returned++;
      continue;
    }

    await database.run(
      `UPDATE emprunts
       SET statut = 'RETOURNE', dateRetourEffectif = COALESCE(dateRetourEffectif, ?)
       WHERE id = ?`,
      [new Date().toISOString(), emprunt.id]
    );
    returned++;
  }

  let empruntsDeleted = 0;
  if (testUserIds.size > 0 || testBookIds.size > 0) {
    const conditions: string[] = [];
    const params: string[] = [];

    if (testUserIds.size > 0) {
      conditions.push(
        `utilisateurId IN (${[...testUserIds].map(() => '?').join(', ')})`
      );
      params.push(...testUserIds);
    }

    if (testBookIds.size > 0) {
      conditions.push(`livreId IN (${[...testBookIds].map(() => '?').join(', ')})`);
      params.push(...testBookIds);
    }

    const result = await database.run(
      `DELETE FROM emprunts WHERE ${conditions.join(' OR ')}`,
      params
    );
    empruntsDeleted = result.changes ?? 0;
  }

  let usersDeleted = 0;
  for (const userId of testUserIds) {
    try {
      const deleted = await userService.deleteUser(userId);
      if (deleted) {
        usersDeleted++;
      }
    } catch (error) {
      console.warn(`Utilisateur ${userId} non supprimé :`, (error as Error).message);
    }
  }

  let booksDeleted = 0;
  for (const bookId of testBookIds) {
    try {
      const deleted = await bookService.deleteBook(bookId);
      if (deleted) {
        booksDeleted++;
      }
    } catch (error) {
      console.warn(`Livre ${bookId} non supprimé :`, (error as Error).message);
    }
  }

  console.log('Nettoyage des données de test terminé :');
  console.log(`  Emprunts clôturés : ${returned}`);
  console.log(`  Emprunts supprimés : ${empruntsDeleted}`);
  console.log(`  Utilisateurs supprimés : ${usersDeleted}/${testUserIds.size}`);
  console.log(`  Livres supprimés : ${booksDeleted}/${testBookIds.size}`);
}

purgeTestData()
  .then(() => {
    database.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erreur lors du nettoyage des données de test :', error);
    database.close();
    process.exit(1);
  });
