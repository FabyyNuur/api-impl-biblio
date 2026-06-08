package com.biblio.karate;

import com.intuit.karate.junit5.Karate;

class KarateRunner {

    @Karate.Test
    Karate testAll() {
        return Karate.run("health", "auth", "users", "books", "emprunts", "rbac")
                .relativeTo(getClass());
    }
}
