Feature: Inscription utilisateur réutilisable

  Scenario: register user
    Given url baseUrl + '/api/users'
    And request { nom: '#(nom)', prenom: '#(prenom)', email: '#(email)', password: '#(password)' }
    When method post
    Then status 201
    And def userId = response.id
    And def userEmail = response.email
