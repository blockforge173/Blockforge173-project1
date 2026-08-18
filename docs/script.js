// ===============================
// LISTE DES JEUX
// ===============================

const jeux = [
    {
        titre: "Friendzoné Reborn",

        description:
            "Un jeu narratif à choix dans lequel vos décisions influencent les relations et le déroulement de l'histoire.",

        image:
            "images/friendzone.jpg",

        lien:
            "jeux/friendzone/index.html",

        statut:
            "En alpha public",

        type:
            "Jeu narratif"
    },

    {
        titre: "Harcèlement scolaire",

        description:
            "Un jeu narratif conçu pour sensibiliser aux mécanismes et aux conséquences du harcèlement scolaire.",

        image:
            "images/harcelement.jpg",

        lien:
            "jeux/harcelement/index.html",

        statut:
            "disponible bienôt",

        type:
            "Jeu sérieux"
    },
    {
        titre:"Friendzoné Reborn 2",

        description:"Un jeu narratif à choix dans lequel vos décisions influencent les relations et le déroulement de l'histoire.",

        image:"images/friendzone.jpg",

        lien:"jeux/friendzone_reborn_2/index.html",

        statut:"En développement",
        
        type:"Jeux narratif"
    }
];


// ===============================
// AUTRES PROJETS
// ===============================

const projets = [
    {
        titre: "Calculateur de budget",

        description:
            "Une application web permettant de suivre ses revenus, ses dépenses et son budget.",

        image:
            "images/budget.jpg",

        lien:
            "projets/budget/index.html",

        statut:
            "Prototype",

        type:
            "Application web"
    }
];


// ===============================
// CRÉATION D'UNE CARTE
// ===============================

function creerCarte(projet) {

    const carte = document.createElement("article");

    carte.classList.add("carte-projet");

    carte.innerHTML = `
        <img
            src="${projet.image}"
            alt="${projet.titre}"
            class="image-projet"
        >

        <div class="contenu-projet">

            <span class="type-projet">
                ${projet.type}
            </span>

            <h3>
                ${projet.titre}
            </h3>

            <p class="description-projet">
                ${projet.description}
            </p>

            <div>
                <span class="statut">
                    ${projet.statut}
                </span>
            </div>

            <div class="actions-projet">

                <a
                    href="${projet.lien}"
                    class="bouton-projet"
                >
                    Découvrir
                </a>

            </div>

        </div>
    `;

    return carte;
}


// ===============================
// AFFICHAGE DES PROJETS
// ===============================

function afficherProjets() {

    const listeJeux =
        document.getElementById("liste-jeux");

    const listeProjets =
        document.getElementById("liste-projets");


    if (!listeJeux) {
        console.error(
            "Erreur : l'élément #liste-jeux est introuvable dans index.html"
        );
    }


    if (!listeProjets) {
        console.error(
            "Erreur : l'élément #liste-projets est introuvable dans index.html"
        );
    }


    if (listeJeux) {

        jeux.forEach((jeu) => {

            const carte = creerCarte(jeu);

            listeJeux.appendChild(carte);

        });

    }


    if (listeProjets) {

        projets.forEach((projet) => {

            const carte = creerCarte(projet);

            listeProjets.appendChild(carte);

        });

    }

}


// ===============================
// DÉMARRAGE
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        afficherProjets();

    }
);