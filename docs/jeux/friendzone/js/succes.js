"use strict";

/*=========================================================
 FRIENDZONÉ REBORN
 succes.js

 Gestion :
 - liste des succès ;
 - déblocage des succès ;
 - sauvegarde indépendante ;
 - succès secrets ;
 - affichage dans le menu ;
 - notifications directement dans les dialogues ;
 - vérification automatique selon les statistiques ;
 - réinitialisation volontaire des succès.
=========================================================*/

const succesManager = {

    /*=====================================================
     CONFIGURATION
    =====================================================*/

    cle:
        "friendzoneRebornSucces",

    version:
        "1.0",

    conteneur:
        null,


    /*=====================================================
     LISTE DES SUCCÈS

     Important :

     - id doit être unique ;
     - titre = nom affiché ;
     - description = condition du succès ;
     - secret = masque le succès avant son déblocage.
    =====================================================*/

    liste: {

        premiereRencontreEva: {

            id:
                "premiereRencontreEva",

            titre:
                "Première rencontre",

            description:
                "Rencontrer Eva pour la première fois.",

            secret:
                false

        },


        rencontreZoe: {

            id:
                "rencontreZoe",

            titre:
                "Oups...",

            description:
                "Faire la connaissance de Zoé.",

            secret:
                false

        },


        rencontreEmelyne: {

            id:
                "rencontreEmelyne",

            titre:
                "Un coup de main",

            description:
                "Faire la connaissance d'Émelyne.",

            secret:
                false

        },


        rencontreBryan: {

            id:
                "rencontreBryan",

            titre:
                "Nouvelle tête",

            description:
                "Faire la connaissance de Bryan.",

            secret:
                false

        },


        procheEva: {

            id:
                "procheEva",

            titre:
                "Plus que de simples connaissances",

            description:
                "Atteindre une relation élevée avec Eva.",

            secret:
                false

        },


        confianceEva: {

            id:
                "confianceEva",

            titre:
                "Elle te fait confiance",

            description:
                "Gagner une grande confiance auprès d'Eva.",

            secret:
                false

        },


        procheZoe: {

            id:
                "procheZoe",

            titre:
                "Partenaire de chaos",

            description:
                "Développer une forte relation avec Zoé.",

            secret:
                false

        },


        procheEmelyne: {

            id:
                "procheEmelyne",

            titre:
                "Une confiance difficile à gagner",

            description:
                "Développer une forte relation avec Émelyne.",

            secret:
                false

        },


        procheBryan: {

            id:
                "procheBryan",

            titre:
                "Finalement pas si différent",

            description:
                "Développer une forte relation avec Bryan.",

            secret:
                false

        },


        tresGentil: {

            id:
                "tresGentil",

            titre:
                "Toujours prêt à aider",

            description:
                "Atteindre un niveau élevé de gentillesse.",

            secret:
                false

        },


        tresAudacieux: {

            id:
                "tresAudacieux",

            titre:
                "Aucune hésitation",

            description:
                "Atteindre un niveau élevé d'audace.",

            secret:
                false

        },


        tresPrudent: {

            id:
                "tresPrudent",

            titre:
                "Deux fois plutôt qu'une",

            description:
                "Faire preuve d'une grande prudence.",

            secret:
                false

        },


        intuitif: {

            id:
                "intuitif",

            titre:
                "Quelque chose ne colle pas",

            description:
                "Développer fortement ton intuition.",

            secret:
                false

        },


        numeroEva: {

            id:
                "numeroEva",

            titre:
                "Premier contact",

            description:
                "Obtenir le numéro d'Eva.",

            secret:
                false

        },


        rendezVousEva: {

            id:
                "rendezVousEva",

            titre:
                "Un vrai rendez-vous ?",

            description:
                "Obtenir un rendez-vous avec Eva.",

            secret:
                false

        },


        baladeEmelyne: {

            id:
                "baladeEmelyne",

            titre:
                "Un moment à deux",

            description:
                "Faire une balade avec Émelyne.",

            secret:
                false

        },


        numeroInconnu: {

            id:
                "numeroInconnu",

            titre:
                "Numéro inconnu",

            description:
                "Recevoir un mystérieux appel.",

            secret:
                true

        },


        appelIgnore: {

            id:
                "appelIgnore",

            titre:
                "Pas maintenant",

            description:
                "Ignorer le premier appel du numéro inconnu.",

            secret:
                true

        },


        appelInsistant: {

            id:
                "appelInsistant",

            titre:
                "Il ne lâchera pas",

            description:
                "Forcer l'inconnu à rappeler plusieurs fois.",

            secret:
                true

        },


        prevenirEnqueteur: {

            id:
                "prevenirEnqueteur",

            titre:
                "Pas de héros aujourd'hui",

            description:
                "Décider de prévenir les autorités.",

            secret:
                true

        },


        enqueteSolo: {

            id:
                "enqueteSolo",

            titre:
                "On se débrouillera seuls",

            description:
                "Poursuivre l'enquête sans prévenir les autorités.",

            secret:
                true

        },


        amiDeTous: {

            id:
                "amiDeTous",

            titre:
                "Tout le monde t'apprécie",

            description:
                "Entretenir de bonnes relations avec Eva, Zoé, Émelyne et Bryan.",

            secret:
                true

        },


        detective: {

            id:
                "detective",

            titre:
                "Détective amateur",

            description:
                "Développer suffisamment ta prudence et ton intuition.",

            secret:
                true

        }

    },


    /*=====================================================
     INITIALISATION
    =====================================================*/

    initialiser() {

        this.conteneur =
            document.getElementById(
                "listeSucces"
            );


        console.log(
            "succesManager initialisé."
        );

    },


    /*=====================================================
     CRÉER LES DONNÉES PAR DÉFAUT
    =====================================================*/

    creerDonneesParDefaut() {

        return {

            version:
                this.version,

            debloques: {}

        };

    },


    /*=====================================================
     CHARGER LES SUCCÈS
    =====================================================*/

    charger() {

        let contenu =
            null;


        try {

            contenu =
                localStorage.getItem(
                    this.cle
                );

        }
        catch (
            erreur
        ) {

            console.error(
                "Erreur d'accès au stockage des succès :",
                erreur
            );


            return this
                .creerDonneesParDefaut();

        }


        if (
            !contenu
        ) {

            return this
                .creerDonneesParDefaut();

        }


        try {

            const donnees =
                JSON.parse(
                    contenu
                );


            return {

                ...this
                    .creerDonneesParDefaut(),

                ...donnees,

                debloques: {

                    ...(
                        donnees?.debloques ||
                        {}
                    )

                }

            };

        }
        catch (
            erreur
        ) {

            console.error(
                "Erreur de chargement des succès :",
                erreur
            );


            return this
                .creerDonneesParDefaut();

        }

    },


    /*=====================================================
     SAUVEGARDER LES SUCCÈS
    =====================================================*/

    sauvegarder(
        donnees
    ) {

        if (
            !donnees
        ) {

            return false;

        }


        try {

            localStorage.setItem(
                this.cle,
                JSON.stringify(
                    donnees
                )
            );


            return true;

        }
        catch (
            erreur
        ) {

            console.error(
                "Erreur de sauvegarde des succès :",
                erreur
            );


            return false;

        }

    },


    /*=====================================================
     VÉRIFIER SI UN SUCCÈS EXISTE
    =====================================================*/

    existe(
        id
    ) {

        return Boolean(

            id &&

            this.liste[
                id
            ]

        );

    },


    /*=====================================================
     OBTENIR UN SUCCÈS
    =====================================================*/

    obtenir(
        id
    ) {

        if (
            !this.existe(
                id
            )
        ) {

            return null;

        }


        return this.liste[
            id
        ];

    },


    /*=====================================================
     VÉRIFIER SI UN SUCCÈS EST DÉBLOQUÉ
    =====================================================*/

    estDebloque(
        id
    ) {

        if (
            !this.existe(
                id
            )
        ) {

            return false;

        }


        const donnees =
            this.charger();


        return Boolean(

            donnees
                .debloques?.[
                    id
                ]

        );

    },


    /*=====================================================
     OBTENIR LA DATE DE DÉBLOCAGE
    =====================================================*/

    obtenirDateDeblocage(
        id
    ) {

        if (
            !this.existe(
                id
            )
        ) {

            return null;

        }


        const donnees =
            this.charger();


        const informations =
            donnees
                .debloques?.[
                    id
                ];


        if (
            !informations
        ) {

            return null;

        }


        return (
            informations.date ||
            null
        );

    },


    /*=====================================================
     DÉBLOQUER UN SUCCÈS
    =====================================================*/

    debloquer(
        id
    ) {

        /*---------------------------------------------
         SUCCÈS INCONNU
        ---------------------------------------------*/

        if (
            !this.existe(
                id
            )
        ) {

            console.warn(
                "Succès inconnu :",
                id
            );


            return false;

        }


        /*---------------------------------------------
         DÉJÀ DÉBLOQUÉ
        ---------------------------------------------*/

        if (
            this.estDebloque(
                id
            )
        ) {

            return false;

        }


        const succes =
            this.liste[
                id
            ];


        const donnees =
            this.charger();


        /*---------------------------------------------
         ENREGISTREMENT
        ---------------------------------------------*/

        donnees
            .debloques[
                id
            ] = {

                date:
                    new Date()
                        .toISOString()

            };


        const sauvegardeOK =
            this.sauvegarder(
                donnees
            );


        if (
            !sauvegardeOK
        ) {

            return false;

        }


        console.log(
            "Succès débloqué :",
            succes.titre
        );


        /*---------------------------------------------
         NOTIFICATION DIRECTEMENT DANS LE JEU
        ---------------------------------------------*/

        this.afficherNotification(
            succes
        );


        /*---------------------------------------------
         ACTUALISER LA FENÊTRE DU MENU
        ---------------------------------------------*/

        this.afficher();


        /*---------------------------------------------
         ÉVÉNEMENT PERSONNALISÉ
        ---------------------------------------------*/

        try {

            document.dispatchEvent(

                new CustomEvent(
                    "succesDebloque",
                    {

                        detail: {

                            id:
                                succes.id,

                            titre:
                                succes.titre,

                            description:
                                succes.description,

                            secret:
                                succes.secret ===
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
             Une erreur d'événement ne doit pas
             empêcher le succès d'être débloqué.
            */

        }


        return true;

    },


    /*=====================================================
     DÉBLOQUER PLUSIEURS SUCCÈS
    =====================================================*/

    debloquerPlusieurs(
        listeSucces
    ) {

        if (
            !Array.isArray(
                listeSucces
            )
        ) {

            return false;

        }


        let auMoinsUnDeblocage =
            false;


        listeSucces.forEach(
            id => {

                if (
                    this.debloquer(
                        id
                    )
                ) {

                    auMoinsUnDeblocage =
                        true;

                }

            }
        );


        return auMoinsUnDeblocage;

    },


    /*=====================================================
     NOTIFICATION DE SUCCÈS

     PRIORITÉ :

     1. nouveau dialogueManager :
        afficherNotificationSucces()

     2. ancienne fonction :
        succes()

     3. ajouterNotification()

     4. ajouterMessageSysteme()

     5. console
    =====================================================*/

    afficherNotification(
        succes
    ) {

        if (
            !succes
        ) {

            return false;

        }


        /*---------------------------------------------
         NOUVEAU DIALOGUE.JS
        ---------------------------------------------*/

        if (
            typeof dialogueManager !==
                "undefined" &&

            dialogueManager !==
                null &&

            typeof dialogueManager
                .afficherNotificationSucces ===
                "function"
        ) {

            try {

                dialogueManager
                    .afficherNotificationSucces(
                        succes.titre,
                        succes.description
                    );


                return true;

            }
            catch (
                erreur
            ) {

                console.error(
                    "Erreur pendant l'affichage de la notification de succès :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         COMPATIBILITÉ AVEC UNE ANCIENNE VERSION
        ---------------------------------------------*/

        if (
            typeof dialogueManager !==
                "undefined" &&

            dialogueManager !==
                null &&

            typeof dialogueManager
                .succes ===
                "function"
        ) {

            try {

                dialogueManager
                    .succes(
                        `🏆 Succès débloqué : ${succes.titre}`
                    );


                return true;

            }
            catch (
                erreur
            ) {

                console.error(
                    "Erreur pendant dialogueManager.succes() :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         NOTIFICATION GÉNÉRIQUE
        ---------------------------------------------*/

        if (
            typeof dialogueManager !==
                "undefined" &&

            dialogueManager !==
                null &&

            typeof dialogueManager
                .ajouterNotification ===
                "function"
        ) {

            try {

                dialogueManager
                    .ajouterNotification(
                        `🏆 Succès débloqué : ${succes.titre} — ${succes.description}`,
                        "succes",
                        {
                            classe:
                                "notification-succes",

                            important:
                                true
                        }
                    );


                return true;

            }
            catch (
                erreur
            ) {

                console.error(
                    "Erreur pendant ajouterNotification() :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         MESSAGE SYSTÈME
        ---------------------------------------------*/

        if (
            typeof dialogueManager !==
                "undefined" &&

            dialogueManager !==
                null &&

            typeof dialogueManager
                .ajouterMessageSysteme ===
                "function"
        ) {

            try {

                dialogueManager
                    .ajouterMessageSysteme(
                        `🏆 Succès débloqué : ${succes.titre} — ${succes.description}`,
                        {
                            classe:
                                "notification-succes",

                            important:
                                true,

                            evenement:
                                "succes"
                        }
                    );


                return true;

            }
            catch (
                erreur
            ) {

                console.error(
                    "Erreur pendant ajouterMessageSysteme() :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         SECOURS
        ---------------------------------------------*/

        console.log(
            `🏆 Succès débloqué : ${succes.titre} — ${succes.description}`
        );


        return false;

    },


    /*=====================================================
     VÉRIFIER AUTOMATIQUEMENT LES SUCCÈS

     Appelé par moteur.js après les effets.
    =====================================================*/

    verifierConditions(
        joueur
    ) {

        if (
            !joueur
        ) {

            return;

        }


        /*=================================================
         RENCONTRES
        =================================================*/

        if (
            joueur.rencontreEva ===
            true
        ) {

            this.debloquer(
                "premiereRencontreEva"
            );

        }


        if (
            joueur.rencontreZoe ===
            true
        ) {

            this.debloquer(
                "rencontreZoe"
            );

        }


        if (
            joueur.rencontreEmelyne ===
            true
        ) {

            this.debloquer(
                "rencontreEmelyne"
            );

        }


        if (
            joueur.rencontreBryan ===
            true
        ) {

            this.debloquer(
                "rencontreBryan"
            );

        }


        /*=================================================
         RELATIONS
        =================================================*/

        if (
            Number(
                joueur.relationEva
            ) >= 20
        ) {

            this.debloquer(
                "procheEva"
            );

        }


        if (
            Number(
                joueur.relationZoe
            ) >= 20
        ) {

            this.debloquer(
                "procheZoe"
            );

        }


        if (
            Number(
                joueur.relationEmelyne
            ) >= 20
        ) {

            this.debloquer(
                "procheEmelyne"
            );

        }


        if (
            Number(
                joueur.relationBryan
            ) >= 20
        ) {

            this.debloquer(
                "procheBryan"
            );

        }


        /*=================================================
         CONFIANCE EVA
        =================================================*/

        if (
            Number(
                joueur.confianceEva
            ) >= 15
        ) {

            this.debloquer(
                "confianceEva"
            );

        }


        /*=================================================
         PERSONNALITÉ
        =================================================*/

        if (
            Number(
                joueur.gentillesse
            ) >= 15
        ) {

            this.debloquer(
                "tresGentil"
            );

        }


        if (
            Number(
                joueur.audace
            ) >= 10
        ) {

            this.debloquer(
                "tresAudacieux"
            );

        }


        if (
            Number(
                joueur.prudence
            ) >= 5
        ) {

            this.debloquer(
                "tresPrudent"
            );

        }


        if (
            Number(
                joueur.intuition
            ) >= 5
        ) {

            this.debloquer(
                "intuitif"
            );

        }


        /*=================================================
         ÉVÉNEMENTS
        =================================================*/

        if (
            joueur.numeroEva ===
            true
        ) {

            this.debloquer(
                "numeroEva"
            );

        }


        if (
            joueur.rendezVousEva ===
            true
        ) {

            this.debloquer(
                "rendezVousEva"
            );

        }


        if (
            joueur.baladeEmelyne ===
            true
        ) {

            this.debloquer(
                "baladeEmelyne"
            );

        }


        /*-------------------------------------------------
         PREMIER CONTACT AVEC LE NUMÉRO INCONNU
        -------------------------------------------------*/

        if (
            joueur.appelPrisImmediatement ===
                true ||

            joueur.appelIgnore ===
                true ||

            joueur.appelInsistant ===
                true
        ) {

            this.debloquer(
                "numeroInconnu"
            );

        }


        /*-------------------------------------------------
         APPEL IGNORÉ
        -------------------------------------------------*/

        if (
            joueur.appelIgnore ===
            true
        ) {

            this.debloquer(
                "appelIgnore"
            );

        }


        /*-------------------------------------------------
         APPEL INSISTANT
        -------------------------------------------------*/

        if (
            joueur.appelInsistant ===
            true
        ) {

            this.debloquer(
                "appelInsistant"
            );

        }


        /*-------------------------------------------------
         PRÉVENIR L'ENQUÊTEUR
        -------------------------------------------------*/

        if (
            joueur.prevenirEnqueteur ===
            true
        ) {

            this.debloquer(
                "prevenirEnqueteur"
            );

        }


        /*-------------------------------------------------
         ENQUÊTE EN SOLO
        -------------------------------------------------*/

        if (
            joueur.brancheChapitre6 ===
            "solo"
        ) {

            this.debloquer(
                "enqueteSolo"
            );

        }


        /*=================================================
         SUCCÈS COMBINÉS
        =================================================*/

        if (
            Number(
                joueur.relationEva
            ) >= 10 &&

            Number(
                joueur.relationZoe
            ) >= 10 &&

            Number(
                joueur.relationEmelyne
            ) >= 10 &&

            Number(
                joueur.relationBryan
            ) >= 10
        ) {

            this.debloquer(
                "amiDeTous"
            );

        }


        if (
            Number(
                joueur.prudence
            ) >= 5 &&

            Number(
                joueur.intuition
            ) >= 5
        ) {

            this.debloquer(
                "detective"
            );

        }

    },


    /*=====================================================
     NOMBRE TOTAL DE SUCCÈS
    =====================================================*/

    nombreTotal() {

        return Object.keys(
            this.liste
        ).length;

    },


    /*=====================================================
     NOMBRE DE SUCCÈS DÉBLOQUÉS
    =====================================================*/

    nombreDebloques() {

        const donnees =
            this.charger();


        return Object
            .keys(
                donnees.debloques ||
                {}
            )
            .filter(
                id =>

                    this.existe(
                        id
                    )
            )
            .length;

    },


    /*=====================================================
     POURCENTAGE DE PROGRESSION
    =====================================================*/

    obtenirProgression() {

        const total =
            this.nombreTotal();


        if (
            total <= 0
        ) {

            return 0;

        }


        const debloques =
            this.nombreDebloques();


        return Math.round(

            (
                debloques /
                total
            ) *
            100

        );

    },


    /*=====================================================
     FORMATER UNE DATE
    =====================================================*/

    formaterDate(
        dateISO
    ) {

        if (
            !dateISO
        ) {

            return "";

        }


        try {

            return new Date(
                dateISO
            )
                .toLocaleDateString(
                    "fr-FR",
                    {

                        day:
                            "2-digit",

                        month:
                            "2-digit",

                        year:
                            "numeric"

                    }
                );

        }
        catch (
            erreur
        ) {

            return "";

        }

    },


    /*=====================================================
     AFFICHER LES SUCCÈS DANS LE MENU
    =====================================================*/

    afficher() {

        /*---------------------------------------------
         RETROUVER LE CONTENEUR SI NÉCESSAIRE
        ---------------------------------------------*/

        if (
            !this.conteneur
        ) {

            this.conteneur =
                document.getElementById(
                    "listeSucces"
                );

        }


        /*
         jeu.html ne contient normalement pas
         #listeSucces.

         Ce n'est donc pas une erreur.
        */

        if (
            !this.conteneur
        ) {

            return;

        }


        this.conteneur.innerHTML =
            "";


        const donnees =
            this.charger();


        /*=================================================
         PROGRESSION
        =================================================*/

        const progression =
            document.createElement(
                "div"
            );


        progression.className =
            "succes-progression";


        progression.textContent =
            `${this.nombreDebloques()} / ${this.nombreTotal()} succès — ${this.obtenirProgression()} %`;


        this.conteneur.appendChild(
            progression
        );


        /*=================================================
         LISTE
        =================================================*/

        Object
            .values(
                this.liste
            )
            .forEach(
                succes => {

                    const informations =
                        donnees
                            .debloques?.[
                                succes.id
                            ];


                    const debloque =
                        Boolean(
                            informations
                        );


                    /*-------------------------------------
                     CARTE
                    -------------------------------------*/

                    const element =
                        document.createElement(
                            "div"
                        );


                    element.classList.add(
                        "succes-item"
                    );


                    element.classList.add(

                        debloque

                            ? "debloque"

                            : "verrouille"

                    );


                    /*-------------------------------------
                     ICÔNE
                    -------------------------------------*/

                    const icone =
                        document.createElement(
                            "div"
                        );


                    icone.className =
                        "succes-icone";


                    icone.textContent =

                        debloque

                            ? "🏆"

                            : "🔒";


                    /*-------------------------------------
                     INFORMATIONS
                    -------------------------------------*/

                    const contenu =
                        document.createElement(
                            "div"
                        );


                    contenu.className =
                        "succes-informations";


                    /*-------------------------------------
                     TITRE
                    -------------------------------------*/

                    const titre =
                        document.createElement(
                            "div"
                        );


                    titre.className =
                        "succes-titre";


                    if (
                        succes.secret &&
                        !debloque
                    ) {

                        titre.textContent =
                            "???";

                    }
                    else {

                        titre.textContent =
                            succes.titre;

                    }


                    /*-------------------------------------
                     DESCRIPTION
                    -------------------------------------*/

                    const description =
                        document.createElement(
                            "div"
                        );


                    description.className =
                        "succes-description";


                    if (
                        succes.secret &&
                        !debloque
                    ) {

                        description.textContent =
                            "Succès secret";

                    }
                    else {

                        description.textContent =
                            succes.description;

                    }


                    contenu.appendChild(
                        titre
                    );


                    contenu.appendChild(
                        description
                    );


                    /*-------------------------------------
                     DATE DE DÉBLOCAGE
                    -------------------------------------*/

                    if (
                        debloque &&
                        informations?.date
                    ) {

                        const date =
                            document.createElement(
                                "div"
                            );


                        date.className =
                            "succes-date";


                        date.textContent =
                            "Débloqué le " +
                            this.formaterDate(
                                informations.date
                            );


                        contenu.appendChild(
                            date
                        );

                    }


                    element.appendChild(
                        icone
                    );


                    element.appendChild(
                        contenu
                    );


                    this.conteneur.appendChild(
                        element
                    );

                }
            );

    },


    /*=====================================================
     RÉINITIALISER UNIQUEMENT LES SUCCÈS

     IMPORTANT :

     Cette fonction ne touche PAS :
     - aux sauvegardes ;
     - à la galerie ;
     - aux paramètres ;
     - aux volumes ;
     - à l'état actuel du joueur.

     Elle supprime uniquement :
     friendzoneRebornSucces
    =====================================================*/

    reinitialiser() {

        try {

            localStorage.removeItem(
                this.cle
            );

        }
        catch (
            erreur
        ) {

            console.error(
                "Impossible de réinitialiser les succès :",
                erreur
            );


            return false;

        }


        /*---------------------------------------------
         ACTUALISER L'INTERFACE
        ---------------------------------------------*/

        this.afficher();


        /*---------------------------------------------
         ÉVÉNEMENT
        ---------------------------------------------*/

        try {

            document.dispatchEvent(

                new CustomEvent(
                    "succesReinitialises"
                )

            );

        }
        catch (
            erreur
        ) {

            /*
             Non bloquant.
            */

        }


        console.log(
            "Tous les succès ont été réinitialisés."
        );


        return true;

    }

};


/*=========================================================
 INITIALISATION AUTOMATIQUE
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        try {

            succesManager
                .initialiser();


            succesManager
                .afficher();

        }
        catch (
            erreur
        ) {

            console.error(
                "Erreur pendant l'initialisation de succesManager :",
                erreur
            );

        }

    }
);