import request from 'supertest';
import app from '../src/index';
import { AuthService } from '../src/services/AuthService';
import { DEFAULT_USER_PASSWORD } from '../src/config/auth';
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

  describe('Création utilisateur avec mot de passe par défaut', () => {
    it('un bibliothécaire peut créer un utilisateur sans mot de passe', async () => {
      const biblio = await createTestBibliothecaire();
      const token = authService.generateToken(biblio);
      const email = `default-pwd-${Date.now()}@test.com`;

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nom: 'Nouveau',
          prenom: 'Lecteur',
          email,
          role: 'LECTEUR',
        });

      expect(res.status).toBe(201);
      expect(res.body.mustChangePassword).toBe(true);
      expect(res.body.emailSent).toBe(true);
    });

    it('refuse la création sans authentification biblio', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          nom: 'Anonyme',
          prenom: 'User',
          email: `anon-${Date.now()}@test.com`,
        });

      expect(res.status).toBe(401);
    });

    it('refuse l\'inscription publique avec mot de passe', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          nom: 'Public',
          prenom: 'User',
          email: `public-${Date.now()}@test.com`,
          password: 'secret123',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('Changement de mot de passe obligatoire', () => {
    it('bloque l\'accès tant que le mot de passe n\'est pas changé', async () => {
      const biblio = await createTestBibliothecaire();
      const biblioToken = authService.generateToken(biblio);
      const email = `must-change-${Date.now()}@test.com`;

      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${biblioToken}`)
        .send({ nom: 'Temp', prenom: 'User', email })
        .expect(201);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email, password: DEFAULT_USER_PASSWORD });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.user.mustChangePassword).toBe(true);

      const userToken = loginRes.body.token;

      const blocked = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(blocked.status).toBe(403);
      expect(blocked.body.mustChangePassword).toBe(true);

      const changeRes = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ currentPassword: DEFAULT_USER_PASSWORD, newPassword: 'newpass123' });

      expect(changeRes.status).toBe(200);
      expect(changeRes.body.mustChangePassword).toBe(false);
    });
  });
});
