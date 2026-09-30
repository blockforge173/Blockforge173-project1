// ==========================================
// CONFIGURATION API
// ==========================================

const API_URL =
    "https://blockforge-api-prod.blockforge173.workers.dev";


// ==========================================
// FORMULAIRE D'INSCRIPTION
// ==========================================

const formulaire = document.getElementById(
    "formulaire-inscription"
);

const message = document.getElementById(
    "message-inscription"
);


// ==========================================
// ENVOI DU FORMULAIRE
// ==========================================

formulaire.addEventListener(
    "submit",
    async (evenement) => {

        // Empêche le rechargement automatique de la page.
        evenement.preventDefault();


        // ======================================
        // RÉCUPÉRATION DES CHAMPS
        // ======================================

        const nom = document
            .getElementById("nom")
            .value
            .trim();

        const email = document
            .getElementById("email")
            .value
            .trim();

        const motDePasse = document
            .getElementById("motDePasse")
            .value;

        const confirmationMotDePasse = document
            .getElementById("confirmationMotDePasse")
            .value;


        // ======================================
        // VÉRIFICATION DE LA CONFIRMATION
        // ======================================

        if (
            motDePasse !==
            confirmationMotDePasse
        ) {

            afficherMessage(
                "Les mots de passe ne correspondent pas."
            );

            return;
        }


        // ======================================
        // ENVOI À L'API CLOUDFLARE
        // ======================================

        try {

            const reponse = await fetch(
                `${API_URL}/api/register`,
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        nom: nom,
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
            // INSCRIPTION RÉUSSIE
            // ==================================

            if (reponse.ok) {

                afficherMessage(
                    "Compte créé avec succès."
                );

                console.log(
                    "Utilisateur créé :",
                    resultat.user
                );

                formulaire.reset();

                return;
            }


            // ==================================
            // ADRESSE E-MAIL DÉJÀ UTILISÉE
            // ==================================

            if (
                resultat.error ===
                "EMAIL_ALREADY_USED"
            ) {

                afficherMessage(
                    "Cette adresse e-mail est déjà utilisée."
                );

                return;
            }


            // ==================================
            // MOT DE PASSE TROP COURT
            // ==================================

            if (
                resultat.error ===
                "PASSWORD_TOO_SHORT"
            ) {

                afficherMessage(
                    "Le mot de passe doit contenir au moins 8 caractères."
                );

                return;
            }


            // ==================================
            // ADRESSE E-MAIL INVALIDE
            // ==================================

            if (
                resultat.error ===
                "INVALID_EMAIL"
            ) {

                afficherMessage(
                    "L'adresse e-mail est invalide."
                );

                return;
            }


            // ==================================
            // CHAMPS MANQUANTS
            // ==================================

            if (
                resultat.error ===
                "MISSING_FIELDS"
            ) {

                afficherMessage(
                    "Tous les champs sont obligatoires."
                );

                return;
            }


            // ==================================
            // AUTRE ERREUR API
            // ==================================

            afficherMessage(
                resultat.message ||
                "Impossible de créer le compte."
            );


        } catch (erreur) {

            console.error(
                "Erreur d'inscription :",
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