Feature: Gestion des emprunts

  Background:
    * def uniqueId = java.util.UUID.randomUUID().toString()
    * def empruntEmail = 'empr-' + uniqueId + '@test.com'
    * def testPassword = lecteurPassword
    * def biblioLogin = call read('classpath:com/biblio/karate/common/login.feature') { email: '#(biblioEmail)', password: '#(biblioPassword)' }
    * def biblioToken = biblioLogin.token

    # Créer un lecteur
    Given url baseUrl + '/api/users'
    And request { nom: 'Empr', prenom: 'User', email: '#(empruntEmail)', password: '#(testPassword)' }
    When method post
    Then status 201
    * def lecteurId = response.id

    * def userLogin = call read('classpath:com/biblio/karate/common/login.feature') { email: '#(empruntEmail)', password: '#(testPassword)' }
    * def userToken = userLogin.token

    # Créer un livre
    * def bookIsbn = '978-empr-' + uniqueId
    Given url baseUrl + '/api/books'
    And header Authorization = 'Bearer ' + biblioToken
    And request { titre: 'Emprunt Test', auteur: 'Auteur', isbn: '#(bookIsbn)', anneePublication: 2020, genre: 'Test', nombreExemplaires: 1 }
    When method post
    Then status 201
    * def bookId = response.id

  Scenario: POST /api/emprunts - emprunter un livre
    Given url baseUrl + '/api/emprunts'
    And header Authorization = 'Bearer ' + userToken
    And request { livreId: '#(bookId)' }
    When method post
    Then status 201
    And match response.statut == 'EN_COURS'
    * def empruntId = response.id

  Scenario: POST /api/emprunts - refuse un emprunt pour un bibliothécaire
    Given url baseUrl + '/api/emprunts'
    And header Authorization = 'Bearer ' + biblioToken
    And request { livreId: '#(bookId)', utilisateurId: '#(biblioLogin.userId)' }
    When method post
    Then status 400
    And match response.error contains 'lecteurs'

  Scenario: PATCH /api/emprunts/:id/retour - retourner un livre
    Given url baseUrl + '/api/emprunts'
    And header Authorization = 'Bearer ' + userToken
    And request { livreId: '#(bookId)' }
    When method post
    Then status 201
    * def empruntId = response.id

    Given url baseUrl + '/api/emprunts/' + empruntId + '/retour'
    And header Authorization = 'Bearer ' + biblioToken
    When method patch
    Then status 200
    And match response.statut == 'RETOURNE'

  Scenario: GET /api/emprunts/en-cours (bibliothécaire)
    Given url baseUrl + '/api/emprunts'
    And header Authorization = 'Bearer ' + userToken
    And request { livreId: '#(bookId)' }
    When method post
    Then status 201

    Given url baseUrl + '/api/emprunts/en-cours'
    And header Authorization = 'Bearer ' + biblioToken
    When method get
    Then status 200
    * def empruntCount = karate.sizeOf(response)
    * assert empruntCount > 0

  Scenario: GET /api/users/:userId/emprunts
    Given url baseUrl + '/api/emprunts'
    And header Authorization = 'Bearer ' + userToken
    And request { livreId: '#(bookId)' }
    When method post
    Then status 201

    Given url baseUrl + '/api/users/' + lecteurId + '/emprunts'
    And header Authorization = 'Bearer ' + userToken
    When method get
    Then status 200
    * def empruntCount = karate.sizeOf(response)
    * assert empruntCount > 0

  Scenario: GET /api/emprunts/historique (bibliothécaire)
    Given url baseUrl + '/api/emprunts'
    And header Authorization = 'Bearer ' + userToken
    And request { livreId: '#(bookId)' }
    When method post
    Then status 201
    * def empruntId = response.id

    Given url baseUrl + '/api/emprunts/' + empruntId + '/retour'
    And header Authorization = 'Bearer ' + biblioToken
    When method patch
    Then status 200

    Given url baseUrl + '/api/emprunts/historique'
    And header Authorization = 'Bearer ' + biblioToken
    When method get
    Then status 200
    * def empruntCount = karate.sizeOf(response)
    * assert empruntCount > 0
