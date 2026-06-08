import { seedDefaultBibliothecaire } from '../config/seed';
import { database } from '../config/database';

async function main() {
  const created = await seedDefaultBibliothecaire();

  if (!created) {
    console.log('Aucun compte créé (bibliothécaire déjà présent ou seed désactivé).');
  }
}

main()
  .then(() => {
    database.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erreur lors du seed :', error);
    database.close();
    process.exit(1);
  });
