function fn() {
  var env = karate.env || 'local';
  var config = {
    baseUrl: 'http://localhost:3000',
    biblioEmail: 'admin@biblio.com',
    biblioPassword: 'secret123',
    lecteurPassword: 'secret123'
  };

  if (env === 'ci') {
    config.baseUrl = 'http://localhost:3000';
  }

  karate.configure('logPrettyRequest', true);
  karate.configure('logPrettyResponse', true);
  karate.configure('connectTimeout', 10000);
  karate.configure('readTimeout', 10000);

  return config;
}
