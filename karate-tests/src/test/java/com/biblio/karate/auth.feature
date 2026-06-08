Feature: Authentification

  Background:
    * def uniqueId = java.util.UUID.randomUUID().toString()
    * def testEmail = 'auth-' + uniqueId + '@test.com'
    * def testPassword = lecteurPassword

  Scenario: Login avec identifiants valides
    * def lecteur = call read('classpath:com/biblio/karate/common/create-and-activate-lecteur.feature') { nom: 'Auth', prenom: 'Test', email: '#(testEmail)', password: '#(testPassword)' }
    And match lecteur.loginResult.token == '#string'
    And match lecteur.loginResult.user.email == testEmail

  Scenario: Login avec identifiants incorrects
    * def lecteur = call read('classpath:com/biblio/karate/common/create-and-activate-lecteur.feature') { nom: 'Wrong', prenom: 'User', email: '#(testEmail)', password: '#(testPassword)' }

    Given url baseUrl + '/api/auth/login'
    And request { email: '#(testEmail)', password: 'badpass' }
    When method post
    Then status 401
    And match response.error == '#string'

  Scenario: Login compte inactif
    * def inactiveEmail = 'inactive-' + uniqueId + '@test.com'
    * def biblioLogin = call read('classpath:com/biblio/karate/common/login.feature') { email: '#(biblioEmail)', password: '#(biblioPassword)' }
    * def biblioToken = biblioLogin.token

    Given url baseUrl + '/api/users'
    And header Authorization = 'Bearer ' + biblioToken
    And request { nom: 'Inactive', prenom: 'User', email: '#(inactiveEmail)', role: 'LECTEUR' }
    When method post
    Then status 201
    * def inactiveUserId = response.id

    Given url baseUrl + '/api/users/' + inactiveUserId
    And header Authorization = 'Bearer ' + biblioToken
    And request { actif: false }
    When method put
    Then status 200

    Given url baseUrl + '/api/auth/login'
    And request { email: '#(inactiveEmail)', password: '#(defaultUserPassword)' }
    When method post
    Then status 403

  Scenario: GET /api/auth/me avec token valide
    * def lecteur = call read('classpath:com/biblio/karate/common/create-and-activate-lecteur.feature') { nom: 'Me', prenom: 'Test', email: '#(testEmail)', password: '#(testPassword)' }

    Given url baseUrl + '/api/auth/me'
    And header Authorization = 'Bearer ' + lecteur.loginResult.token
    When method get
    Then status 200
    And match response.email == testEmail

  Scenario: GET /api/auth/me sans token
    Given url baseUrl + '/api/auth/me'
    When method get
    Then status 401

  Scenario: Changement de mot de passe obligatoire à la première connexion
    * def tempEmail = 'temp-' + uniqueId + '@test.com'
    * def loginResult = call read('classpath:com/biblio/karate/common/login.feature') { email: '#(biblioEmail)', password: '#(biblioPassword)' }
    * def biblioToken = loginResult.token

    Given url baseUrl + '/api/users'
    And header Authorization = 'Bearer ' + biblioToken
    And request { nom: 'Temp', prenom: 'User', email: '#(tempEmail)', role: 'LECTEUR' }
    When method post
    Then status 201

    Given url baseUrl + '/api/auth/login'
    And request { email: '#(tempEmail)', password: '#(defaultUserPassword)' }
    When method post
    Then status 200
    And match response.user.mustChangePassword == true
    * def tempToken = response.token

    Given url baseUrl + '/api/users'
    And header Authorization = 'Bearer ' + tempToken
    When method get
    Then status 403
    And match response.mustChangePassword == true

    Given url baseUrl + '/api/auth/change-password'
    And header Authorization = 'Bearer ' + tempToken
    And request { currentPassword: '#(defaultUserPassword)', newPassword: 'newpass123' }
    When method post
    Then status 200
    And match response.mustChangePassword == false
