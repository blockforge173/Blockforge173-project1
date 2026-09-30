// ==========================================
// CONFIGURATION API
// ==========================================

const API_URL =
    "https://blockforge-api-prod.blockforge173.workers.dev";


// ==========================================
// GESTION DU COMPTE UTILISATEUR
// ==========================================


// ==========================================
// RÉCUPÉRATION DE L'UTILISATEUR CONNECTÉ
// ==========================================

async function recupererUtilisateur() {

    try {

        const reponse = await fetch(
            `${API_URL}/api/me`,
            {
                method: "GET",
                credentials: "include"
            }
        );


        // ======================================
        // AUCUNE SESSION ACTIVE
        // ======================================

        if (!reponse.ok) {
            return null;
        }


        const resultat =
            await reponse.json();


        if (
            resultat.authenticated !== true ||
            !resultat.user
        ) {
            return null;
        }


        return resultat.user;


    } catch (erreur) {

        console.error(
            "Impossible de vérifier la session :",
            erreur
        );

        return null;

    }

}


// ==========================================
// AFFICHAGE UTILISATEUR NON CONNECTÉ
// ==========================================

function afficherNavigationDeconnectee(
    navigationCompte
) {

    navigationCompte.innerHTML = `
        <a href="connexion.html">
            Connexion
        </a>

        <a href="inscription.html">
            Inscription
        </a>
    `;

}


// ==========================================
// AFFICHAGE UTILISATEUR CONNECTÉ
// ==========================================

function afficherNavigationConnectee(
    navigationCompte,
    utilisateur
) {

    // ======================================
    // LIEN ADMINISTRATION
    // ======================================

    let lienAdministration = "";


    if (
        utilisateur.role === "OWNER"
    ) {

        lienAdministration = `
            <a
                href="administration.html"
                class="lien-administration"
            >
                Administration
            </a>
        `;

    }


    // ======================================
    // CONSTRUCTION DE LA NAVIGATION
    // ======================================

    navigationCompte.innerHTML = `
        <span class="nom-utilisateur"></span>

        ${lienAdministration}

        <button
            type="button"
            class="bouton-deconnexion"
            id="bouton-deconnexion"
        >
            Déconnexion
        </button>
    `;


    // ======================================
    // AFFICHAGE DU NOM
    // ======================================

    const nomUtilisateur =
        navigationCompte.querySelector(
            ".nom-utilisateur"
        );


    if (nomUtilisateur) {

        nomUtilisateur.textContent =
            utilisateur.nom;

    }

}


// ==========================================
// DÉCONNEXION
// ==========================================

async function deconnecterUtilisateur(
    navigationCompte
) {

    try {

        const reponse = await fetch(
            `${API_URL}/api/logout`,
            {
                method: "POST",
                credentials: "include"
            }
        );


        if (!reponse.ok) {

            console.error(
                "Erreur pendant la déconnexion."
            );

            return;

        }


        // ======================================
        // MODIFICATION DU MENU
        // ======================================

        afficherNavigationDeconnectee(
            navigationCompte
        );


        console.log(
            "Utilisateur déconnecté."
        );


        // ======================================
        // REDIRECTION SI ADMINISTRATION
        // ======================================

        if (
            window.location.pathname.endsWith(
                "/administration.html"
            )
        ) {

            window.location.href =
                "index.html";

        }


    } catch (erreur) {

        console.error(
            "Impossible de contacter le serveur :",
            erreur
        );

    }

}


// ==========================================
// INITIALISATION DU COMPTE
// ==========================================

async function initialiserCompte() {

    const navigationCompte =
        document.getElementById(
            "navigation-compte"
        );


    // ======================================
    // ZONE COMPTE INTROUVABLE
    // ======================================

    if (!navigationCompte) {

        console.error(
            "Zone navigation-compte introuvable."
        );

        return;

    }


    // ======================================
    // RÉCUPÉRATION DE LA SESSION
    // ======================================

    const utilisateur =
        await recupererUtilisateur();


    console.log(
        "Utilisateur actuel :",
        utilisateur
    );


    // ======================================
    // UTILISATEUR NON CONNECTÉ
    // ======================================

    if (!utilisateur) {

        afficherNavigationDeconnectee(
            navigationCompte
        );

        return;

    }


    // ======================================
    // UTILISATEUR CONNECTÉ
    // ======================================

    afficherNavigationConnectee(
        navigationCompte,
        utilisateur
    );


    // ======================================
    // RÉCUPÉRATION DU BOUTON
    // ======================================

    const boutonDeconnexion =
        navigationCompte.querySelector(
            "#bouton-deconnexion"
        );


    // ======================================
    // CLIC SUR DÉCONNEXION
    // ======================================

    if (boutonDeconnexion) {

        boutonDeconnexion.addEventListener(
            "click",
            async () => {

                await deconnecterUtilisateur(
                    navigationCompte
                );

            }
        );

    }

}


// ==========================================
// LANCEMENT
// ==========================================

initialiserCompte();