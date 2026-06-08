Feature: Authentification

  Background:
    * def uniqueId = java.util.UUID.randomUUID().toString()
    * def testEmail = 'auth-' + uniqueId + '@test.com'
    * def testPassword = lecteurPassword

  Scenario: Login avec identifiants valides
    Given url baseUrl + '/api/users'
    And request { nom: 'Auth', prenom: 'Test', email: '#(testEmail)', password: '#(testPassword)' }
    When method post
    Then status 201

    Given url baseUrl + '/api/auth/login'
    And request { email: '#(testEmail)', password: '#(testPassword)' }
    When method post
    Then status 200
    And match response.token == '#string'
    And match response.user.email == testEmail

  Scenario: Login avec identifiants incorrects
    Given url baseUrl + '/api/users'
    And request { nom: 'Wrong', prenom: 'User', email: '#(testEmail)', password: '#(testPassword)' }
    When method post
    Then status 201

    Given url baseUrl + '/api/auth/login'
    And request { email: '#(testEmail)', password: 'badpass' }
    When method post
    Then status 401
    And match response.error == '#string'

  Scenario: Login compte inactif
    * def inactiveEmail = 'inactive-' + uniqueId + '@test.com'
    Given url baseUrl + '/api/users'
    And request { nom: 'Inactive', prenom: 'User', email: '#(inactiveEmail)', password: '#(testPassword)' }
    When method post
    Then status 201
    * def inactiveUserId = response.id

    * def loginResult = call read('classpath:com/biblio/karate/common/login.feature') { email: '#(biblioEmail)', password: '#(biblioPassword)' }
    * def biblioToken = loginResult.token
    Given url baseUrl + '/api/users/' + inactiveUserId
    And header Authorization = 'Bearer ' + biblioToken
    And request { actif: false }
    When method put
    Then status 200

    Given url baseUrl + '/api/auth/login'
    And request { email: '#(inactiveEmail)', password: '#(testPassword)' }
    When method post
    Then status 403

  Scenario: GET /api/auth/me avec token valide
    Given url baseUrl + '/api/users'
    And request { nom: 'Me', prenom: 'Test', email: '#(testEmail)', password: '#(testPassword)' }
    When method post
    Then status 201

    * def loginResult = call read('classpath:com/biblio/karate/common/login.feature') { email: '#(testEmail)', password: '#(testPassword)' }
    Given url baseUrl + '/api/auth/me'
    And header Authorization = 'Bearer ' + loginResult.token
    When method get
    Then status 200
    And match response.email == testEmail

  Scenario: GET /api/auth/me sans token
    Given url baseUrl + '/api/auth/me'
    When method get
    Then status 401
