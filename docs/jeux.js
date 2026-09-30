// ==========================================
// GESTION DE L'ACCÈS AUX JEUX
// ==========================================


// ==========================================
// FRIENDZONÉ REBORN
// ==========================================

const boutonFriendzone =
    document.getElementById(
        "acces-friendzone"
    );


if (boutonFriendzone) {

    boutonFriendzone.addEventListener(
        "click",
        async (evenement) => {

            evenement.preventDefault();


            try {

                // ==================================
                // DEMANDE À L'API CLOUDFLARE
                // ==================================

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
                    "Contrôle accès Friendzoné Reborn :",
                    resultat
                );


                // ==================================
                // ACCÈS AUTORISÉ
                // ==================================

                if (
                    reponse.ok &&
                    resultat.access === true
                ) {

                    console.log(
                        "ACCÈS AUTORISÉ"
                    );

                    window.location.href =
                        "jeux/friendzone/index.html";

                    return;

                }


                // ==================================
                // UTILISATEUR NON CONNECTÉ
                // ==================================

                if (
                    resultat.reason === "INVALID_SESSION" ||
                    resultat.reason === "UNAUTHORIZED"
                ) {

                    alert(
                        "Vous devez être connecté pour accéder à ce jeu."
                    );

                    return;

                }


                // ==================================
                // AUCUNE LICENCE
                // ==================================

                if (
                    resultat.reason === "NO_LICENSE"
                ) {

                    alert(
                        "Vous ne disposez pas d'un accès à Friendzoné Reborn."
                    );

                    return;

                }


                // ==================================
                // LICENCE EXPIRÉE
                // ==================================

                if (
                    resultat.reason === "LICENSE_EXPIRED"
                ) {

                    alert(
                        "Votre accès BETA à Friendzoné Reborn a expiré."
                    );

                    return;

                }


                // ==================================
                // JEU INTROUVABLE
                // ==================================

                if (
                    resultat.reason === "GAME_NOT_FOUND"
                ) {

                    alert(
                        "Le jeu demandé est introuvable."
                    );

                    return;

                }


                // ==================================
                // AUTRE REFUS
                // ==================================

                alert(
                    "Impossible d'accéder à Friendzoné Reborn."
                );


            } catch (erreur) {

                console.error(
                    "Impossible de vérifier l'accès au jeu :",
                    erreur
                );

                alert(
                    "Impossible de contacter le serveur."
                );

            }

        }
    );

}