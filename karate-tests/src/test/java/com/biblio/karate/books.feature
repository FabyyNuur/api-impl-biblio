Feature: Gestion des livres

  Background:
    * def uniqueId = java.util.UUID.randomUUID().toString()
    * def loginResult = call read('classpath:com/biblio/karate/common/login.feature') { email: '#(biblioEmail)', password: '#(biblioPassword)' }
    * def biblioToken = loginResult.token
    * def bookIsbn = '978-dune-' + uniqueId
    * def bookPayload = { titre: 'Dune', auteur: 'Frank Herbert', isbn: '#(bookIsbn)', anneePublication: 1965, genre: 'SF', nombreExemplaires: 2 }

  Scenario: POST /api/books - créer un livre (bibliothécaire)
    Given url baseUrl + '/api/books'
    And header Authorization = 'Bearer ' + biblioToken
    And request bookPayload
    When method post
    Then status 201
    And match response.titre == 'Dune'

  Scenario: GET /api/books/available - livres disponibles (public)
    Given url baseUrl + '/api/books'
    And header Authorization = 'Bearer ' + biblioToken
    And request bookPayload
    When method post
    Then status 201

    Given url baseUrl + '/api/books/available'
    When method get
    Then status 200
    And match response == '#[]'
    * def bookCount = karate.sizeOf(response)
    * assert bookCount > 0

  Scenario: GET /api/books/search?q= - recherche (public)
    Given url baseUrl + '/api/books'
    And header Authorization = 'Bearer ' + biblioToken
    And request bookPayload
    When method post
    Then status 201

    Given url baseUrl + '/api/books/search'
    And param q = 'Dune'
    When method get
    Then status 200
    * def bookCount = karate.sizeOf(response)
    * assert bookCount > 0

  Scenario: GET /api/books/search - 400 sans paramètre q
    Given url baseUrl + '/api/books/search'
    When method get
    Then status 400

  Scenario: DELETE /api/books/:id - supprimer (bibliothécaire)
    * def deleteIsbn = '978-del-' + uniqueId
    Given url baseUrl + '/api/books'
    And header Authorization = 'Bearer ' + biblioToken
    And request { titre: 'Delete Me', auteur: 'Auteur', isbn: '#(deleteIsbn)', anneePublication: 2020, genre: 'Test', nombreExemplaires: 1 }
    When method post
    Then status 201
    * def bookId = response.id

    Given url baseUrl + '/api/books/' + bookId
    And header Authorization = 'Bearer ' + biblioToken
    When method delete
    Then status 204

  Scenario: GET /api/books - liste publique
    Given url baseUrl + '/api/books'
    When method get
    Then status 200
    And match response == '#[]'
