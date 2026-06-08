Feature: Contrôle d'accès par rôle

  Background:
    * def uniqueId = java.util.UUID.randomUUID().toString()
    * def lecteurEmail = 'lecteur-' + uniqueId + '@test.com'
    * def testPassword = lecteurPassword
    * def biblioLogin = call read('classpath:com/biblio/karate/common/login.feature') { email: '#(biblioEmail)', password: '#(biblioPassword)' }
    * def biblioToken = biblioLogin.token
    * def lecteur = call read('classpath:com/biblio/karate/common/create-and-activate-lecteur.feature') { nom: 'Lecteur', prenom: 'Test', email: '#(lecteurEmail)', password: '#(testPassword)' }
    * def lecteurToken = lecteur.loginResult.token

  Scenario: Un lecteur ne peut pas lister tous les utilisateurs
    Given url baseUrl + '/api/users'
    And header Authorization = 'Bearer ' + lecteurToken
    When method get
    Then status 403

  Scenario: Un bibliothécaire peut lister tous les utilisateurs
    Given url baseUrl + '/api/users'
    And header Authorization = 'Bearer ' + biblioToken
    When method get
    Then status 200
    And match response == '#[]'

  Scenario: Un lecteur ne peut pas créer un livre
    Given url baseUrl + '/api/books'
    And header Authorization = 'Bearer ' + lecteurToken
    * def testIsbn = '978-test-' + uniqueId
    And request { titre: 'Test', auteur: 'Auteur', isbn: '#(testIsbn)', anneePublication: 2020, genre: 'Test' }
    When method post
    Then status 403

  Scenario: Un bibliothécaire peut créer un livre
    Given url baseUrl + '/api/books'
    And header Authorization = 'Bearer ' + biblioToken
    * def biblioIsbn = '978-biblio-' + uniqueId
    And request { titre: 'Test Biblio', auteur: 'Auteur', isbn: '#(biblioIsbn)', anneePublication: 2020, genre: 'Test', nombreExemplaires: 1 }
    When method post
    Then status 201

  Scenario: Token invalide retourne 401
    Given url baseUrl + '/api/auth/me'
    And header Authorization = 'Bearer invalid-token'
    When method get
    Then status 401
