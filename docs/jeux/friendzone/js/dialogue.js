"use strict";

/*=========================================================
    FRIENDZONÉ REBORN
    dialogue.js
    Dialogue Manager V4

    Gestion :
    - des dialogues ;
    - des variantes de relation ;
    - des variantes de confiance ;
    - des indicateurs d’écriture ;
    - des sons propres aux personnages ;
    - des succès ;
    - des choix importants ;
    - des nouvelles informations ;
    - des fonds définis dans les dialogues ;
    - de la galerie multimédia ;
    - du volume artistique local des sons de dialogue.

    AUDIO V4
    --------
    volumeSon est un multiplicateur artistique local.

    volume final effet =
        volume utilisateur effets
        × volumeMixEffets de la scène
        × volumeSon du dialogue
=========================================================*/

const dialogueManager = {

    conteneur: null,

    /*
        Identifiant permettant d'annuler une ancienne
        séquence de dialogues lorsqu'une nouvelle scène
        est chargée.
    */

    sequenceAffichage: 0,

    /*
        Réglages du délai d'écriture automatique.

        Le temps d'écriture est calculé selon
        le nombre de caractères du message.
    */

    dureeEcritureMinimum: 650,

    dureeEcritureMaximum: 3200,

    dureeParCaractere: 32,

    pauseEntreMessages: 180,

    /*
        Mémorise le dernier personnage ayant produit
        un son de dialogue.
    */

    dernierPersonnageSonore: null,

    /*
        Association entre les personnages et les fichiers
        présents dans le dossier audio/sons/.
    */

    sonsPersonnages: {

        joueur: "joueur",

        eva: "eva",

        zoe: "zoe",

        emelyne: "emelyne",

        bryan: "bryan",

        christophe: "christophe",

        "lieutenant-morel":
            "lieutenant-morel",

        eleve: "eleve",

        sms: "notification",

        telephone: "notification"

    },


    /*=====================================================
        INITIALISATION
    =====================================================*/

    initialiser() {

        this.conteneur =
            document.getElementById(
                "texte"
            );


        if (!this.conteneur) {

            console.error(
                "dialogue.js : l'élément #texte est introuvable."
            );

            return;

        }


        console.log(
            "dialogueManager V4 initialisé."
        );

    },


    /*=====================================================
        VÉRIFIER AUDIO MANAGER
    =====================================================*/

    audioDisponible() {

        return (

            typeof audioManager !==
                "undefined" &&

            audioManager !== null &&

            typeof audioManager
                .jouerSon ===
                "function"

        );

    },


    /*=====================================================
        NORMALISER LE VOLUME LOCAL D'UN SON

        Avec Audio Manager V4, cette valeur n'est pas
        le volume utilisateur final.

        Elle représente uniquement le multiplicateur
        artistique local du son du dialogue.

        Exemple :

        volume utilisateur effets = 0.70
        volumeMixEffets scène      = 0.80
        volumeSon dialogue         = 0.50

        volume final = 0.70 × 0.80 × 0.50 = 0.28
    =====================================================*/

    normaliserVolumeSon(
        valeur,
        valeurParDefaut = 1
    ) {

        if (
            valeur === undefined ||
            valeur === null ||
            valeur === ""
        ) {

            return Math.max(
                0,
                Math.min(
                    1,
                    Number(
                        valeurParDefaut
                    ) || 0
                )
            );

        }


        const nombre =
            Number(
                valeur
            );


        if (
            !Number.isFinite(
                nombre
            )
        ) {

            return Math.max(
                0,
                Math.min(
                    1,
                    Number(
                        valeurParDefaut
                    ) || 0
                )
            );

        }


        return Math.max(
            0,
            Math.min(
                1,
                nombre
            )
        );

    },


    /*=====================================================
        VÉRIFIER GALERIE MANAGER
    =====================================================*/

    galerieDisponible() {

        return (

            typeof galerieManager !==
                "undefined" &&

            galerieManager !== null &&

            typeof galerieManager
                .debloquer ===
                "function"

        );

    },


    /*=====================================================
        GÉRER LA GALERIE D'UN DIALOGUE

        Formats acceptés :

        "galerie": "idMedia"

        ou :

        "galerie": [
            "idMedia1",
            "idMedia2"
        ]

        Le moteur garde la priorité afin que la logique
        de déblocage reste centralisée.
    =====================================================*/

    gererGalerieDialogue(
        message
    ) {

        if (
            !message ||
            typeof message !==
                "object"
        ) {

            return false;

        }


        if (
            !Object.prototype
                .hasOwnProperty
                .call(
                    message,
                    "galerie"
                )
        ) {

            return false;

        }


        const valeur =
            message.galerie;


        if (!valeur) {

            return false;

        }


        /*---------------------------------------------
         PASSER PAR LE MOTEUR EN PRIORITÉ

         moteur.gererGalerieDialogue() permet au moteur
         de conserver toute la logique de galerie dans
         un seul endroit.
        ---------------------------------------------*/

        if (
            typeof moteur !==
                "undefined" &&

            moteur !== null &&

            typeof moteur
                .gererGalerieDialogue ===
                "function"
        ) {

            try {

                return moteur
                    .gererGalerieDialogue(
                        message
                    );

            }
            catch (erreur) {

                console.error(
                    "dialogue.js : erreur galerie via moteur.gererGalerieDialogue() :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         COMPATIBILITÉ AVEC UNE ANCIENNE VERSION
         DU MOTEUR

         Cette partie reste volontairement présente afin
         de ne pas casser une ancienne version éventuelle
         de moteur.js.
        ---------------------------------------------*/

        if (
            typeof moteur !==
                "undefined" &&

            moteur !== null &&

            typeof moteur
                .gererGalerieElement ===
                "function"
        ) {

            try {

                return moteur
                    .gererGalerieElement(
                        message
                    );

            }
            catch (erreur) {

                console.error(
                    "dialogue.js : erreur galerie via moteur.gererGalerieElement() :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         SECOURS : GALERIE MANAGER DIRECTEMENT
        ---------------------------------------------*/

        if (
            !this.galerieDisponible()
        ) {

            return false;

        }


        try {

            if (
                Array.isArray(
                    valeur
                )
            ) {

                if (
                    typeof galerieManager
                        .debloquerPlusieurs ===
                        "function"
                ) {

                    galerieManager
                        .debloquerPlusieurs(
                            valeur
                        );

                    return true;

                }


                let auMoinsUnDeblocage =
                    false;


                valeur.forEach(
                    id => {

                        if (
                            galerieManager
                                .debloquer(
                                    id
                                )
                        ) {

                            auMoinsUnDeblocage =
                                true;

                        }

                    }
                );


                return auMoinsUnDeblocage;

            }


            return galerieManager
                .debloquer(
                    String(
                        valeur
                    )
                        .trim()
                );

        }
        catch (erreur) {

            console.error(
                "dialogue.js : impossible de débloquer le média :",
                erreur
            );

            return false;

        }

    },


    /*=====================================================
        JOUER UN EFFET SONORE
    =====================================================*/

    jouerEffetSonore(
        nomSon,
        volume = undefined
    ) {

        if (
            !this.audioDisponible()
        ) {

            return false;

        }


        if (
            typeof nomSon !==
                "string" ||
            nomSon.trim() ===
                ""
        ) {

            return false;

        }


        const nom =
            nomSon.trim();


        /*
            Audio Manager V4 attend ici un multiplicateur
            artistique local.

            Il ne faut surtout pas multiplier manuellement
            par le réglage utilisateur : audioManager le fait
            lui-même avec volumeEffets et volumeMixEffets.
        */

        const volumeLocal =
            this.normaliserVolumeSon(
                volume,
                1
            );


        try {

            audioManager
                .jouerSon(
                    nom,
                    volumeLocal
                );


            return true;

        }
        catch (
            erreur
        ) {

            console.error(
                "dialogue.js : impossible de jouer l'effet sonore :",
                erreur
            );


            return false;

        }

    },


    /*=====================================================
        IDENTIFIER UN ÉVÉNEMENT SONORE
    =====================================================*/

    obtenirEvenementSonore(
        message
    ) {

        if (!message) {

            return "";

        }


        const evenement =
            String(

                message.evenement ||

                message.événement ||

                message.typeNotification ||

                ""

            )
                .toLowerCase()

                .normalize(
                    "NFD"
                )

                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )

                .trim();


        switch (evenement) {

            case "succes":

            case "success":

            case "achievement":

                return "succes";


            case "choix-important":

            case "choix important":

            case "choix_important":

            case "important":

                return "choix-important";


            case "information-personnage":

            case "information personnage":

            case "nouvelle-information":

            case "nouvelle information":

            case "revelation-personnage":

                return "information-personnage";


            default:

                return "";

        }

    },


    /*=====================================================
        JOUER LE SON D'UNE NOTIFICATION
    =====================================================*/

    jouerSonNotification(
        message
    ) {

        if (
            !message ||
            typeof message !==
                "object"
        ) {

            return;

        }


        if (
            !this.audioDisponible()
        ) {

            return;

        }


        const evenement =
            this.obtenirEvenementSonore(
                message
            );


        /*
            Aucun événement sonore reconnu :
            aucun son de notification automatique.
        */

        if (
            !evenement
        ) {

            return;

        }


        /*
            Si un son est déjà défini explicitement,
            jouerSonDialogue() l'a déjà pris en charge.

            On évite ainsi de jouer le même son deux fois.
        */

        if (
            typeof message.son ===
                "string" &&
            message.son.trim() !==
                ""
        ) {

            return;

        }


        let nomSon =
            "";


        switch (
            evenement
        ) {

            case "succes":

                nomSon =
                    "succes";

                break;


            case "choix-important":

                nomSon =
                    "notification";

                break;


            case "information-personnage":

                nomSon =
                    "notification";

                break;


            default:

                return;

        }


        try {

            this.jouerEffetSonore(

                nomSon,

                message.volumeSon

            );

        }
        catch (
            erreur
        ) {

            console.error(
                "dialogue.js : impossible de jouer le son de notification :",
                erreur
            );

        }

    },


    /*=====================================================
        JOUER LE SON D'UN DIALOGUE
    =====================================================*/

    jouerSonDialogue(
        message
    ) {

        if (!message) {

            return;

        }


        if (!this.audioDisponible()) {

            return;

        }


        /*
            Aucun son automatique.

            Un son est joué uniquement si le message JSON
            contient explicitement une propriété "son".
        */

        if (
            typeof message.son !==
                "string" ||

            message.son.trim() ===
                ""
        ) {

            return;

        }


        const nomSon =
            message.son.trim();


        /*
            Permet de désactiver explicitement le son.

            Exemple JSON :

            "son": "aucun"
        */

        if (
            nomSon.toLowerCase() ===
                "aucun" ||

            nomSon.toLowerCase() ===
                "none" ||

            nomSon.toLowerCase() ===
                "false"
        ) {

            return;

        }


        try {

            this.jouerEffetSonore(

                nomSon,

                message.volumeSon

            );

        }
        catch (erreur) {

            console.error(
                "dialogue.js : impossible de jouer le son du dialogue :",
                erreur
            );

        }

    },
        /*=====================================================
        NORMALISER LE PERSONNAGE
    =====================================================*/

    normaliserPersonnage(
        personnage
    ) {

        const type =
            String(
                personnage ||
                "narrateur"
            )
                .toLowerCase()
                .trim();


        const alias = {

            narration:
                "narrateur",

            narrateur:
                "narrateur",

            joueur:
                "joueur",

            player:
                "joueur",

            eva:
                "eva",

            zoe:
                "zoe",

            "zoé":
                "zoe",

            emelyne:
                "emelyne",

            "emélyne":
                "emelyne",

            bryan:
                "bryan",

            christophe:
                "christophe",

            "agent accueil":
                "agent-accueil",

            "agent-accueil":
                "agent-accueil",

            "autre policier":
                "autre-policier",

            "autre-policier":
                "autre-policier",

            enqueteur:
                "enqueteur",

            enquêteur:
                "enqueteur",

            policier:
                "policier",

            claire:
                "claire",

            lena:
                "lena",

            morel:
                "lieutenant-morel",

            lieutenant:
                "lieutenant-morel",

            "lieutenant-morel":
                "lieutenant-morel",

            eleve:
                "eleve",

            telephone:
                "telephone",

            tel:
                "telephone",

            sms:
                "sms",

            systeme:
                "systeme",

            succes:
                "systeme"

        };


        return (
            alias[
                type
            ] ||
            type
        );

    },


    /*=====================================================
        OBTENIR LE NOM AFFICHÉ D'UN PERSONNAGE
    =====================================================*/

    obtenirNomPersonnage(
        personnage
    ) {

        const type =
            this.normaliserPersonnage(
                personnage
            );


        const noms = {

            narrateur:
                "",

            joueur:
                "Vous",

            eva:
                "Eva",

            zoe:
                "Zoé",

            emelyne:
                "Emelyne",

            bryan:
                "Bryan",

            christophe:
                "Christophe",

            "agent-accueil":
                "Agent d’accueil",

            "autre-policier":
                "Policier",

            enqueteur:
                "Enquêteur",

            policier:
                "Policier",

            claire:
                "Claire",

            lena:
                "Lena",

            "lieutenant-morel":
                "Lieutenant Morel",

            eleve:
                "Élève",

            telephone:
                "Téléphone",

            sms:
                "SMS",

            systeme:
                "Système"

        };


        if (
            type ===
                "joueur" &&

            typeof moteur !==
                "undefined" &&

            moteur.joueur &&

            moteur.joueur.nom
        ) {

            return String(
                moteur.joueur.nom
            );

        }


        return (
            noms[
                type
            ] ||
            personnage ||
            ""
        );

    },


    /*=====================================================
        REMPLACER LES VARIABLES DANS LE TEXTE
    =====================================================*/

    remplacerVariables(
        texte
    ) {

        let resultat =
            String(
                texte || ""
            );


        let nomJoueur =
            "Joueur";


        if (
            typeof moteur !==
                "undefined" &&

            moteur.joueur &&

            moteur.joueur.nom
        ) {

            nomJoueur =
                String(
                    moteur.joueur.nom
                ).trim();

        }


        resultat =
            resultat

                .replaceAll(
                    "{{nomJoueur}}",
                    nomJoueur
                )

                .replaceAll(
                    "{{nom du joueur}}",
                    nomJoueur
                )

                .replaceAll(
                    "{{nom_du_joueur}}",
                    nomJoueur
                );


        return resultat;

    },


    /*=====================================================
        OBTENIR LA RELATION D'UN PERSONNAGE
    =====================================================*/

    obtenirRelationPersonnage(
        personnage
    ) {

        if (
            typeof moteur ===
                "undefined" ||

            !moteur.joueur
        ) {

            return 0;

        }


        const type =
            this.normaliserPersonnage(
                personnage
            );


        const variablesRelation = {

            eva:
                "relationEva",

            zoe:
                "relationZoe",

            emelyne:
                "relationEmelyne",

            bryan:
                "relationBryan",

            christophe:
                "relationChristophe",

            lena:
                "relationLena"

        };


        const variable =
            variablesRelation[
                type
            ];


        if (!variable) {

            return 0;

        }


        const valeur =
            Number(
                moteur.joueur[
                    variable
                ]
            );


        if (
            !Number.isFinite(
                valeur
            )
        ) {

            return 0;

        }


        return valeur;

    },


    /*=====================================================
        OBTENIR LA CONFIANCE D'UN PERSONNAGE
    =====================================================*/

    obtenirConfiancePersonnage(
        personnage
    ) {

        if (
            typeof moteur ===
                "undefined" ||

            !moteur.joueur
        ) {

            return 0;

        }


        const type =
            this.normaliserPersonnage(
                personnage
            );


        const variablesConfiance = {

            eva:
                "confianceEva",

            zoe:
                "confianceZoe",

            emelyne:
                "confianceEmelyne",

            bryan:
                "confianceBryan",

            christophe:
                "confianceChristophe",

            lena:
                "confianceLena"

        };


        const variable =
            variablesConfiance[
                type
            ];


        if (!variable) {

            return 0;

        }


        const valeur =
            Number(
                moteur.joueur[
                    variable
                ]
            );


        if (
            !Number.isFinite(
                valeur
            )
        ) {

            return 0;

        }


        return valeur;

    },


    /*=====================================================
        DÉTERMINER LE NIVEAU DE RELATION
    =====================================================*/

    obtenirNiveauRelation(
        personnage
    ) {

        const relation =
            this.obtenirRelationPersonnage(
                personnage
            );


        if (
            relation < 0
        ) {

            return "negative";

        }


        if (
            relation < 5
        ) {

            return "neutre";

        }


        if (
            relation < 10
        ) {

            return "amicale";

        }


        return "proche";

    },


    /*=====================================================
        DÉTERMINER LE NIVEAU DE CONFIANCE
    =====================================================*/

    obtenirNiveauConfiance(
        personnage
    ) {

        const confiance =
            this.obtenirConfiancePersonnage(
                personnage
            );


        if (
            confiance < 0
        ) {

            return "negative";

        }


        if (
            confiance < 5
        ) {

            return "faible";

        }


        if (
            confiance < 10
        ) {

            return "moyenne";

        }


        return "haute";

    },


    /*=====================================================
        CHOISIR LE TEXTE SELON LA RELATION
    =====================================================*/

    obtenirTexteMessage(
        message
    ) {

        if (!message) {

            return "";

        }


        if (
            !message.variantes ||

            typeof message.variantes !==
                "object"
        ) {

            return (
                message.texte ||
                ""
            );

        }


        const personnageReference =

            message.relationAvec ||

            message.personnage ||

            message.type ||

            "narrateur";


        const niveau =
            this.obtenirNiveauRelation(
                personnageReference
            );


        return (

            message.variantes[
                niveau
            ] ||

            message.variantes.neutre ||

            message.variantes.amicale ||

            message.variantes.proche ||

            message.variantes.negative ||

            message.texte ||

            ""

        );

    },


    /*=====================================================
        CHOISIR LE TEXTE SELON LA CONFIANCE
    =====================================================*/

    obtenirTexteConfiance(
        message
    ) {

        if (!message) {

            return "";

        }


        if (
            !message.variantesConfiance ||

            typeof message
                .variantesConfiance !==
                "object"
        ) {

            return this.obtenirTexteMessage(
                message
            );

        }


        const personnageReference =

            message.confianceAvec ||

            message.relationAvec ||

            message.personnage ||

            message.type ||

            "narrateur";


        const niveau =
            this.obtenirNiveauConfiance(
                personnageReference
            );


        return (

            message.variantesConfiance[
                niveau
            ] ||

            message.variantesConfiance.faible ||

            message.texte ||

            this.obtenirTexteMessage(
                message
            ) ||

            ""

        );

    },


    /*=====================================================
        OBTENIR LE TEXTE FINAL
    =====================================================*/

    preparerTexteMessage(
        message
    ) {

        if (!message) {

            return "";

        }


        let texte =
            this.obtenirTexteConfiance(
                message
            );


        texte =
            this.remplacerVariables(
                texte
            );


        return texte;

    },
        /*=====================================================
        VIDER LA CONVERSATION
    =====================================================*/

    vider() {

        if (!this.conteneur) {

            this.initialiser();

        }


        if (!this.conteneur) {

            return;

        }


        /*
            Augmenter cette valeur annule les indicateurs
            d'écriture et les dialogues encore en attente.
        */

        this.sequenceAffichage += 1;


        this.conteneur.innerHTML =
            "";


        /*
            Le premier personnage de la prochaine scène
            pourra de nouveau produire son son.
        */

        this.dernierPersonnageSonore =
            null;

    },


    /*=====================================================
        AFFICHER UNE SCÈNE
    =====================================================*/

    async afficherScene(
        scene,
        joueur = null
    ) {

        if (
            !scene ||
            typeof scene !==
                "object"
        ) {

            console.error(
                "dialogue.js : scène invalide."
            );


            return false;

        }


        /*
            afficherScene() devient le point d'entrée unique
            utilisé par moteur.js.

            Toute la logique détaillée reste centralisée dans
            afficherListe() :

            - conditions de dialogue ;
            - fonds ;
            - texte selon relation / confiance ;
            - écriture progressive ;
            - indicateur d'écriture ;
            - délais ;
            - sons ;
            - galerie ;
            - effets ;
            - annulation de séquence.

            Cela évite de maintenir deux moteurs de dialogue
            différents dans le même fichier.
        */

        const dialogues =
            Array.isArray(
                scene.dialogues
            )

                ? scene.dialogues

                : scene.texte

                    ? [
                        {
                            ...scene,

                            texte:
                                scene.texte,

                            personnage:
                                scene.personnage ||
                                "narrateur"
                        }
                    ]

                    : [];


        return await this
            .afficherListe(
                dialogues,
                joueur
            );

    },


    /*=====================================================
        CALCULER LE TEMPS D'ÉCRITURE
    =====================================================*/

    calculerDureeEcriture(
        texte,
        options = {}
    ) {

        /*
            Une durée précise peut être déclarée
            directement dans le JSON :

            "dureeEcriture": 1500
        */

        if (
            Number.isFinite(

                Number(
                    options.dureeEcriture
                )

            )
        ) {

            return Math.max(

                0,

                Number(
                    options.dureeEcriture
                )

            );

        }


        /*
            Retire les éventuelles balises HTML afin
            qu'elles ne soient pas comptées comme du texte.

            Exemple :

            <strong>Salut</strong>

            compte uniquement les lettres de "Salut".
        */

        const texteSansBalises =
            String(
                texte || ""
            )
                .replace(
                    /<[^>]*>/g,
                    ""
                )
                .trim();


        /*
            Chaque message peut modifier localement
            les réglages du temps d'écriture.
        */

        const minimum =
            Number.isFinite(

                Number(
                    options.dureeEcritureMinimum
                )

            )
                ? Number(
                    options.dureeEcritureMinimum
                )

                : this.dureeEcritureMinimum;


        const maximum =
            Number.isFinite(

                Number(
                    options.dureeEcritureMaximum
                )

            )
                ? Number(
                    options.dureeEcritureMaximum
                )

                : this.dureeEcritureMaximum;


        const parCaractere =
            Number.isFinite(

                Number(
                    options.dureeParCaractere
                )

            )
                ? Number(
                    options.dureeParCaractere
                )

                : this.dureeParCaractere;


        const dureeCalculee =

            texteSansBalises.length *

            Math.max(
                0,
                parCaractere
            );


        /*
            La durée reste comprise entre le minimum
            et le maximum configurés.
        */

        return Math.min(

            Math.max(

                minimum,

                dureeCalculee

            ),

            Math.max(

                minimum,

                maximum

            )

        );

    },


    /*=====================================================
        AFFICHER L'INDICATEUR D'ÉCRITURE
    =====================================================*/

    async afficherIndicateurEcriture(
        personnage,
        duree,
        sequence =
            this.sequenceAffichage
    ) {

        if (!this.conteneur) {

            this.initialiser();

        }


        if (!this.conteneur) {

            return false;

        }


        const type =
            this.normaliserPersonnage(
                personnage
            );


        const indicateur =
            document.createElement(
                "div"
            );


        indicateur.classList.add(

            "message",

            type,

            "message-ecriture"

        );


        const ligneNom =
            document.createElement(
                "div"
            );


        ligneNom.classList.add(
            "nom"
        );


        const nom =
            this.obtenirNomPersonnage(
                type
            );


        if (nom) {

            ligneNom.textContent =
                nom;

        }


        const bulle =
            document.createElement(
                "div"
            );


        bulle.classList.add(

            "bulle",

            "bulle-ecriture"

        );


        for (
            let i = 0;
            i < 3;
            i += 1
        ) {

            const point =
                document.createElement(
                    "span"
                );


            point.classList.add(
                "point-ecriture"
            );


            point.setAttribute(
                "aria-hidden",
                "true"
            );


            bulle.appendChild(
                point
            );

        }


        indicateur.appendChild(
            ligneNom
        );


        indicateur.appendChild(
            bulle
        );


        this.conteneur.appendChild(
            indicateur
        );


        this.defiler();


        /*
            L'indicateur reste visible pendant la durée
            calculée selon la longueur du message.
        */

        await this.attendre(
            duree
        );


        /*
            Il est retiré avant l'apparition
            de la véritable bulle.
        */

        indicateur.remove();


        /*
            Retourne false si une autre scène a été
            chargée pendant l'attente.
        */

        return (

            sequence ===
            this.sequenceAffichage

        );

    },


    /*=====================================================
        AJOUTER UN MESSAGE
    =====================================================*/

    ajouterMessage(
        contenu,
        personnage = "narrateur",
        options = {}
    ) {

        if (
            !this.conteneur
        ) {

            this.initialiser();

        }


        if (
            !this.conteneur
        ) {

            return null;

        }


        /*---------------------------------------------
         FOND ASSOCIÉ AU MESSAGE
        ---------------------------------------------*/

        if (
            options &&
            typeof options ===
                "object" &&
            typeof moteur !==
                "undefined" &&
            moteur !==
                null &&
            typeof moteur
                .gererFondDialogue ===
                "function"
        ) {

            try {

                moteur
                    .gererFondDialogue(
                        options
                    );

            }
            catch (erreur) {

                console.error(
                    "dialogue.js : erreur pendant le changement de fond :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         NORMALISATION DU PERSONNAGE
        ---------------------------------------------*/

        const type =
            this.normaliserPersonnage(
                personnage
            );


        /*---------------------------------------------
         TEXTE FINAL
        ---------------------------------------------*/

        const texteFinal =
            this.remplacerVariables(
                contenu
            );


        if (
            !texteFinal
        ) {

            return null;

        }


        /*---------------------------------------------
         CONTENEUR DU MESSAGE
        ---------------------------------------------*/

        const message =
            document.createElement(
                "div"
            );


        message.classList.add(
            "message",
            type
        );


        /*---------------------------------------------
         CLASSE PERSONNALISÉE
        ---------------------------------------------*/

        if (
            typeof options.classe ===
                "string" &&
            options.classe.trim() !==
                ""
        ) {

            options.classe
                .trim()
                .split(
                    /\s+/
                )
                .forEach(
                    classe => {

                        if (
                            classe
                        ) {

                            message.classList.add(
                                classe
                            );

                        }

                    }
                );

        }


        /*---------------------------------------------
         MESSAGE IMPORTANT
        ---------------------------------------------*/

        if (
            options.important ===
                true
        ) {

            message.classList.add(
                "important"
            );

        }


        /*---------------------------------------------
         MESSAGE SECRET
        ---------------------------------------------*/

        if (
            options.secret ===
                true
        ) {

            message.classList.add(
                "secret"
            );

        }


        /*---------------------------------------------
         MESSAGE SYSTÈME
        ---------------------------------------------*/

        if (
            type ===
                "systeme"
        ) {

            message.classList.add(
                "message-systeme"
            );

        }


        /*---------------------------------------------
         MESSAGE NARRATION
        ---------------------------------------------*/

        if (
            type ===
                "narrateur"
        ) {

            message.classList.add(
                "narration"
            );

        }


        /*---------------------------------------------
         NOM DU PERSONNAGE
        ---------------------------------------------*/

        const nom =
            document.createElement(
                "div"
            );


        nom.classList.add(
            "nom"
        );


        const nomPersonnage =
            this.obtenirNomPersonnage(
                type
            );


        /*
            La narration n'affiche pas de nom.
        */

        if (
            nomPersonnage
        ) {

            nom.textContent =
                nomPersonnage;


            message.appendChild(
                nom
            );

        }


        /*---------------------------------------------
         BULLE
        ---------------------------------------------*/

        const bulle =
            document.createElement(
                "div"
            );


        bulle.classList.add(
            "bulle"
        );


        /*---------------------------------------------
         HTML AUTORISÉ EXPLICITEMENT
        ---------------------------------------------*/

        if (
            options.html ===
                true
        ) {

            bulle.innerHTML =
                texteFinal;

        }
        else {

            bulle.textContent =
                texteFinal;

        }


        /*---------------------------------------------
         TITRE / TOOLTIP
        ---------------------------------------------*/

        if (
            typeof options.titre ===
                "string" &&
            options.titre.trim() !==
                ""
        ) {

            bulle.title =
                options.titre.trim();

        }


        /*---------------------------------------------
         ACCESSIBILITÉ
        ---------------------------------------------*/

        if (
            type ===
                "narrateur"
        ) {

            bulle.setAttribute(
                "aria-label",
                texteFinal
            );

        }
        else {

            bulle.setAttribute(
                "aria-label",
                `${nomPersonnage} : ${texteFinal}`
            );

        }


        message.appendChild(
            bulle
        );


        /*---------------------------------------------
         AJOUT AU DOM
        ---------------------------------------------*/

        this.conteneur.appendChild(
            message
        );


        /*---------------------------------------------
         GALERIE

         Le média est débloqué uniquement maintenant,
         lorsque la véritable bulle est présente dans
         la conversation.

         Cela empêche le déblocage si le message n'est
         finalement jamais affiché.
        ---------------------------------------------*/

        this.gererGalerieDialogue(
            options
        );


        /*---------------------------------------------
         SON DU DIALOGUE
        ---------------------------------------------*/

        this.jouerSonDialogue(
            options
        );


        /*---------------------------------------------
         SON DE NOTIFICATION
        ---------------------------------------------*/

        this.jouerSonNotification(
            options
        );


        /*---------------------------------------------
         CLASSE D'APPARITION
        ---------------------------------------------*/

        requestAnimationFrame(
            () => {

                message.classList.add(
                    "envoye"
                );

            }
        );


        /*---------------------------------------------
         DÉFILEMENT AUTOMATIQUE
        ---------------------------------------------*/

        this.defiler();


        /*---------------------------------------------
         ÉVÉNEMENT PERSONNALISÉ
        ---------------------------------------------*/

        try {

            document.dispatchEvent(

                new CustomEvent(
                    "dialogueAffiche",
                    {

                        detail: {

                            personnage:
                                type,

                            texte:
                                texteFinal,

                            options:
                                options,

                            element:
                                message

                        }

                    }
                )

            );

        }
        catch (erreur) {

            /*
                Le jeu continue même si les événements
                personnalisés ne sont pas disponibles.
            */

        }


        return message;

    },


    /*=====================================================
        AJOUTER UNE NARRATION
    =====================================================*/

    ajouterNarration(
        contenu,
        options = {}
    ) {

        return this.ajouterMessage(

            contenu,

            "narrateur",

            options

        );

    },


    /*=====================================================
        AJOUTER UN MESSAGE DU JOUEUR
    =====================================================*/

    ajouterMessageJoueur(
        contenu,
        options = {}
    ) {

        return this.ajouterMessage(

            contenu,

            "joueur",

            options

        );

    },


    /*=====================================================
        AJOUTER UN MESSAGE SYSTÈME
    =====================================================*/

    ajouterMessageSysteme(
        contenu,
        options = {}
    ) {

        return this.ajouterMessage(

            contenu,

            "systeme",

            options

        );

    },


    /*=====================================================
        AJOUTER UNE NOTIFICATION
    =====================================================*/

    ajouterNotification(
        contenu,
        evenement = "",
        options = {}
    ) {

        const configuration = {

            ...options,

            evenement:
                evenement ||

                options.evenement ||

                ""

        };


        return this.ajouterMessage(

            contenu,

            "systeme",

            configuration

        );

    },
        /*=====================================================
        AFFICHER UN SUCCÈS

        Fonction utilisée par succesManager.

        Permet :
        - d'afficher le succès dans la conversation ;
        - de conserver la compatibilité avec succes.js ;
        - de jouer le son de succès ;
        - d'utiliser le style système.
    =====================================================*/

    succes(
        texte,
        options = {}
    ) {

        if (
            !texte
        ) {

            return null;

        }


        /*
         Si succes.js demande explicitement
         l'affichage dans la conversation.
        */

        if (
            options.dansConversation ===
                true
        ) {

            return this.ajouterMessage(

                texte,

                "systeme",

                {

                    ...options,

                    personnage:
                        "systeme",

                    evenement:
                        "succes",

                    son:
                        options.son ||
                        "succes",

                    classe:
                        [
                            options.classe,
                            "notification-succes"
                        ]
                            .filter(
                                Boolean
                            )
                            .join(
                                " "
                            ),

                    important:
                        true

                }

            );

        }


        /*
         Compatibilité avec l'ancien comportement :
         notification de succès standard.
        */

        return this.ajouterNotification(

            texte,

            "succes",

            {

                ...options,

                classe:
                    [
                        options.classe,
                        "notification-succes"
                    ]
                        .filter(
                            Boolean
                        )
                        .join(
                            " "
                        ),

                important:
                    true

            }

        );

    },


    /*=====================================================
        AFFICHER UNE NOTIFICATION DE SUCCÈS
    =====================================================*/

    afficherNotificationSucces(
        titre,
        description = ""
    ) {

        let texte =
            "Succès débloqué";


        if (
            titre
        ) {

            texte +=
                ` : ${titre}`;

        }


        if (
            description
        ) {

            texte +=
                ` — ${description}`;

        }


        return this.ajouterNotification(

            texte,

            "succes",

            {

                classe:
                    "notification-succes",

                important:
                    true

            }

        );

    },


    /*=====================================================
        AFFICHER UNE INFORMATION DE PERSONNAGE
    =====================================================*/

    afficherInformationPersonnage(
        texte,
        options = {}
    ) {

        return this.ajouterNotification(

            texte,

            "information-personnage",

            {

                ...options,

                classe:
                    [
                        options.classe,
                        "notification-information"
                    ]
                        .filter(
                            Boolean
                        )
                        .join(
                            " "
                        )

            }

        );

    },


    /*=====================================================
        AFFICHER UN CHOIX IMPORTANT
    =====================================================*/

    afficherChoixImportant(
        texte,
        options = {}
    ) {

        return this.ajouterNotification(

            texte,

            "choix-important",

            {

                ...options,

                classe:
                    [
                        options.classe,
                        "notification-choix-important"
                    ]
                        .filter(
                            Boolean
                        )
                        .join(
                            " "
                        ),

                important:
                    true

            }

        );

    },


    /*=====================================================
        DÉFILER VERS LE BAS
    =====================================================*/

    defiler() {

        if (
            !this.conteneur
        ) {

            return;

        }


        const conversation =
            document.getElementById(
                "conversation"
            );


        /*
            Le scroll principal du jeu se trouve
            normalement sur #conversation.
        */

        const cible =
            conversation ||
            this.conteneur;


        try {

            cible.scrollTo(
                {

                    top:
                        cible.scrollHeight,

                    behavior:
                        "smooth"

                }
            );

        }
        catch (erreur) {

            cible.scrollTop =
                cible.scrollHeight;

        }

    },


    /*=====================================================
        ATTENDRE
    =====================================================*/

    attendre(
        duree
    ) {

        let temps =
            Number(
                duree
            );


        if (
            !Number.isFinite(
                temps
            ) ||
            temps <
                0
        ) {

            temps =
                0;

        }


        return new Promise(
            resolve => {

                setTimeout(
                    resolve,
                    temps
                );

            }
        );

    },


    /*=====================================================
        OBTENIR LE NOM D'UN PERSONNAGE

        Alias conservé pour compatibilité avec
        les anciennes fonctions du fichier.
    =====================================================*/

    obtenirNom(
        personnage
    ) {

        return this.obtenirNomPersonnage(
            personnage
        );

    },


    /*=====================================================
        ÉCRIRE UN MESSAGE PROGRESSIVEMENT

        Cette méthode est utilisée lorsqu'un message
        doit apparaître caractère par caractère.

        Le système conserve :
        - l'indicateur d'écriture ;
        - les délais de ponctuation ;
        - l'annulation lors d'un changement de scène ;
        - les sons ;
        - les animations ;
        - la galerie.
    =====================================================*/

    async ecrireProgressivement(
        contenu,
        personnage = "narrateur",
        vitesse = 20,
        options = {}
    ) {

        if (
            !this.conteneur
        ) {

            this.initialiser();

        }


        if (
            !this.conteneur
        ) {

            return null;

        }


        /*---------------------------------------------
         FOND ASSOCIÉ AU MESSAGE

         Utile lorsque ecrireProgressivement()
         est appelé directement sans passer
         par afficherScene().
        ---------------------------------------------*/

        if (
            options &&
            typeof options ===
                "object" &&

            typeof moteur !==
                "undefined" &&

            moteur !==
                null &&

            typeof moteur
                .gererFondDialogue ===
                "function"
        ) {

            try {

                moteur
                    .gererFondDialogue(
                        options
                    );

            }
            catch (
                erreur
            ) {

                console.error(
                    "dialogue.js : erreur pendant le changement de fond du message progressif :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         PRÉPARATION DU TEXTE
        ---------------------------------------------*/

        const contenuPrepare =
            this.remplacerVariables(
                contenu
            );


        if (
            !contenuPrepare
        ) {

            return null;

        }


        /*---------------------------------------------
         PERSONNAGE
        ---------------------------------------------*/

        const type =
            this.normaliserPersonnage(
                personnage
            );


        /*---------------------------------------------
         SÉQUENCE ACTIVE

         Si une autre scène démarre,
         sequenceAffichage change et cette écriture
         est immédiatement abandonnée.
        ---------------------------------------------*/

        const sequence =
            this.sequenceAffichage;


        /*---------------------------------------------
         INDICATEUR D'ÉCRITURE
        ---------------------------------------------*/

        const afficherEcriture =

            options.afficherEcriture ===
                true ||

            (

                options.afficherEcriture !==
                    false &&

                type !==
                    "narrateur" &&

                type !==
                    "narration" &&

                type !==
                    "pensee" &&

                type !==
                    "systeme"

            );


        if (
            afficherEcriture
        ) {

            const duree =
                this.calculerDureeEcriture(
                    contenuPrepare,
                    options
                );


            const termine =
                await this
                    .afficherIndicateurEcriture(
                        personnage,
                        duree,
                        sequence
                    );


            if (
                !termine
            ) {

                return null;

            }

        }


        /*---------------------------------------------
         VÉRIFICATION AVANT CRÉATION DU MESSAGE
        ---------------------------------------------*/

        if (
            sequence !==
                this.sequenceAffichage
        ) {

            return null;

        }


        /*---------------------------------------------
         CONTENEUR PRINCIPAL
        ---------------------------------------------*/

        const message =
            document.createElement(
                "div"
            );


        message.classList.add(
            "message",
            type
        );


        /*---------------------------------------------
         JOUEUR / AUTRES PERSONNAGES
        ---------------------------------------------*/

        if (
            type ===
                "joueur"
        ) {

            message.classList.add(
                "envoye"
            );

        }
        else {

            message.classList.add(
                "recu"
            );

        }


        /*---------------------------------------------
         CLASSE PERSONNALISÉE
        ---------------------------------------------*/

        if (
            typeof options.classe ===
                "string" &&
            options.classe.trim() !==
                ""
        ) {

            options.classe
                .trim()
                .split(
                    /\s+/
                )
                .forEach(
                    classe => {

                        if (
                            classe
                        ) {

                            message
                                .classList
                                .add(
                                    classe
                                );

                        }

                    }
                );

        }


        /*---------------------------------------------
         MESSAGE IMPORTANT
        ---------------------------------------------*/

        if (
            options.important ===
                true
        ) {

            message.classList.add(
                "important"
            );

        }


        /*---------------------------------------------
         MESSAGE SECRET
        ---------------------------------------------*/

        if (
            options.secret ===
                true
        ) {

            message.classList.add(
                "secret"
            );

        }


        /*---------------------------------------------
         MESSAGE SYSTÈME
        ---------------------------------------------*/

        if (
            type ===
                "systeme"
        ) {

            message.classList.add(
                "message-systeme"
            );

        }


        /*---------------------------------------------
         NARRATION
        ---------------------------------------------*/

        if (
            type ===
                "narrateur" ||
            type ===
                "narration"
        ) {

            message.classList.add(
                "narration"
            );

        }


        /*---------------------------------------------
         NOM DU PERSONNAGE
        ---------------------------------------------*/

        const nomPersonnage =
            this.obtenirNomPersonnage(
                type
            );


        if (
            nomPersonnage &&
            type !==
                "narrateur" &&
            type !==
                "narration" &&
            type !==
                "pensee"
        ) {

            const nom =
                document.createElement(
                    "div"
                );


            nom.classList.add(
                "nom"
            );


            nom.textContent =
                nomPersonnage;


            message.appendChild(
                nom
            );

        }


        /*---------------------------------------------
         BULLE VIDE
        ---------------------------------------------*/

        const bulle =
            document.createElement(
                "div"
            );


        bulle.classList.add(
            "bulle"
        );


        message.appendChild(
            bulle
        );


        /*---------------------------------------------
         AJOUT AU DOM
        ---------------------------------------------*/

        this.conteneur.appendChild(
            message
        );


        /*---------------------------------------------
         SON DU MESSAGE
        ---------------------------------------------*/

        this.jouerSonDialogue(
            {

                ...options,

                personnage:

                    options.personnage ||

                    options.type ||

                    personnage

            }
        );


        /*---------------------------------------------
         NOTIFICATION ÉVENTUELLE
        ---------------------------------------------*/

        this.jouerSonNotification(
            options
        );


        /*---------------------------------------------
         PREMIER DÉFILEMENT
        ---------------------------------------------*/

        this.defiler();


        /*---------------------------------------------
         VITESSE D'ÉCRITURE
        ---------------------------------------------*/

        let delai =
            Number(
                vitesse
            );


        if (
            !Number.isFinite(
                delai
            ) ||
            delai <
                0
        ) {

            delai =
                20;

        }


        if (
            Number.isFinite(
                Number(
                    options.vitesseEcriture
                )
            )
        ) {

            delai =
                Math.max(
                    0,
                    Number(
                        options.vitesseEcriture
                    )
                );

        }


        let texteAffiche =
            "";


        /*---------------------------------------------
         ÉCRITURE CARACTÈRE PAR CARACTÈRE
        ---------------------------------------------*/

        for (
            let index = 0;
            index < contenuPrepare.length;
            index += 1
        ) {

            /*
             Une nouvelle scène a commencé.
            */

            if (
                sequence !==
                    this.sequenceAffichage
            ) {

                message.remove();

                return null;

            }


            const caractere =
                contenuPrepare[
                    index
                ];


            texteAffiche +=
                caractere;


            bulle.textContent =
                texteAffiche;


            this.defiler();


            /*
             Délais supplémentaires sur la ponctuation
             afin de rendre l'écriture plus naturelle.
            */

            let delaiActuel =
                delai;


            if (
                caractere ===
                    "." ||
                caractere ===
                    "!" ||
                caractere ===
                    "?"
            ) {

                delaiActuel +=
                    180;

            }
            else if (
                caractere ===
                    "," ||
                caractere ===
                    ";" ||
                caractere ===
                    ":"
            ) {

                delaiActuel +=
                    80;

            }
            else if (
                caractere ===
                    "\n"
            ) {

                delaiActuel +=
                    100;

            }


            if (
                delaiActuel >
                0
            ) {

                await this.attendre(
                    delaiActuel
                );

            }

        }


        /*---------------------------------------------
         VÉRIFICATION FINALE DE LA SÉQUENCE
        ---------------------------------------------*/

        if (
            sequence !==
                this.sequenceAffichage
        ) {

            message.remove();

            return null;

        }


        /*---------------------------------------------
         HTML FINAL

         L'écriture progressive utilise textContent
         pendant l'animation.

         Si le HTML est autorisé, il est appliqué
         uniquement une fois l'écriture terminée.
        ---------------------------------------------*/

        if (
            options.html ===
                true
        ) {

            bulle.innerHTML =
                contenuPrepare;

        }


        /*---------------------------------------------
         ACCESSIBILITÉ
        ---------------------------------------------*/

        if (
            type ===
                "narrateur" ||
            type ===
                "narration"
        ) {

            bulle.setAttribute(
                "aria-label",
                contenuPrepare
            );

        }
        else {

            bulle.setAttribute(
                "aria-label",
                `${nomPersonnage} : ${contenuPrepare}`
            );

        }


        /*---------------------------------------------
         GALERIE

         Le média est débloqué uniquement lorsque
         le message a réellement fini de s'afficher.
        ---------------------------------------------*/

        this.gererGalerieDialogue(
            options
        );


        /*---------------------------------------------
         ANIMATION MANAGER
        ---------------------------------------------*/

        if (
            typeof animationManager !==
                "undefined" &&
            animationManager !==
                null
        ) {

            try {

                if (
                    type ===
                        "joueur" &&
                    typeof animationManager
                        .envoi ===
                        "function"
                ) {

                    animationManager
                        .envoi(
                            message
                        );

                }
                else if (
                    type !==
                        "joueur" &&
                    typeof animationManager
                        .reception ===
                        "function"
                ) {

                    animationManager
                        .reception(
                            message
                        );

                }

            }
            catch (
                erreur
            ) {

                console.error(
                    "dialogue.js : erreur animation du message progressif :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         ÉVÉNEMENT PERSONNALISÉ
        ---------------------------------------------*/

        try {

            document.dispatchEvent(

                new CustomEvent(
                    "dialogueAffiche",
                    {

                        detail: {

                            personnage:
                                type,

                            texte:
                                contenuPrepare,

                            options:
                                options,

                            element:
                                message,

                            progressif:
                                true

                        }

                    }
                )

            );

        }
        catch (
            erreur
        ) {

            /*
             Pas bloquant.
            */

        }


        this.defiler();


        return message;

    },
        /*=====================================================
        VÉRIFIER SI UNE CONDITION SIMPLE EST SATISFAITE
    =====================================================*/

    verifierConditionMessage(
        condition
    ) {

        if (
            !condition
        ) {

            return true;

        }


        if (
            typeof condition !==
                "object"
        ) {

            return true;

        }


        /*
         Le moteur possède déjà le système principal
         de conditions.

         On le réutilise ici afin de ne pas maintenir
         deux moteurs de conditions différents.
        */

        if (
            typeof moteur !==
                "undefined" &&
            moteur !==
                null &&
            typeof moteur
                .verifierObjetCondition ===
                "function"
        ) {

            try {

                return moteur
                    .verifierObjetCondition(
                        condition
                    );

            }
            catch (
                erreur
            ) {

                console.error(
                    "dialogue.js : erreur pendant la vérification d'une condition :",
                    erreur
                );

            }

        }


        /*
         Si le moteur ne possède pas cette fonction,
         le dialogue reste visible afin de conserver
         la compatibilité avec les anciens chapitres.
        */

        return true;

    },


    /*=====================================================
        VÉRIFIER SI UN MESSAGE DOIT ÊTRE AFFICHÉ
    =====================================================*/

    messageEstDisponible(
        message
    ) {

        if (
            !message ||
            typeof message !==
                "object"
        ) {

            return false;

        }


        /*---------------------------------------------
         DÉSACTIVATION EXPLICITE
        ---------------------------------------------*/

        if (
            message.actif ===
                false
        ) {

            return false;

        }


        /*---------------------------------------------
         CONDITION FACULTATIVE
        ---------------------------------------------*/

        if (
            message.condition
        ) {

            return this
                .verifierConditionMessage(
                    message.condition
                );

        }


        return true;

    },


    /*=====================================================
        APPLIQUER LES EFFETS D'UN MESSAGE

        Formats acceptés :

        "effet": {
            "relationEva": 1
        }

        ou :

        "effets": [
            {
                "relationEva": 1
            },
            {
                "confianceEva": 1
            }
        ]

        Les choix restent le mécanisme principal
        pour les conséquences importantes.
    =====================================================*/

    appliquerEffetsMessage(
        message
    ) {

        if (
            !message ||
            typeof message !==
                "object"
        ) {

            return false;

        }


        if (
            typeof moteur ===
                "undefined" ||
            moteur ===
                null ||
            typeof moteur
                .appliquerEffets !==
                "function"
        ) {

            return false;

        }


        const groupesEffets =
            [];


        /*---------------------------------------------
         EFFET UNIQUE
        ---------------------------------------------*/

        if (
            message.effet &&
            typeof message.effet ===
                "object" &&
            !Array.isArray(
                message.effet
            )
        ) {

            groupesEffets.push(
                message.effet
            );

        }


        /*---------------------------------------------
         PLUSIEURS EFFETS
        ---------------------------------------------*/

        if (
            Array.isArray(
                message.effets
            )
        ) {

            message.effets
                .forEach(
                    effet => {

                        if (
                            effet &&
                            typeof effet ===
                                "object" &&
                            !Array.isArray(
                                effet
                            )
                        ) {

                            groupesEffets.push(
                                effet
                            );

                        }

                    }
                );

        }


        if (
            groupesEffets.length ===
                0
        ) {

            return false;

        }


        try {

            groupesEffets
                .forEach(
                    effets => {

                        moteur
                            .appliquerEffets(
                                effets
                            );

                    }
                );


            /*
             Les succès sont revérifiés après
             l'ensemble des effets du message.
            */

            if (
                typeof moteur
                    .verifierSucces ===
                    "function"
            ) {

                moteur
                    .verifierSucces();

            }


            /*
             Sauvegarde immédiatement après
             les modifications du joueur.
            */

            if (
                typeof moteur
                    .sauvegarder ===
                    "function"
            ) {

                moteur
                    .sauvegarder();

            }


            return true;

        }
        catch (
            erreur
        ) {

            console.error(
                "dialogue.js : erreur pendant l'application des effets du message :",
                erreur
            );


            return false;

        }

    },


    /*=====================================================
        AFFICHER UNE LISTE DE DIALOGUES

        C'est maintenant le moteur central de dialogue.

        Utilisé par :

        afficherScene()
        afficherDialogues()
        certaines fonctions de test

        Il gère notamment :

        - annulation de l'ancienne scène ;
        - conditions ;
        - fonds ;
        - relation / confiance ;
        - écriture progressive ;
        - indicateur d'écriture ;
        - délais ;
        - sons ;
        - galerie ;
        - effets ;
        - callback final.
    =====================================================*/

    async afficherListe(
        dialogues,
        joueur = null,
        callback = null
    ) {

        if (
            !Array.isArray(
                dialogues
            )
        ) {

            if (
                typeof callback ===
                    "function"
            ) {

                callback();

            }


            return false;

        }


        /*
         Chaque nouvelle liste devient une nouvelle
         séquence.

         Une ancienne liste encore en attente détectera
         que son numéro ne correspond plus et s'arrêtera.
        */

        const sequence =
            ++this.sequenceAffichage;


        for (
            const message
            of dialogues
        ) {

            /*---------------------------------------------
             INTERRUPTION PAR UNE NOUVELLE SCÈNE
            ---------------------------------------------*/

            if (
                sequence !==
                    this.sequenceAffichage
            ) {

                return false;

            }


            if (
                !message ||
                typeof message !==
                    "object"
            ) {

                continue;

            }


            /*---------------------------------------------
             CONDITION LOCALE
            ---------------------------------------------*/

            if (
                !this.messageEstDisponible(
                    message
                )
            ) {

                continue;

            }


            /*---------------------------------------------
             FOND DU DIALOGUE
            ---------------------------------------------*/

            if (
                typeof moteur !==
                    "undefined" &&
                moteur !==
                    null
            ) {

                try {

                    if (
                        typeof moteur
                            .gererFondDialogue ===
                            "function"
                    ) {

                        moteur
                            .gererFondDialogue(
                                message
                            );

                    }
                    else if (
                        message.fond &&
                        typeof moteur
                            .changerFond ===
                            "function"
                    ) {

                        const duree =

                            typeof moteur
                                .obtenirDureeTransitionFond ===
                                "function"

                                ? moteur
                                    .obtenirDureeTransitionFond(
                                        message
                                    )

                                : undefined;


                        moteur
                            .changerFond(
                                message.fond,
                                duree
                            );

                    }

                }
                catch (
                    erreur
                ) {

                    console.error(
                        "dialogue.js : erreur fond dialogue :",
                        erreur
                    );

                }

            }


            /*---------------------------------------------
             TEXTE FINAL
            ---------------------------------------------*/

            const texte =
                this.preparerTexteMessage(
                    message
                );


            if (
                !texte
            ) {

                /*
                 Un dialogue sans texte peut quand même
                 servir de déclencheur invisible :

                 {
                     "effet": {
                         "indiceTrouve": true
                     }
                 }
                */

                this.appliquerEffetsMessage(
                    message
                );


                continue;

            }


            const personnage =

                message.personnage ||

                message.type ||

                "narrateur";


            const type =
                this.normaliserPersonnage(
                    personnage
                );


            /*---------------------------------------------
             ÉCRITURE PROGRESSIVE EXPLICITE
            ---------------------------------------------*/

            if (
                message.progressif ===
                    true ||
                message.ecritureProgressive ===
                    true
            ) {

                await this
                    .ecrireProgressivement(
                        texte,
                        personnage,
                        message.vitesseEcriture ??
                            20,
                        message
                    );


                /*
                 Une nouvelle scène a pu commencer
                 pendant l'écriture.
                */

                if (
                    sequence !==
                        this.sequenceAffichage
                ) {

                    return false;

                }


                /*-----------------------------------------
                 EFFETS APRÈS AFFICHAGE
                -----------------------------------------*/

                this.appliquerEffetsMessage(
                    message
                );


                /*-----------------------------------------
                 PAUSE APRÈS MESSAGE
                -----------------------------------------*/

                const pauseProgressive =
                    this.obtenirPauseApresMessage(
                        message
                    );


                if (
                    pauseProgressive >
                    0
                ) {

                    await this.attendre(
                        pauseProgressive
                    );


                    if (
                        sequence !==
                            this.sequenceAffichage
                    ) {

                        return false;

                    }

                }


                continue;

            }


            /*---------------------------------------------
             INDICATEUR D'ÉCRITURE
            ---------------------------------------------*/

            const afficherEcriture =

                message.afficherEcriture ===
                    true ||

                (

                    message.afficherEcriture !==
                        false &&

                    type !==
                        "narrateur" &&

                    type !==
                        "narration" &&

                    type !==
                        "pensee" &&

                    type !==
                        "systeme"

                );


            if (
                afficherEcriture
            ) {

                const duree =
                    this.calculerDureeEcriture(
                        texte,
                        message
                    );


                const termine =
                    await this
                        .afficherIndicateurEcriture(
                            personnage,
                            duree,
                            sequence
                        );


                if (
                    !termine
                ) {

                    return false;

                }

            }


            /*---------------------------------------------
             DÉLAI AVANT LE MESSAGE

             Exemples JSON :

             "delai": 1200

             "delaiNarration": 1200
            ---------------------------------------------*/

            const delaiAvant =
                this.obtenirDelaiAvantMessage(
                    message,
                    type
                );


            if (
                delaiAvant >
                0
            ) {

                await this.attendre(
                    delaiAvant
                );


                if (
                    sequence !==
                        this.sequenceAffichage
                ) {

                    return false;

                }

            }


            /*---------------------------------------------
             AJOUT DU MESSAGE
            ---------------------------------------------*/

            this.ajouterMessage(
                texte,
                personnage,
                message
            );


            /*---------------------------------------------
             EFFETS DU MESSAGE
            ---------------------------------------------*/

            this.appliquerEffetsMessage(
                message
            );


            /*---------------------------------------------
             PAUSE APRÈS MESSAGE
            ---------------------------------------------*/

            const pause =
                this.obtenirPauseApresMessage(
                    message
                );


            if (
                pause >
                0
            ) {

                await this.attendre(
                    pause
                );


                /*
                 Cette vérification supplémentaire est
                 importante.

                 Dans l'ancienne version, une scène
                 interrompue pendant cette dernière pause
                 pouvait continuer sa boucle après le
                 changement de scène.
                */

                if (
                    sequence !==
                        this.sequenceAffichage
                ) {

                    return false;

                }

            }

        }


        /*---------------------------------------------
         FIN DE LA LISTE
        ---------------------------------------------*/

        if (
            sequence !==
                this.sequenceAffichage
        ) {

            return false;

        }


        if (
            typeof callback ===
                "function"
        ) {

            try {

                callback();

            }
            catch (
                erreur
            ) {

                console.error(
                    "dialogue.js : erreur dans le callback de fin :",
                    erreur
                );

            }

        }


        return true;

    },
        /*=====================================================
        AFFICHER PLUSIEURS DIALOGUES

        Cette fonction est utilisée par certaines
        parties du moteur qui attendent explicitement
        la fin complète d'une liste de dialogues.

        V4 :
        afficherListe() renvoie déjà une Promise car
        elle est async.

        On évite donc l'ancien wrapper new Promise(),
        qui pouvait rester bloqué lorsqu'une séquence
        était interrompue avant l'appel du callback.
    =====================================================*/

    async afficherDialogues(
        dialogues,
        joueur = null
    ) {

        if (
            !Array.isArray(
                dialogues
            )
        ) {

            return false;

        }


        return await this
            .afficherListe(
                dialogues,
                joueur
            );

    },


    /*=====================================================
        AFFICHER UN SEUL MESSAGE

        Compatible avec :

        dialogueManager.afficher(
            message,
            joueur
        );

        Cette fonction est notamment utilisée par
        moteur.js pour certains messages associés
        aux choix.
    =====================================================*/

    async afficher(
        message,
        joueur = null
    ) {

        if (
            !message
        ) {

            return null;

        }


        /*---------------------------------------------
         CHAÎNE SIMPLE
        ---------------------------------------------*/

        if (
            typeof message ===
                "string"
        ) {

            return this.ajouterMessage(
                message,
                "narrateur",
                {}
            );

        }


        if (
            typeof message !==
                "object"
        ) {

            return null;

        }


        /*---------------------------------------------
         CONDITION
        ---------------------------------------------*/

        if (
            !this.messageEstDisponible(
                message
            )
        ) {

            return null;

        }


        /*---------------------------------------------
         FOND
        ---------------------------------------------*/

        this.gererFondMessage(
            message
        );


        /*---------------------------------------------
         TEXTE FINAL
        ---------------------------------------------*/

        const texte =
            this.preparerTexteMessage(
                message
            );


        /*
         Un message sans texte peut malgré tout
         servir à appliquer un effet invisible.
        */

        if (
            !texte
        ) {

            this.appliquerEffetsMessage(
                message
            );


            return null;

        }


        const personnage =

            message.personnage ||

            message.type ||

            "narrateur";


        /*---------------------------------------------
         ÉCRITURE PROGRESSIVE
        ---------------------------------------------*/

        if (
            message.progressif ===
                true ||
            message.ecritureProgressive ===
                true
        ) {

            const resultat =
                await this
                    .ecrireProgressivement(
                        texte,
                        personnage,
                        message.vitesseEcriture ??
                            20,
                        message
                    );


            /*
             Si l'écriture a été annulée par une
             nouvelle scène, on n'applique pas les
             effets du message interrompu.
            */

            if (
                !resultat
            ) {

                return null;

            }


            this.appliquerEffetsMessage(
                message
            );


            return resultat;

        }


        /*---------------------------------------------
         INDICATEUR D'ÉCRITURE FACULTATIF

         afficher() est également capable d'afficher
         l'indicateur comme afficherListe(), mais sans
         imposer ce comportement aux narrations.
        ---------------------------------------------*/

        const type =
            this.normaliserPersonnage(
                personnage
            );


        const afficherEcriture =

            message.afficherEcriture ===
                true ||

            (

                message.afficherEcriture !==
                    false &&

                type !==
                    "narrateur" &&

                type !==
                    "narration" &&

                type !==
                    "pensee" &&

                type !==
                    "systeme"

            );


        if (
            afficherEcriture
        ) {

            const sequence =
                this.sequenceAffichage;


            const duree =
                this.calculerDureeEcriture(
                    texte,
                    message
                );


            const termine =
                await this
                    .afficherIndicateurEcriture(
                        personnage,
                        duree,
                        sequence
                    );


            if (
                !termine
            ) {

                return null;

            }

        }


        /*---------------------------------------------
         DÉLAI AVANT MESSAGE
        ---------------------------------------------*/

        const delaiAvant =
            this.obtenirDelaiAvantMessage(
                message,
                type
            );


        if (
            delaiAvant >
            0
        ) {

            const sequenceAvant =
                this.sequenceAffichage;


            await this.attendre(
                delaiAvant
            );


            if (
                sequenceAvant !==
                    this.sequenceAffichage
            ) {

                return null;

            }

        }


        /*---------------------------------------------
         MESSAGE NORMAL
        ---------------------------------------------*/

        const resultat =
            this.ajouterMessage(
                texte,
                personnage,
                message
            );


        if (
            !resultat
        ) {

            return null;

        }


        /*---------------------------------------------
         EFFETS
        ---------------------------------------------*/

        this.appliquerEffetsMessage(
            message
        );


        return resultat;

    },


    /*=====================================================
        OBTENIR LE DÉLAI AVANT UN MESSAGE

        Formats acceptés :

        "delaiAvant": 1000
        "delai": 1000
        "delay": 1000
        "tempsAvant": 1000

        Pour une narration :

        "delaiNarration": 1000
    =====================================================*/

    obtenirDelaiAvantMessage(
        message,
        personnage = "narrateur"
    ) {

        if (
            !message ||
            typeof message !==
                "object"
        ) {

            return 0;

        }


        const valeurs = [

            message.delaiAvant,

            message.delai,

            message.delay,

            message.tempsAvant

        ];


        const type =
            this.normaliserPersonnage(
                personnage
            );


        /*---------------------------------------------
         DÉLAI SPÉCIFIQUE AUX NARRATIONS
        ---------------------------------------------*/

        if (
            type ===
                "narrateur" ||
            type ===
                "narration"
        ) {

            valeurs.unshift(
                message.delaiNarration
            );

        }


        for (
            const valeur
            of valeurs
        ) {

            /*
             On ignore complètement les propriétés
             absentes plutôt que de convertir undefined
             en une valeur arbitraire.
            */

            if (
                valeur === undefined ||
                valeur === null ||
                valeur === ""
            ) {

                continue;

            }


            const nombre =
                Number(
                    valeur
                );


            if (
                Number.isFinite(
                    nombre
                ) &&
                nombre >=
                    0
            ) {

                return nombre;

            }

        }


        return 0;

    },


    /*=====================================================
        OBTENIR LA PAUSE APRÈS UN MESSAGE

        Formats acceptés :

        "pauseApres": 500
        "delaiApres": 500
        "pause": 500
        "afterDelay": 500

        En l'absence de valeur :
        pauseEntreMessages est utilisée.
    =====================================================*/

    obtenirPauseApresMessage(
        message
    ) {

        if (
            !message ||
            typeof message !==
                "object"
        ) {

            return this
                .pauseEntreMessages;

        }


        const valeurs = [

            message.pauseApres,

            message.delaiApres,

            message.pause,

            message.afterDelay

        ];


        for (
            const valeur
            of valeurs
        ) {

            if (
                valeur === undefined ||
                valeur === null ||
                valeur === ""
            ) {

                continue;

            }


            const nombre =
                Number(
                    valeur
                );


            if (
                Number.isFinite(
                    nombre
                ) &&
                nombre >=
                    0
            ) {

                return nombre;

            }

        }


        return this
            .pauseEntreMessages;

    },


    /*=====================================================
        GÉRER LE FOND D'UN MESSAGE

        Cette fonction peut être utilisée directement
        si le message n'est pas passé par afficherListe().

        Le moteur reste responsable du système de fonds.
    =====================================================*/

    gererFondMessage(
        message
    ) {

        if (
            !message ||
            typeof message !==
                "object" ||
            !message.fond
        ) {

            return false;

        }


        if (
            typeof moteur ===
                "undefined" ||
            moteur ===
                null
        ) {

            return false;

        }


        try {

            /*-----------------------------------------
             API PRINCIPALE DU NOUVEAU MOTEUR
            -----------------------------------------*/

            if (
                typeof moteur
                    .gererFondDialogue ===
                    "function"
            ) {

                moteur
                    .gererFondDialogue(
                        message
                    );


                return true;

            }


            /*-----------------------------------------
             COMPATIBILITÉ ANCIEN MOTEUR
            -----------------------------------------*/

            if (
                typeof moteur
                    .changerFond ===
                    "function"
            ) {

                let duree =
                    undefined;


                if (
                    typeof moteur
                        .obtenirDureeTransitionFond ===
                        "function"
                ) {

                    duree =
                        moteur
                            .obtenirDureeTransitionFond(
                                message
                            );

                }


                moteur
                    .changerFond(
                        message.fond,
                        duree,
                        message
                    );


                return true;

            }

        }
        catch (
            erreur
        ) {

            console.error(
                "dialogue.js : erreur pendant gererFondMessage() :",
                erreur
            );

        }


        return false;

    },


    /*=====================================================
        TRAITER UN MESSAGE COMPLET

        Fonction utilitaire regroupant :

        - condition ;
        - fond ;
        - affichage ;
        - effets.

        afficher() se charge lui-même de l'effet pour
        éviter qu'il soit appliqué deux fois.
    =====================================================*/

    async traiterMessage(
        message,
        joueur = null
    ) {

        if (
            !message ||
            typeof message !==
                "object"
        ) {

            return null;

        }


        if (
            !this.messageEstDisponible(
                message
            )
        ) {

            return null;

        }


        this.gererFondMessage(
            message
        );


        return await this.afficher(
            message,
            joueur
        );

    },


    /*=====================================================
        AFFICHER UNE SCÈNE ET ATTENDRE SA FIN

        Variante utilitaire utilisant directement
        afficherDialogues().
    =====================================================*/

    async jouerScene(
        scene,
        joueur = null
    ) {

        if (
            !scene ||
            typeof scene !==
                "object"
        ) {

            return false;

        }


        const dialogues =
            Array.isArray(
                scene.dialogues
            )

                ? scene.dialogues

                : [];


        return await this
            .afficherDialogues(
                dialogues,
                joueur
            );

    },


    /*=====================================================
        ANNULER LA SÉQUENCE ACTUELLE

        Incrémente sequenceAffichage afin de rendre
        obsolètes :

        - les indicateurs d'écriture ;
        - les écritures progressives ;
        - les délais avant messages ;
        - les pauses entre messages ;
        - toute ancienne boucle afficherListe().
    =====================================================*/

    annulerSequence() {

        this.sequenceAffichage +=
            1;


        return this.sequenceAffichage;

    },


    /*=====================================================
        ARRÊTER LES DIALOGUES EN COURS
    =====================================================*/

    arreter() {

        this.annulerSequence();


        /*---------------------------------------------
         SUPPRIMER LES INDICATEURS D'ÉCRITURE
        ---------------------------------------------*/

        document
            .querySelectorAll(
                ".message-ecriture"
            )
            .forEach(
                element => {

                    try {

                        element.remove();

                    }
                    catch (
                        erreur
                    ) {

                        /*
                         L'élément peut avoir déjà
                         disparu entre-temps.
                        */

                    }

                }
            );


        return true;

    },
        /*=====================================================
        NETTOYER LE GESTIONNAIRE
    =====================================================*/

    nettoyer() {

        this.arreter();


        this.dernierPersonnageSonore =
            null;


        return true;

    },


    /*=====================================================
        RÉINITIALISER COMPLÈTEMENT

        Annule :
        - les dialogues en cours ;
        - les indicateurs d'écriture ;
        - les anciennes séquences ;

        puis vide la conversation.
    =====================================================*/

    reinitialiser() {

        this.nettoyer();


        if (
            !this.conteneur
        ) {

            this.initialiser();

        }


        if (
            this.conteneur
        ) {

            this.conteneur.innerHTML =
                "";

        }


        this.dernierPersonnageSonore =
            null;


        return true;

    },


    /*=====================================================
        VÉRIFIER SI LE GESTIONNAIRE EST INITIALISÉ
    =====================================================*/

    estInitialise() {

        return Boolean(
            this.conteneur
        );

    },


    /*=====================================================
        OBTENIR LE CONTENEUR
    =====================================================*/

    obtenirConteneur() {

        if (
            !this.conteneur
        ) {

            this.initialiser();

        }


        return this.conteneur;

    },


    /*=====================================================
        OBTENIR LA SÉQUENCE ACTIVE

        Fonction principalement utile pour
        le développement et le diagnostic.
    =====================================================*/

    obtenirSequence() {

        return this.sequenceAffichage;

    },


    /*=====================================================
        VÉRIFIER SI UNE SÉQUENCE EST ENCORE VALIDE
    =====================================================*/

    sequenceValide(
        sequence
    ) {

        return (
            sequence ===
            this.sequenceAffichage
        );

    },


    /*=====================================================
        OBTENIR LA RELATION

        Fonction publique pratique pour le moteur
        ou pour les tests console.

        Exemple :

        dialogueManager.obtenirRelation("eva");
    =====================================================*/

    obtenirRelation(
        personnage
    ) {

        return this
            .obtenirRelationPersonnage(
                personnage
            );

    },


    /*=====================================================
        OBTENIR LA CONFIANCE

        Exemple :

        dialogueManager.obtenirConfiance("eva");
    =====================================================*/

    obtenirConfiance(
        personnage
    ) {

        return this
            .obtenirConfiancePersonnage(
                personnage
            );

    },


    /*=====================================================
        OBTENIR LES INFORMATIONS D'UN PERSONNAGE

        Exemple :

        dialogueManager
            .obtenirInformationsPersonnage(
                "eva"
            );

        Retour possible :

        {
            personnage: "eva",
            nom: "Eva",
            relation: 7,
            niveauRelation: "amicale",
            confiance: 5,
            niveauConfiance: "moyenne"
        }
    =====================================================*/

    obtenirInformationsPersonnage(
        personnage
    ) {

        const type =
            this.normaliserPersonnage(
                personnage
            );


        return {

            personnage:
                type,

            nom:
                this.obtenirNomPersonnage(
                    type
                ),

            relation:
                this.obtenirRelationPersonnage(
                    type
                ),

            niveauRelation:
                this.obtenirNiveauRelation(
                    type
                ),

            confiance:
                this.obtenirConfiancePersonnage(
                    type
                ),

            niveauConfiance:
                this.obtenirNiveauConfiance(
                    type
                )

        };

    },


    /*=====================================================
        TESTER UN MESSAGE

        Utilisable dans la console :

        dialogueManager.testMessage(
            "eva",
            "Salut !"
        );
    =====================================================*/

    testMessage(
        personnage = "eva",
        texte = "Message de test."
    ) {

        return this.ajouterMessage(
            texte,
            personnage,
            {}
        );

    },


    /*=====================================================
        TESTER UNE NARRATION
    =====================================================*/

    testNarration(
        texte =
            "Narration de test."
    ) {

        return this.ajouterNarration(
            texte
        );

    },


    /*=====================================================
        TESTER L'ÉCRITURE PROGRESSIVE

        Exemple :

        dialogueManager.testProgressif(
            "eva",
            "Je dois te parler..."
        );
    =====================================================*/

    async testProgressif(
        personnage =
            "eva",

        texte =
            "Ceci est un message progressif de test."
    ) {

        return await this
            .ecrireProgressivement(
                texte,
                personnage,
                20,
                {}
            );

    },


    /*=====================================================
        TESTER LE VOLUME LOCAL D'UN SON

        Très utile avec Audio Manager V4.

        Exemple :

        dialogueManager.testSon(
            "notification",
            0.5
        );

        volume final =
            volume utilisateur effets
            × volumeMixEffets
            × 0.5
    =====================================================*/

    testSon(
        nomSon =
            "notification",

        volume =
            1
    ) {

        return this.jouerEffetSonore(
            nomSon,
            volume
        );

    },


    /*=====================================================
        TESTER LA GALERIE DEPUIS UN DIALOGUE

        Exemple :

        dialogueManager.testGalerie(
            "chap11BaiserFrontAccepte"
        );
    =====================================================*/

    testGalerie(
        id
    ) {

        if (
            !id
        ) {

            return false;

        }


        return this
            .gererGalerieDialogue(
                {

                    galerie:
                        id

                }
            );

    },


    /*=====================================================
        TESTER UNE NOTIFICATION DE SUCCÈS
    =====================================================*/

    testSucces(
        titre =
            "Succès de test"
    ) {

        return this
            .afficherNotificationSucces(
                titre,
                "Notification de test."
            );

    },


    /*=====================================================
        TESTER UNE INFORMATION
    =====================================================*/

    testInformation(
        texte =
            "Nouvelle information obtenue."
    ) {

        return this
            .afficherInformationPersonnage(
                texte
            );

    },


    /*=====================================================
        TESTER UN CHOIX IMPORTANT
    =====================================================*/

    testChoixImportant(
        texte =
            "Ce choix pourrait avoir des conséquences."
    ) {

        return this
            .afficherChoixImportant(
                texte
            );

    },


    /*=====================================================
        AFFICHER DIRECTEMENT UN DIALOGUE JSON

        Exemple :

        dialogueManager.testJSON({
            personnage: "eva",
            texte: "Salut.",
            son: "notification",
            volumeSon: 0.5
        });
    =====================================================*/

    async testJSON(
        message
    ) {

        if (
            !message ||
            typeof message !==
                "object"
        ) {

            console.warn(
                "dialogue.js : testJSON() nécessite un objet."
            );


            return null;

        }


        return await this
            .afficher(
                message
            );

    },


    /*=====================================================
        FORCER LE DÉFILEMENT VERS LE BAS
    =====================================================*/

    allerEnBas() {

        this.defiler();


        return true;

    },


    /*=====================================================
        SAVOIR SI UN MESSAGE EST UNE NARRATION
    =====================================================*/

    estNarration(
        personnage
    ) {

        const type =
            this.normaliserPersonnage(
                personnage
            );


        return (

            type ===
                "narrateur" ||

            type ===
                "narration"

        );

    },


    /*=====================================================
        SAVOIR SI UN MESSAGE VIENT DU JOUEUR
    =====================================================*/

    estJoueur(
        personnage
    ) {

        return (

            this.normaliserPersonnage(
                personnage
            ) ===
            "joueur"

        );

    },


    /*=====================================================
        SAVOIR SI UN MESSAGE EST SYSTÈME
    =====================================================*/

    estSysteme(
        personnage
    ) {

        return (

            this.normaliserPersonnage(
                personnage
            ) ===
            "systeme"

        );

    },


    /*=====================================================
        TRAITER UNE GALERIE SANS AFFICHER DE TEXTE

        Exemple :

        dialogueManager.debloquerGalerie(
            "appelInconnuPremierContact"
        );
    =====================================================*/

    debloquerGalerie(
        galerie
    ) {

        return this
            .gererGalerieDialogue(
                {

                    galerie:
                        galerie

                }
            );

    },


    /*=====================================================
        COMPATIBILITÉ AVEC CERTAINS ANCIENS APPELS

        dialogueManager.afficherMessage(
            message,
            joueur
        );
    =====================================================*/

    async afficherMessage(
        message,
        joueur = null
    ) {

        return await this.afficher(
            message,
            joueur
        );

    },


    /*=====================================================
        COMPATIBILITÉ : AJOUTER TEXTE

        Exemple :

        dialogueManager.ajouterTexte(
            "Salut",
            "eva"
        );
    =====================================================*/

    ajouterTexte(
        texte,
        personnage =
            "narrateur",
        options = {}
    ) {

        return this
            .ajouterMessage(
                texte,
                personnage,
                options
            );

    },


    /*=====================================================
        COMPATIBILITÉ : AFFICHER TEXTE
    =====================================================*/

    afficherTexte(
        texte,
        personnage =
            "narrateur",
        options = {}
    ) {

        return this
            .ajouterMessage(
                texte,
                personnage,
                options
            );

    },


    /*=====================================================
        DIAGNOSTIC DU DIALOGUE MANAGER

        Console :

        dialogueManager.verifier();

        Permet notamment de vérifier la connexion
        avec Audio Manager V4 et le moteur.
    =====================================================*/

    verifier() {

        const etat = {

            initialise:
                this.estInitialise(),

            sequence:
                this.sequenceAffichage,

            conteneur:
                Boolean(
                    this.conteneur
                ),

            moteurDisponible:

                typeof moteur !==
                    "undefined" &&

                moteur !== null,

            audioDisponible:
                this.audioDisponible(),

            galerieDisponible:
                this.galerieDisponible(),

            dernierPersonnageSonore:
                this.dernierPersonnageSonore,

            audio:
                null

        };


        if (
            this.audioDisponible()
        ) {

            etat.audio = {

                volumeUtilisateurEffets:
                    audioManager.volumeEffets,

                volumeMixEffets:
                    audioManager.volumeMixEffets,

                sonsActifs:

                    audioManager.sonsActifs instanceof
                        Set

                        ? audioManager
                            .sonsActifs
                            .size

                        : null

            };

        }


        console.log(
            "dialogueManager V4 : état :",
            etat
        );


        return etat;

    }

};


/*=========================================================
    INITIALISATION AUTOMATIQUE
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        try {

            dialogueManager
                .initialiser();

        }
        catch (
            erreur
        ) {

            console.error(
                "dialogue.js : erreur pendant l'initialisation :",
                erreur
            );

        }

    }
);


/*=========================================================
    NETTOYAGE AVANT CHANGEMENT DE PAGE
=========================================================*/

window.addEventListener(
    "beforeunload",
    () => {

        try {

            dialogueManager
                .nettoyer();

        }
        catch (
            erreur
        ) {

            /*
                Une erreur de nettoyage ne doit jamais
                empêcher la fermeture ou le changement
                de page.
            */

        }

    }
);