Feature: Gestion des utilisateurs

  Background:
    * def uniqueId = java.util.UUID.randomUUID().toString()
    * def testEmail = 'user-' + uniqueId + '@test.com'
    * def testPassword = lecteurPassword
    * def loginResult = call read('classpath:com/biblio/karate/common/login.feature') { email: '#(biblioEmail)', password: '#(biblioPassword)' }
    * def biblioToken = loginResult.token

  Scenario: POST /api/users - créer un utilisateur lecteur
    Given url baseUrl + '/api/users'
    And request { nom: 'Durand', prenom: 'Marie', email: '#(testEmail)', password: '#(testPassword)' }
    When method post
    Then status 201
    And match response.email == testEmail
    And match response.role == 'LECTEUR'

  Scenario: POST /api/users - rejette les champs manquants
    Given url baseUrl + '/api/users'
    And request { nom: 'Test' }
    When method post
    Then status 400

  Scenario: POST /api/users - rejette un email dupliqué
    Given url baseUrl + '/api/users'
    And request { nom: 'A', prenom: 'B', email: '#(testEmail)', password: '#(testPassword)' }
    When method post
    Then status 201

    Given url baseUrl + '/api/users'
    And request { nom: 'C', prenom: 'D', email: '#(testEmail)', password: '#(testPassword)' }
    When method post
    Then status 409

  Scenario: GET /api/users/:id - récupérer son propre profil
    Given url baseUrl + '/api/users'
    And request { nom: 'Get', prenom: 'User', email: '#(testEmail)', password: '#(testPassword)' }
    When method post
    Then status 201
    * def createdUserId = response.id

    * def userLogin = call read('classpath:com/biblio/karate/common/login.feature') { email: '#(testEmail)', password: '#(testPassword)' }
    Given url baseUrl + '/api/users/' + createdUserId
    And header Authorization = 'Bearer ' + userLogin.token
    When method get
    Then status 200
    And match response.email == testEmail

  Scenario: GET /api/users/:id - 404 si inexistant
    Given url baseUrl + '/api/users/inexistant'
    And header Authorization = 'Bearer ' + biblioToken
    When method get
    Then status 404

  Scenario: PUT /api/users/:id - mettre à jour son profil
    Given url baseUrl + '/api/users'
    And request { nom: 'Old', prenom: 'Name', email: '#(testEmail)', password: '#(testPassword)' }
    When method post
    Then status 201
    * def createdUserId = response.id

    * def userLogin = call read('classpath:com/biblio/karate/common/login.feature') { email: '#(testEmail)', password: '#(testPassword)' }
    Given url baseUrl + '/api/users/' + createdUserId
    And header Authorization = 'Bearer ' + userLogin.token
    And request { nom: 'New' }
    When method put
    Then status 200
    And match response.nom == 'New'

  Scenario: DELETE /api/users/:id - supprimer par bibliothécaire
    * def deleteEmail = 'del-' + uniqueId + '@test.com'
    Given url baseUrl + '/api/users'
    And request { nom: 'Del', prenom: 'User', email: '#(deleteEmail)', password: '#(testPassword)' }
    When method post
    Then status 201
    * def deleteUserId = response.id

    Given url baseUrl + '/api/users/' + deleteUserId
    And header Authorization = 'Bearer ' + biblioToken
    When method delete
    Then status 204

  Scenario: DELETE /api/users/:id - refuse la suppression de son propre compte biblio
    Given url baseUrl + '/api/users/' + loginResult.userId
    And header Authorization = 'Bearer ' + biblioToken
    When method delete
    Then status 403
    And match response.error contains 'propre compte'

  Scenario: PUT /api/users/:id - refuse la désactivation de son propre compte biblio
    Given url baseUrl + '/api/users/' + loginResult.userId
    And header Authorization = 'Bearer ' + biblioToken
    And request { actif: false }
    When method put
    Then status 403
    And match response.error contains 'propre compte'
