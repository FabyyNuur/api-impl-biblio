Feature: Health check

  Scenario: GET /health retourne OK
    Given url baseUrl + '/health'
    When method get
    Then status 200
    And match response.status == 'OK'
    And match response.timestamp == '#string'
    And match response.uptime == '#number'

  Scenario: Route inexistante retourne 404
    Given url baseUrl + '/api/inexistant'
    When method get
    Then status 404
