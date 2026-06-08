import { seedBooks } from '../config/seedBooks';
import { database } from '../config/database';

async function main() {
  const force = process.argv.includes('--force');

  if (force) {
    console.log('Mode --force : les livres existants (même ISBN) seront recréés.');
  }

  const result = await seedBooks(force);

  console.log(`Seed livres terminé : ${result.created} créé(s), ${result.skipped} ignoré(s) (déjà présents), ${result.total} au total dans le jeu de données.`);
}

main()
  .then(() => {
    database.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erreur lors du seed des livres :', error);
    database.close();
    process.exit(1);
  });
