import request from 'supertest';
import app from '../src/index';
import { AuthService } from '../src/services/AuthService';
import { createTestUser, createTestBibliothecaire } from './helpers';

describe('Authentification', () => {
  const authService = new AuthService();

  describe('POST /api/auth/login', () => {
    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const user = await createTestUser({ email: 'login@test.com', password: 'mypass' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@test.com', password: 'mypass' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.id).toBe(user.id);
      expect(res.body.user.email).toBe('login@test.com');
    });

    it('devrait rejeter des identifiants incorrects', async () => {
      await createTestUser({ email: 'wrong@test.com', password: 'mypass' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@test.com', password: 'badpass' });

      expect(res.status).toBe(401);
    });

    it('devrait rejeter un compte inactif', async () => {
      const user = await createTestUser({ email: 'inactive@test.com', password: 'mypass' });
      const { UserService } = await import('../src/services/UserService');
      const userService = new UserService();
      await userService.updateUser(user.id, { actif: false });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'inactive@test.com', password: 'mypass' });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/auth/me', () => {
    it('devrait retourner le profil de l\'utilisateur connecté', async () => {
      const user = await createTestUser({ email: 'me@test.com' });
      const token = authService.generateToken(user);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('me@test.com');
    });

    it('devrait rejeter sans token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('Routes protégées', () => {
    it('un lecteur ne peut pas lister tous les utilisateurs', async () => {
      const lecteur = await createTestUser();
      const token = authService.generateToken(lecteur);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('un bibliothécaire peut lister tous les utilisateurs', async () => {
      const biblio = await createTestBibliothecaire();
      const token = authService.generateToken(biblio);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('un lecteur ne peut pas créer un livre', async () => {
      const lecteur = await createTestUser();
      const token = authService.generateToken(lecteur);

      const res = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titre: 'Test',
          auteur: 'Auteur',
          isbn: '978-test',
          anneePublication: 2020,
          genre: 'Test'
        });

      expect(res.status).toBe(403);
    });

    it('un bibliothécaire peut créer un livre', async () => {
      const biblio = await createTestBibliothecaire();
      const token = authService.generateToken(biblio);

      const res = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titre: 'Test Biblio',
          auteur: 'Auteur',
          isbn: `978-biblio-${Date.now()}`,
          anneePublication: 2020,
          genre: 'Test',
          nombreExemplaires: 1
        });

      expect(res.status).toBe(201);
    });
  });
});
