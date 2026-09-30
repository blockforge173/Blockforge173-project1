// ==========================================
// VÉRIFICATION DE L'ACCÈS AU JEU
// FRIENDZONÉ REBORN
// ==========================================

async function verifierAccesFriendzone() {

    try {

        const reponse = await fetch(
            "https://blockforge-api-prod.blockforge173.workers.dev/api/access/friendzone-reborn",
            {
                method: "GET",
                credentials: "include"
            }
        );


        const resultat =
            await reponse.json();


        console.log(
            "Vérification accès au jeu :",
            resultat
        );


        // ======================================
        // ACCÈS AUTORISÉ
        // ======================================

        if (
            reponse.ok &&
            resultat.access === true
        ) {

            console.log(
                "Accès Friendzoné Reborn autorisé."
            );

            return;

        }


        // ======================================
        // ACCÈS REFUSÉ
        // ======================================

        console.log(
            "Accès Friendzoné Reborn refusé."
        );

        window.location.replace(
            "../../jeux.html"
        );


    } catch (erreur) {

        console.error(
            "Impossible de vérifier l'accès au jeu :",
            erreur
        );

        window.location.replace(
            "../../jeux.html"
        );

    }

}


// ==========================================
// LANCEMENT DE LA VÉRIFICATION
// ==========================================

verifierAccesFriendzone();