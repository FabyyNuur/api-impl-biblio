// Configuration pour les tests
import { database } from '../src/config/database';

beforeAll(async () => {
  // Initialisation de la base de données de test
});

afterAll(async () => {
  // Nettoyage après les tests
  database.close();
});
function beforeAll(arg0: () => Promise<void>) {
    throw new Error('Function not implemented.');
}

function afterAll(arg0: () => Promise<void>) {
    throw new Error('Function not implemented.');
}

