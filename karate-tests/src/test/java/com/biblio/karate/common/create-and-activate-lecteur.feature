Feature: Créer et activer un lecteur pour les tests

  Scenario: create and activate lecteur
    * def biblioLogin = call read('classpath:com/biblio/karate/common/login.feature') { email: '#(biblioEmail)', password: '#(biblioPassword)' }
    Given url baseUrl + '/api/users'
    And header Authorization = 'Bearer ' + biblioLogin.token
    And request { nom: '#(nom)', prenom: '#(prenom)', email: '#(email)', role: 'LECTEUR' }
    When method post
    Then status 201
    * def userId = response.id

    Given url baseUrl + '/api/auth/login'
    And request { email: '#(email)', password: '#(defaultUserPassword)' }
    When method post
    Then status 200
    * def tempToken = response.token

    Given url baseUrl + '/api/auth/change-password'
    And header Authorization = 'Bearer ' + tempToken
    And request { currentPassword: '#(defaultUserPassword)', newPassword: '#(password)' }
    When method post
    Then status 200

    * def loginResult = call read('classpath:com/biblio/karate/common/login.feature') { email: '#(email)', password: '#(password)' }
