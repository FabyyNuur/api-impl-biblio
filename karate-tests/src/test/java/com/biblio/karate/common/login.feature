Feature: Login réutilisable

  Scenario: login
    Given url baseUrl + '/api/auth/login'
    And request { email: '#(email)', password: '#(password)' }
    When method post
    Then status 200
    And def token = response.token
    And def userId = response.user.id
    And def userRole = response.user.role
