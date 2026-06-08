import request from 'supertest';
import app from '../src/index';

describe('API REST', () => {
  describe('Health', () => {
    it('GET /health devrait retourner OK', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
    });
  });

  describe('Utilisateurs', () => {
    it('POST /api/users - créer un utilisateur', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ nom: 'Durand', prenom: 'Marie', email: 'marie@test.com' });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('marie@test.com');
    });

    it('POST /api/users - rejette les champs manquants', async () => {
      const res = await request(app).post('/api/users').send({ nom: 'Test' });
      expect(res.status).toBe(400);
    });

    it('POST /api/users - rejette un email dupliqué', async () => {
      await request(app)
        .post('/api/users')
        .send({ nom: 'A', prenom: 'B', email: 'dup@test.com' });

      const res = await request(app)
        .post('/api/users')
        .send({ nom: 'C', prenom: 'D', email: 'dup@test.com' });

      expect(res.status).toBe(409);
    });

    it('GET /api/users/:id - récupérer un utilisateur', async () => {
      const created = await request(app)
        .post('/api/users')
        .send({ nom: 'Test', prenom: 'User', email: 'get@test.com' });

      const res = await request(app).get(`/api/users/${created.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe('get@test.com');
    });

    it('GET /api/users/:id - 404 si inexistant', async () => {
      const res = await request(app).get('/api/users/inexistant');
      expect(res.status).toBe(404);
    });

    it('PUT /api/users/:id - mettre à jour', async () => {
      const created = await request(app)
        .post('/api/users')
        .send({ nom: 'Old', prenom: 'Name', email: 'update@test.com' });

      const res = await request(app)
        .put(`/api/users/${created.body.id}`)
        .send({ nom: 'New' });

      expect(res.status).toBe(200);
      expect(res.body.nom).toBe('New');
    });

    it('DELETE /api/users/:id - supprimer', async () => {
      const created = await request(app)
        .post('/api/users')
        .send({ nom: 'Del', prenom: 'User', email: 'del@test.com' });

      const res = await request(app).delete(`/api/users/${created.body.id}`);
      expect(res.status).toBe(204);
    });
  });

  describe('Livres', () => {
    const bookPayload = {
      titre: 'Dune',
      auteur: 'Frank Herbert',
      isbn: '978-dune',
      anneePublication: 1965,
      genre: 'SF',
      nombreExemplaires: 2
    };

    it('POST /api/books - créer un livre', async () => {
      const res = await request(app).post('/api/books').send(bookPayload);
      expect(res.status).toBe(201);
      expect(res.body.titre).toBe('Dune');
    });

    it('GET /api/books/available - livres disponibles', async () => {
      await request(app).post('/api/books').send(bookPayload);
      const res = await request(app).get('/api/books/available');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/books/search?q= - recherche', async () => {
      await request(app).post('/api/books').send(bookPayload);
      const res = await request(app).get('/api/books/search').query({ q: 'Dune' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('GET /api/books/search - 400 sans paramètre q', async () => {
      const res = await request(app).get('/api/books/search');
      expect(res.status).toBe(400);
    });

    it('DELETE /api/books/:id - supprimer', async () => {
      const created = await request(app).post('/api/books').send({
        ...bookPayload,
        isbn: '978-del'
      });
      const res = await request(app).delete(`/api/books/${created.body.id}`);
      expect(res.status).toBe(204);
    });
  });

  describe('Emprunts', () => {
    async function setupEmprunt() {
      const user = await request(app)
        .post('/api/users')
        .send({ nom: 'Empr', prenom: 'User', email: `empr-${Date.now()}@test.com` });
      const book = await request(app)
        .post('/api/books')
        .send({
          titre: 'Emprunt Test',
          auteur: 'Auteur',
          isbn: `978-${Date.now()}`,
          anneePublication: 2020,
          genre: 'Test',
          nombreExemplaires: 1
        });
      return { user: user.body, book: book.body };
    }

    it('POST /api/emprunts - emprunter un livre', async () => {
      const { user, book } = await setupEmprunt();
      const res = await request(app)
        .post('/api/emprunts')
        .send({ utilisateurId: user.id, livreId: book.id });

      expect(res.status).toBe(201);
      expect(res.body.statut).toBe('EN_COURS');
    });

    it('PATCH /api/emprunts/:id/retour - retourner un livre', async () => {
      const { user, book } = await setupEmprunt();
      const emprunt = await request(app)
        .post('/api/emprunts')
        .send({ utilisateurId: user.id, livreId: book.id });

      const res = await request(app).patch(`/api/emprunts/${emprunt.body.id}/retour`);
      expect(res.status).toBe(200);
      expect(res.body.statut).toBe('RETOURNE');
    });

    it('GET /api/emprunts/en-cours', async () => {
      const { user, book } = await setupEmprunt();
      await request(app)
        .post('/api/emprunts')
        .send({ utilisateurId: user.id, livreId: book.id });

      const res = await request(app).get('/api/emprunts/en-cours');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('GET /api/users/:userId/emprunts', async () => {
      const { user, book } = await setupEmprunt();
      await request(app)
        .post('/api/emprunts')
        .send({ utilisateurId: user.id, livreId: book.id });

      const res = await request(app).get(`/api/users/${user.id}/emprunts`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('GET /api/emprunts/historique', async () => {
      const { user, book } = await setupEmprunt();
      const emprunt = await request(app)
        .post('/api/emprunts')
        .send({ utilisateurId: user.id, livreId: book.id });
      await request(app).patch(`/api/emprunts/${emprunt.body.id}/retour`);

      const res = await request(app).get('/api/emprunts/historique');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('Routes inexistantes', () => {
    it('devrait retourner 404', async () => {
      const res = await request(app).get('/api/inexistant');
      expect(res.status).toBe(404);
    });
  });
});
