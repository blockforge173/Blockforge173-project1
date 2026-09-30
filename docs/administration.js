// ==========================================
// CONFIGURATION
// ==========================================

const API_ADMIN_URL =
"https://blockforge-api-prod.blockforge173.workers.dev";


// ==========================================
// ÉLÉMENTS DE LA PAGE
// ==========================================

const administration =
    document.getElementById(
        "administration"
    );

const chargementAdministration =
    document.getElementById(
        "chargement-administration"
    );

const formulaireLicence =
    document.getElementById(
        "formulaire-licence"
    );

const selectUtilisateur =
    document.getElementById(
        "utilisateur"
    );

const selectJeu =
    document.getElementById(
        "jeu"
    );

const selectTypeLicence =
    document.getElementById(
        "type-licence"
    );

const conteneurExpiration =
    document.getElementById(
        "conteneur-expiration"
    );

const champExpiration =
    document.getElementById(
        "expiration"
    );

const messageAdministration =
    document.getElementById(
        "message-administration"
    );

const boutonAttribuer =
    document.getElementById(
        "bouton-attribuer"
    );

const listeLicences =
    document.getElementById(
        "liste-licences"
    );


// ==========================================
// AFFICHAGE D'UN MESSAGE
// ==========================================

function afficherMessage(
    message,
    type = "erreur"
) {

    messageAdministration.textContent =
        message;

    messageAdministration.style.display =
        "block";


    if (type === "succes") {

        messageAdministration.style.background =
            "rgba(70, 180, 100, 0.12)";

        messageAdministration.style.border =
            "1px solid rgba(70, 180, 100, 0.35)";

        messageAdministration.style.color =
            "#8ee0a5";

    } else {

        messageAdministration.style.background =
            "rgba(220, 70, 70, 0.12)";

        messageAdministration.style.border =
            "1px solid rgba(220, 70, 70, 0.35)";

        messageAdministration.style.color =
            "#ff9b9b";

    }

}


// ==========================================
// EFFACEMENT DU MESSAGE
// ==========================================

function effacerMessage() {

    messageAdministration.textContent = "";

    messageAdministration.style.display =
        "none";

}


// ==========================================
// VÉRIFICATION DU COMPTE OWNER
// ==========================================

async function verifierOwner() {

    try {

        const reponse = await fetch(
            `${API_ADMIN_URL}/api/me`,
            {
                method: "GET",
                credentials: "include"
            }
        );


        if (!reponse.ok) {

            window.location.href =
                "connexion.html";

            return false;

        }


        const resultat =
            await reponse.json();


        if (
            resultat.authenticated !== true ||
            !resultat.user
        ) {

            window.location.href =
                "connexion.html";

            return false;

        }


        if (
            resultat.user.role !== "OWNER"
        ) {

            window.location.href =
                "index.html";

            return false;

        }


        return true;

    } catch (erreur) {

        console.error(
            "Impossible de vérifier le rôle OWNER :",
            erreur
        );

        window.location.href =
            "index.html";

        return false;

    }

}


// ==========================================
// CHARGEMENT DES UTILISATEURS
// ==========================================

async function chargerUtilisateurs() {

    const reponse = await fetch(
        `${API_ADMIN_URL}/api/admin/users`,
        {
            method: "GET",
            credentials: "include"
        }
    );


    if (!reponse.ok) {

        throw new Error(
            "Impossible de charger les utilisateurs."
        );

    }


    const resultat =
        await reponse.json();


    if (!Array.isArray(resultat.users)) {

        throw new Error(
            "Réponse utilisateurs invalide."
        );

    }


    selectUtilisateur.innerHTML = "";


    const optionDefaut =
        document.createElement(
            "option"
        );

    optionDefaut.value = "";

    optionDefaut.textContent =
        "Sélectionner un utilisateur";

    selectUtilisateur.appendChild(
        optionDefaut
    );


    resultat.users.forEach(
        utilisateur => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                utilisateur.id;

            option.textContent =
                utilisateur.nom;

            selectUtilisateur.appendChild(
                option
            );

        }
    );

}


// ==========================================
// CHARGEMENT DES JEUX
// ==========================================

async function chargerJeux() {

    const reponse = await fetch(
        `${API_ADMIN_URL}/api/games`,
        {
            method: "GET",
            credentials: "include"
        }
    );


    if (!reponse.ok) {

        throw new Error(
            "Impossible de charger les jeux."
        );

    }


    const resultat =
        await reponse.json();


    let jeux = [];


    if (
        Array.isArray(resultat.games)
    ) {

        jeux =
            resultat.games;

    } else if (
        Array.isArray(resultat)
    ) {

        jeux =
            resultat;

    }


    if (jeux.length === 0) {

        throw new Error(
            "Aucun jeu disponible."
        );

    }


    selectJeu.innerHTML = "";


    const optionDefaut =
        document.createElement(
            "option"
        );

    optionDefaut.value = "";

    optionDefaut.textContent =
        "Sélectionner un jeu";

    selectJeu.appendChild(
        optionDefaut
    );


    jeux.forEach(
        jeu => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                jeu.id;

            option.textContent =
                jeu.nom;

            selectJeu.appendChild(
                option
            );

        }
    );

}


// ==========================================
// FORMATAGE D'UNE DATE
// ==========================================

function formaterDate(dateTexte) {

    if (!dateTexte) {

        return "Permanente";

    }


    const date =
        new Date(dateTexte);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateTexte;

    }


    return date.toLocaleString(
        "fr-FR"
    );

}


// ==========================================
// CONVERSION DATE POUR DATETIME-LOCAL
// ==========================================

function convertirDatePourChamp(
    dateTexte
) {

    if (!dateTexte) {

        return "";

    }


    const date =
        new Date(dateTexte);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    const annee =
        date.getFullYear();

    const mois =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const jour =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    const heures =
        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        );

    const minutes =
        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        );


    return (
        `${annee}-${mois}-${jour}` +
        `T${heures}:${minutes}`
    );

}


// ==========================================
// CRÉATION D'UNE CELLULE
// ==========================================

function creerCellule(
    texte
) {

    const cellule =
        document.createElement(
            "td"
        );

    cellule.textContent =
        texte;

    return cellule;

}


// ==========================================
// GESTION DES ERREURS ADMIN
// ==========================================

function gererErreurAdministration(
    resultat,
    messageDefaut
) {

    if (
        resultat.reason ===
        "AUTHENTICATION_REQUIRED"
    ) {

        window.location.href =
            "connexion.html";

        return;

    }


    if (
        resultat.reason ===
        "OWNER_REQUIRED"
    ) {

        window.location.href =
            "index.html";

        return;

    }


    if (
        resultat.reason ===
        "LICENSE_NOT_FOUND"
    ) {

        afficherMessage(
            "Cette licence n'existe plus."
        );

        return;

    }


    if (
        resultat.reason ===
        "BETA_ONLY"
    ) {

        afficherMessage(
            "Cette opération est réservée aux licences BETA."
        );

        return;

    }


    if (
        resultat.reason ===
        "BETA_EXPIRATION_REQUIRED"
    ) {

        afficherMessage(
            "Une date d'expiration est obligatoire."
        );

        return;

    }


    afficherMessage(
        resultat.message ||
        resultat.reason ||
        messageDefaut
    );

}


// ==========================================
// PROLONGATION D'UNE BETA
// ==========================================

async function prolongerLicence(
    licence
) {

    effacerMessage();


    if (
        licence.type !== "BETA"
    ) {

        afficherMessage(
            "Seules les licences BETA peuvent être prolongées."
        );

        return;

    }


    const dateActuelle =
        convertirDatePourChamp(
            licence.expiresAt
        );


    const nouvelleExpiration =
        window.prompt(
            "Nouvelle date d'expiration de la BETA\n" +
            "Format : AAAA-MM-JJTHH:MM",
            dateActuelle
        );


    // L'utilisateur a annulé.

    if (
        nouvelleExpiration === null
    ) {

        return;

    }


    const expirationNettoyee =
        nouvelleExpiration.trim();


    if (
        expirationNettoyee === ""
    ) {

        afficherMessage(
            "La date d'expiration ne peut pas être vide."
        );

        return;

    }


    const dateTest =
        new Date(
            expirationNettoyee
        );


    if (
        Number.isNaN(
            dateTest.getTime()
        )
    ) {

        afficherMessage(
            "La date d'expiration est invalide."
        );

        return;

    }


    try {

        const reponse = await fetch(
            `${API_ADMIN_URL}/api/admin/licenses/${licence.id}`,
            {
                method: "PATCH",

                credentials: "include",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    expiresAt:
                        expirationNettoyee
                })
            }
        );


        const resultat =
            await reponse.json();


        if (
            reponse.ok &&
            resultat.updated === true
        ) {

            afficherMessage(
                `La BETA de ${licence.userName} pour ${licence.gameName} a été prolongée.`,
                "succes"
            );

            await chargerLicences();

            return;

        }


        gererErreurAdministration(
            resultat,
            "Impossible de modifier cette licence."
        );

    } catch (erreur) {

        console.error(
            "Erreur pendant la modification de la licence :",
            erreur
        );

        afficherMessage(
            "Impossible de contacter le serveur."
        );

    }

}


// ==========================================
// RÉVOCATION D'UNE BETA
// ==========================================

async function revoquerLicence(
    licence
) {

    effacerMessage();


    if (
        licence.type !== "BETA"
    ) {

        afficherMessage(
            "Seules les licences BETA peuvent être révoquées."
        );

        return;

    }


    const confirmation =
        window.confirm(
            `Révoquer la BETA de ${licence.userName} pour ${licence.gameName} ?\n\n` +
            "L'utilisateur perdra immédiatement son accès à ce jeu."
        );


    if (!confirmation) {

        return;

    }


    try {

        const reponse = await fetch(
            `${API_ADMIN_URL}/api/admin/licenses/${licence.id}`,
            {
                method: "DELETE",
                credentials: "include"
            }
        );


        const resultat =
            await reponse.json();


        if (
            reponse.ok &&
            resultat.deleted === true
        ) {

            afficherMessage(
                `La BETA de ${licence.userName} pour ${licence.gameName} a été révoquée.`,
                "succes"
            );

            await chargerLicences();

            return;

        }


        gererErreurAdministration(
            resultat,
            "Impossible de révoquer cette licence."
        );

    } catch (erreur) {

        console.error(
            "Erreur pendant la révocation de la licence :",
            erreur
        );

        afficherMessage(
            "Impossible de contacter le serveur."
        );

    }

}


// ==========================================
// CRÉATION DES ACTIONS D'UNE LICENCE
// ==========================================

function creerCelluleActions(
    licence
) {

    const cellule =
        document.createElement(
            "td"
        );


    cellule.style.padding =
        "12px";

    cellule.style.borderTop =
        "1px solid var(--bordure)";


    // Les PURCHASED ne sont jamais administrées
    // manuellement depuis cette interface.

    if (
        licence.type !== "BETA"
    ) {

        cellule.textContent =
            "—";

        return cellule;

    }


    const conteneur =
        document.createElement(
            "div"
        );


    conteneur.style.display =
        "flex";

    conteneur.style.gap =
        "8px";

    conteneur.style.flexWrap =
        "wrap";


    // ======================================
    // BOUTON PROLONGER
    // ======================================

    const boutonProlonger =
        document.createElement(
            "button"
        );

    boutonProlonger.type =
        "button";

    boutonProlonger.textContent =
        "Prolonger";

    boutonProlonger.className =
        "bouton-principal";


    boutonProlonger.addEventListener(
        "click",
        () => {

            prolongerLicence(
                licence
            );

        }
    );


    // ======================================
    // BOUTON RÉVOQUER
    // ======================================

    const boutonRevoquer =
        document.createElement(
            "button"
        );

    boutonRevoquer.type =
        "button";

    boutonRevoquer.textContent =
        "Révoquer";

    boutonRevoquer.className =
        "bouton-principal";


    boutonRevoquer.addEventListener(
        "click",
        () => {

            revoquerLicence(
                licence
            );

        }
    );


    conteneur.appendChild(
        boutonProlonger
    );

    conteneur.appendChild(
        boutonRevoquer
    );

    cellule.appendChild(
        conteneur
    );


    return cellule;

}


// ==========================================
// AFFICHAGE DES LICENCES
// ==========================================

function afficherLicences(
    licences
) {

    listeLicences.innerHTML = "";


    if (licences.length === 0) {

        const message =
            document.createElement(
                "p"
            );

        message.textContent =
            "Aucune licence enregistrée.";

        listeLicences.appendChild(
            message
        );

        return;

    }


    const conteneurTableau =
        document.createElement(
            "div"
        );

    conteneurTableau.style.overflowX =
        "auto";


    const tableau =
        document.createElement(
            "table"
        );

    tableau.style.width =
        "100%";

    tableau.style.borderCollapse =
        "collapse";


    // ======================================
    // EN-TÊTE
    // ======================================

    const entete =
        document.createElement(
            "thead"
        );

    const ligneEntete =
        document.createElement(
            "tr"
        );


    [
        "Pseudo/Nom",
        "Jeu",
        "Licence",
        "Expiration",
        "Actions"
    ].forEach(
        titre => {

            const cellule =
                document.createElement(
                    "th"
                );

            cellule.textContent =
                titre;

            cellule.style.textAlign =
                "left";

            cellule.style.padding =
                "12px";

            ligneEntete.appendChild(
                cellule
            );

        }
    );


    entete.appendChild(
        ligneEntete
    );

    tableau.appendChild(
        entete
    );


    // ======================================
    // CORPS DU TABLEAU
    // ======================================

    const corps =
        document.createElement(
            "tbody"
        );


    licences.forEach(
        licence => {

            const ligne =
                document.createElement(
                    "tr"
                );


            const expiration =
                licence.type === "PURCHASED"
                    ? "Permanente"
                    : formaterDate(
                        licence.expiresAt
                    );


            ligne.appendChild(
                creerCellule(
                    licence.userName
                )
            );

            ligne.appendChild(
                creerCellule(
                    licence.gameName
                )
            );

            ligne.appendChild(
                creerCellule(
                    licence.type
                )
            );

            ligne.appendChild(
                creerCellule(
                    expiration
                )
            );


            Array.from(
                ligne.children
            ).forEach(
                cellule => {

                    cellule.style.padding =
                        "12px";

                    cellule.style.borderTop =
                        "1px solid var(--bordure)";

                }
            );


            ligne.appendChild(
                creerCelluleActions(
                    licence
                )
            );


            corps.appendChild(
                ligne
            );

        }
    );


    tableau.appendChild(
        corps
    );

    conteneurTableau.appendChild(
        tableau
    );

    listeLicences.appendChild(
        conteneurTableau
    );

}


// ==========================================
// CHARGEMENT DES LICENCES
// ==========================================

async function chargerLicences() {

    const reponse = await fetch(
        `${API_ADMIN_URL}/api/admin/licenses`,
        {
            method: "GET",
            credentials: "include"
        }
    );


    const resultat =
        await reponse.json();


    if (!reponse.ok) {

        if (
            resultat.reason ===
            "AUTHENTICATION_REQUIRED"
        ) {

            window.location.href =
                "connexion.html";

            return;

        }


        if (
            resultat.reason ===
            "OWNER_REQUIRED"
        ) {

            window.location.href =
                "index.html";

            return;

        }


        throw new Error(
            "Impossible de charger les licences."
        );

    }


    if (
        !Array.isArray(
            resultat.licenses
        )
    ) {

        throw new Error(
            "Réponse licences invalide."
        );

    }


    afficherLicences(
        resultat.licenses
    );

}


// ==========================================
// GESTION DU TYPE DE LICENCE
// ==========================================

function mettreAJourExpiration() {

    conteneurExpiration.hidden =
        false;

    champExpiration.required =
        true;

}


// ==========================================
// ATTRIBUTION DE LA LICENCE
// ==========================================

async function attribuerLicence(
    evenement
) {

    evenement.preventDefault();

    effacerMessage();


    const userId =
        Number(
            selectUtilisateur.value
        );

    const gameId =
        selectJeu.value;

    const type =
        selectTypeLicence.value;


    // ======================================
    // VALIDATION UTILISATEUR
    // ======================================

    if (
        !Number.isInteger(userId) ||
        userId <= 0
    ) {

        afficherMessage(
            "Sélectionne un utilisateur."
        );

        return;

    }


    // ======================================
    // VALIDATION JEU
    // ======================================

    if (!gameId) {

        afficherMessage(
            "Sélectionne un jeu."
        );

        return;

    }


    // ======================================
    // VALIDATION TYPE
    // ======================================

    if (
        type !== "BETA"
    ) {

        afficherMessage(
            "Seules les licences BETA peuvent être attribuées manuellement."
        );

        return;

    }


    // ======================================
    // DATE D'EXPIRATION
    // ======================================

    let expiresAt = null;


    if (
        type === "BETA"
    ) {

        if (
            !champExpiration.value
        ) {

            afficherMessage(
                "Une date d'expiration est obligatoire pour une licence BETA."
            );

            return;

        }


        expiresAt =
            champExpiration.value;

    }


    // ======================================
    // DÉSACTIVATION DU BOUTON
    // ======================================

    boutonAttribuer.disabled =
        true;

    boutonAttribuer.textContent =
        "Attribution...";


    try {

        const reponse = await fetch(
            `${API_ADMIN_URL}/api/admin/licenses`,
            {
                method: "POST",

                credentials: "include",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    userId,
                    gameId,
                    type,
                    expiresAt
                })
            }
        );


        const resultat =
            await reponse.json();


        // ======================================
        // SUCCÈS
        // ======================================

        if (
            reponse.ok &&
            resultat.created === true
        ) {

afficherMessage(
    `Licence ${type} attribuée avec succès.`,
    "succes"
);

            selectUtilisateur.value =
                "";

            selectJeu.value =
                "";

            selectTypeLicence.value =
                "BETA";

            champExpiration.value =
                "";

            mettreAJourExpiration();


            await chargerLicences();

            return;

        }


        // ======================================
        // LICENCE DÉJÀ EXISTANTE
        // ======================================

        if (
            resultat.reason ===
            "LICENSE_ALREADY_EXISTS"
        ) {

            afficherMessage(
                "Cet utilisateur possède déjà une licence pour ce jeu."
            );

            return;

        }


        // ======================================
        // SESSION EXPIRÉE
        // ======================================

        if (
            resultat.reason ===
            "AUTHENTICATION_REQUIRED"
        ) {

            window.location.href =
                "connexion.html";

            return;

        }


        // ======================================
        // OWNER REQUIS
        // ======================================

        if (
            resultat.reason ===
            "OWNER_REQUIRED"
        ) {

            window.location.href =
                "index.html";

            return;

        }


        // ======================================
        // UTILISATEUR INTROUVABLE
        // ======================================

        if (
            resultat.reason ===
            "TARGET_USER_NOT_FOUND"
        ) {

            afficherMessage(
                "L'utilisateur sélectionné n'existe plus."
            );

            return;

        }


        // ======================================
        // JEU INTROUVABLE
        // ======================================

        if (
            resultat.reason ===
            "GAME_NOT_FOUND"
        ) {

            afficherMessage(
                "Le jeu sélectionné n'existe pas."
            );

            return;

        }


        // ======================================
        // AUTRE ERREUR
        // ======================================

        afficherMessage(
            resultat.message ||
            resultat.reason ||
            "Impossible d'attribuer la licence."
        );


    } catch (erreur) {

        console.error(
            "Erreur pendant l'attribution de la licence :",
            erreur
        );

        afficherMessage(
            "Impossible de contacter le serveur."
        );


    } finally {

        boutonAttribuer.disabled =
            false;

        boutonAttribuer.textContent =
            "Attribuer la licence";

    }

}


// ==========================================
// INITIALISATION
// ==========================================

async function initialiserAdministration() {

    const owner =
        await verifierOwner();


    if (!owner) {

        return;

    }


    try {

        await Promise.all([
            chargerUtilisateurs(),
            chargerJeux(),
            chargerLicences()
        ]);


        mettreAJourExpiration();


        chargementAdministration.hidden =
            true;

        administration.hidden =
            false;


    } catch (erreur) {

        console.error(
            "Erreur d'initialisation de l'administration :",
            erreur
        );


        chargementAdministration.innerHTML = `
            <section class="section">

                <div class="titre-section">

                    <p class="sur-titre">
                        Erreur
                    </p>

                    <h1>
                        Administration indisponible
                    </h1>

                    <p>
                        Impossible de charger les données
                        nécessaires à l'administration.
                    </p>

                </div>

            </section>
        `;

    }

}


// ==========================================
// CHANGEMENT DU TYPE DE LICENCE
// ==========================================

selectTypeLicence.addEventListener(
    "change",
    mettreAJourExpiration
);


// ==========================================
// ENVOI DU FORMULAIRE
// ==========================================

formulaireLicence.addEventListener(
    "submit",
    attribuerLicence
);


// ==========================================
// LANCEMENT
// ==========================================

initialiserAdministration();