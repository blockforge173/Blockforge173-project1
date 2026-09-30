// ==========================================
// CONFIGURATION API
// ==========================================

const API_URL =
    "https://blockforge-api-prod.blockforge173.workers.dev";


// ==========================================
// FORMULAIRE DE CONNEXION
// ==========================================

const formulaire = document.getElementById(
    "formulaire-connexion"
);

const message = document.getElementById(
    "message-connexion"
);


// ==========================================
// ENVOI DU FORMULAIRE
// ==========================================

formulaire.addEventListener(
    "submit",
    async (evenement) => {

        evenement.preventDefault();


        // ======================================
        // RÉCUPÉRATION DES CHAMPS
        // ======================================

        const email = document
            .getElementById("email")
            .value
            .trim();

        const motDePasse = document
            .getElementById("motDePasse")
            .value;


        // ======================================
        // ENVOI À L'API CLOUDFLARE
        // ======================================

        try {

            const reponse = await fetch(
                `${API_URL}/api/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    // Indispensable pour recevoir
                    // le cookie blockforge_session.
                    credentials: "include",

                    body: JSON.stringify({
                        email: email,
                        password: motDePasse
                    })
                }
            );


            // ==================================
            // LECTURE DE LA RÉPONSE
            // ==================================

            const resultat =
                await reponse.json();


            // ==================================
            // CONNEXION RÉUSSIE
            // ==================================

            if (reponse.ok) {

                afficherMessage(
                    `Connexion réussie. Bonjour ${resultat.user.nom}.`
                );

                console.log(
                    "Utilisateur connecté :",
                    resultat.user
                );


                // ==============================
                // REDIRECTION VERS L'ACCUEIL
                // ==============================

                window.location.href =
                    "index.html";

                return;
            }


            // ==================================
            // IDENTIFIANTS INCORRECTS
            // ==================================

            if (
                resultat.error ===
                "INVALID_CREDENTIALS"
            ) {

                afficherMessage(
                    "Adresse e-mail ou mot de passe incorrect."
                );

                return;
            }


            // ==================================
            // CHAMPS MANQUANTS
            // ==================================

            if (
                resultat.error ===
                "MISSING_CREDENTIALS"
            ) {

                afficherMessage(
                    "L'adresse e-mail et le mot de passe sont obligatoires."
                );

                return;
            }


            // ==================================
            // AUTRE ERREUR API
            // ==================================

            afficherMessage(
                resultat.message ||
                "Impossible de se connecter."
            );


        } catch (erreur) {

            console.error(
                "Erreur de connexion :",
                erreur
            );

            afficherMessage(
                "Impossible de contacter le serveur."
            );

        }

    }
);


// ==========================================
// AFFICHAGE D'UN MESSAGE
// ==========================================

function afficherMessage(texte) {

    message.textContent = texte;

    message.style.display = "block";
}