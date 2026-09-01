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
 - notifications en jeu ;
 - vérification automatique selon les statistiques.
=========================================================*/

const succesManager = {

    /*=====================================================
     CONFIGURATION
    =====================================================*/

    cle: "friendzoneRebornSucces",

    conteneur: null,

    /*=====================================================
     NOTIFICATIONS DE SUCCÈS EN ATTENTE

     Les succès sont enregistrés immédiatement, mais leur
     message système peut être affiché un peu plus tard par
     moteur.js, une fois la scène de destination prête.
    =====================================================*/

    notificationsEnAttente: [],

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
            id: "premiereRencontreEva",
            titre: "Première rencontre",
            description: "Rencontrer Eva pour la première fois.",
            secret: false
        },

        rencontreZoe: {
            id: "rencontreZoe",
            titre: "Oups...",
            description: "Faire la connaissance de Zoé.",
            secret: false
        },

        rencontreEmelyne: {
            id: "rencontreEmelyne",
            titre: "Un coup de main",
            description: "Faire la connaissance d'Émelyne.",
            secret: false
        },

        rencontreBryan: {
            id: "rencontreBryan",
            titre: "Nouvelle tête",
            description: "Faire la connaissance de Bryan.",
            secret: false
        },

        numeroEva: {
            id: "numeroEva",
            titre: "Premier contact",
            description: "Obtenir le numéro d'Eva.",
            secret: false
        },

        procheEva: {
            id: "procheEva",
            titre: "Plus que de simples connaissances",
            description: "Atteindre une relation proche avec Eva.",
            secret: false,
            progression: {
                type: "stat",
                variable: "relationEva",
                objectif: 10
            }
        },

        procheZoe: {
            id: "procheZoe",
            titre: "Partenaire de chaos",
            description: "Atteindre une relation proche avec Zoé.",
            secret: false,
            progression: {
                type: "stat",
                variable: "relationZoe",
                objectif: 10
            }
        },

        procheEmelyne: {
            id: "procheEmelyne",
            titre: "Une confiance difficile à gagner",
            description: "Atteindre une relation proche avec Émelyne.",
            secret: false,
            progression: {
                type: "stat",
                variable: "relationEmelyne",
                objectif: 10
            }
        },

        procheBryan: {
            id: "procheBryan",
            titre: "Finalement pas si différent",
            description: "Atteindre une relation proche avec Bryan.",
            secret: false,
            progression: {
                type: "stat",
                variable: "relationBryan",
                objectif: 10
            }
        },

        confianceEva: {
            id: "confianceEva",
            titre: "Elle te fait confiance",
            description: "Atteindre une grande confiance auprès d'Eva.",
            secret: false,
            progression: {
                type: "stat",
                variable: "confianceEva",
                objectif: 10
            }
        },

        amiDeTous: {
            id: "amiDeTous",
            titre: "Tout le monde t'apprécie",
            description: "Atteindre une relation proche avec Eva, Zoé, Émelyne et Bryan.",
            secret: true,
            progression: {
                type: "moyenne",
                variables: [
                    "relationEva",
                    "relationZoe",
                    "relationEmelyne",
                    "relationBryan"
                ],
                objectif: 10
            }
        },

        tresGentil: {
            id: "tresGentil",
            titre: "Toujours prêt à aider",
            description: "Atteindre un niveau élevé de gentillesse.",
            secret: false,
            progression: {
                type: "stat",
                variable: "gentillesse",
                objectif: 10
            }
        },

        tresAudacieux: {
            id: "tresAudacieux",
            titre: "Aucune hésitation",
            description: "Atteindre un niveau élevé d'audace.",
            secret: false,
            progression: {
                type: "stat",
                variable: "audace",
                objectif: 8
            }
        },

        grandHumour: {
            id: "grandHumour",
            titre: "Toujours le mot pour rire",
            description: "Développer fortement ton humour.",
            secret: false,
            progression: {
                type: "stat",
                variable: "humour",
                objectif: 6
            }
        },

        courageux: {
            id: "courageux",
            titre: "Ne pas reculer",
            description: "Faire preuve de courage.",
            secret: false,
            progression: {
                type: "stat",
                variable: "courage",
                objectif: 5
            }
        },

        rendezVousEva: {
            id: "rendezVousEva",
            titre: "Un vrai rendez-vous ?",
            description: "Obtenir un rendez-vous avec Eva.",
            secret: false
        },

        repasEvaReussi: {
            id: "repasEvaReussi",
            titre: "Déjeuner réussi",
            description: "Réussir ton déjeuner en tête-à-tête avec Eva.",
            secret: false
        },

        repasEvaRate: {
            id: "repasEvaRate",
            titre: "Malaise à table",
            description: "Faire tourner le déjeuner avec Eva au malaise.",
            secret: true
        },

        repasEvaTresProche: {
            id: "repasEvaTresProche",
            titre: "Plus qu'un déjeuner",
            description: "Créer une vraie proximité avec Eva pendant le déjeuner.",
            secret: true
        },

        confidenceEvaPeurs: {
            id: "confidenceEvaPeurs",
            titre: "Elle baisse sa garde",
            description: "Amener Eva à parler de ses peurs.",
            secret: true
        },

        avenirEva: {
            id: "avenirEva",
            titre: "Parler de demain",
            description: "Amener Eva à parler de son avenir.",
            secret: true
        },

        emelyneSoiree: {
            id: "emelyneSoiree",
            titre: "Une invitée de plus",
            description: "Convaincre Émelyne de participer à la soirée films d'horreur.",
            secret: false
        },

        baiserEva: {
            id: "baiserEva",
            titre: "Enfin...",
            description: "Obtenir une réaction positive d'Eva au moment du baiser sur le front.",
            secret: true
        },

        baiserHesitation: {
            id: "baiserHesitation",
            titre: "Presque",
            description: "Faire hésiter Eva au moment du baiser sur le front.",
            secret: true
        },

        baiserRefuse: {
            id: "baiserRefuse",
            titre: "Friendzoné ?",
            description: "Se faire repousser par Eva au moment du baiser sur le front.",
            secret: true
        },

        messageRetourEva: {
            id: "messageRetourEva",
            titre: "Promets-moi de m'écrire",
            description: "Demander à Eva de prévenir lorsqu'elle sera rentrée.",
            secret: false
        },

        premiereInquietude: {
            id: "premiereInquietude",
            titre: "Quelque chose ne va pas",
            description: "Réagir dès le matin à l'absence de nouvelles d'Eva.",
            secret: false
        },

        zoeRechercheEva: {
            id: "zoeRechercheEva",
            titre: "Appeler une amie",
            description: "Contacter Zoé pour chercher Eva.",
            secret: false
        },

        soupconBryan: {
            id: "soupconBryan",
            titre: "Un doute s'installe",
            description: "Commencer à soupçonner Bryan.",
            secret: true
        },

        temoignageBryan: {
            id: "temoignageBryan",
            titre: "Un détail important",
            description: "Noter le témoignage de Bryan.",
            secret: true
        },

        toutMontrerPolice: {
            id: "toutMontrerPolice",
            titre: "Jouer cartes sur table",
            description: "Montrer ton téléphone à la police.",
            secret: false
        },

        avouerAttachementEva: {
            id: "avouerAttachementEva",
            titre: "Elle compte pour moi",
            description: "Reconnaître devant la police ton attachement à Eva.",
            secret: true
        },

        confierReveZoe: {
            id: "confierReveZoe",
            titre: "Un rêve trop réel",
            description: "Confier ton rêve à Zoé.",
            secret: true
        },

        resisterReve: {
            id: "resisterReve",
            titre: "Ce n'est qu'un rêve",
            description: "Refuser de suivre Eva dans le rêve.",
            secret: true
        },

        carnetEva: {
            id: "carnetEva",
            titre: "Ce qu'Eva n'a jamais dit",
            description: "Découvrir ce qu'Eva a écrit dans son carnet.",
            secret: true
        },

        sentimentsEva: {
            id: "sentimentsEva",
            titre: "Ce qu'elle ressentait",
            description: "Découvrir ce qu'Eva ressentait pour toi.",
            secret: true
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
            version: "1.1",
            debloques: {},
            progressions: {}
        };

    },

    /*=====================================================
     CHARGER LES SUCCÈS
    =====================================================*/

    charger() {

        const contenu =
            localStorage.getItem(
                this.cle
            );

        if (!contenu) {

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
                        donnees.debloques ||
                        {}
                    )
                },

                progressions: {
                    ...(
                        donnees.progressions ||
                        {}
                    )
                }

            };

        }
        catch (erreur) {

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

    sauvegarder(donnees) {

        if (!donnees) {
            return;
        }

        try {

            localStorage.setItem(
                this.cle,
                JSON.stringify(
                    donnees
                )
            );

        }
        catch (erreur) {

            console.error(
                "Erreur de sauvegarde des succès :",
                erreur
            );

        }

    },

    /*=====================================================
     VÉRIFIER SI UN SUCCÈS EXISTE
    =====================================================*/

    existe(id) {

        return Boolean(
            id &&
            this.liste[id]
        );

    },

    /*=====================================================
     VÉRIFIER SI UN SUCCÈS EST DÉBLOQUÉ
    =====================================================*/

    estDebloque(id) {

        if (!this.existe(id)) {
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

    obtenirDateDeblocage(id) {

        const donnees =
            this.charger();

        const informations =
            donnees
                .debloques?.[
                    id
                ];

        if (!informations) {
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

    debloquer(id) {

        if (!this.existe(id)) {

            console.warn(
                "Succès inconnu :",
                id
            );

            return false;

        }

        /*
         Évite de débloquer plusieurs fois
         le même succès.
        */
        if (
            this.estDebloque(id)
        ) {
            return false;
        }

        const succes =
            this.liste[id];

        const donnees =
            this.charger();

        donnees.debloques[id] = {

            date:
                new Date()
                    .toISOString()

        };

        this.sauvegarder(
            donnees
        );

        console.log(
            "Succès débloqué :",
            succes.titre
        );

        /*
         Le succès est sauvegardé immédiatement,
         mais son message est placé en attente.

         moteur.js l'affichera une fois que la
         scène de destination sera prête.
        */
        this.ajouterNotificationEnAttente(
            succes
        );

        /*
         Actualise la fenêtre des succès
         si elle est actuellement présente.
        */
        this.afficher();

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
                            succes.description

                    }
                }
            )
        );

        return true;

    },

    /*=====================================================
     DÉBLOQUER PLUSIEURS SUCCÈS
    =====================================================*/

    debloquerPlusieurs(ids) {

        if (
            !Array.isArray(ids)
        ) {
            return;
        }

        ids.forEach(
            id => {
                this.debloquer(id);
            }
        );

    },

    /*=====================================================
     AJOUTER UNE NOTIFICATION EN ATTENTE
    =====================================================*/

    ajouterNotificationEnAttente(
        succes
    ) {

        if (
            !succes ||
            !succes.id
        ) {
            return false;
        }

        /*
         Évite qu'un même succès soit présent
         plusieurs fois dans la file d'attente.
        */
        const dejaEnAttente =
            this.notificationsEnAttente
                .some(
                    notification =>
                        notification &&
                        notification.id ===
                            succes.id
                );

        if (dejaEnAttente) {
            return false;
        }

        this.notificationsEnAttente.push(
            succes
        );

        return true;

    },

    /*=====================================================
     VÉRIFIER S'IL Y A DES NOTIFICATIONS EN ATTENTE
    =====================================================*/

    aDesNotificationsEnAttente() {

        return (
            Array.isArray(
                this.notificationsEnAttente
            ) &&
            this.notificationsEnAttente.length >
                0
        );

    },

    /*=====================================================
     VIDER LES NOTIFICATIONS EN ATTENTE
    =====================================================*/

    viderNotificationsEnAttente() {

        this.notificationsEnAttente =
            [];

    },

    /*=====================================================
     AFFICHER L'ANNONCE SYSTÈME D'UN SUCCÈS
    =====================================================*/

    afficherNotification(
        succes
    ) {

        if (!succes) {
            return false;
        }

        /*
         Utilise le système de dialogue du jeu afin que
         le déblocage apparaisse directement comme un
         message système dans la conversation.

         dialogueManager.succes() gère déjà :
         - le style des succès ;
         - le son de succès ;
         - l'événement "succes".
        */
        if (
            typeof dialogueManager !==
                "undefined" &&
            dialogueManager !== null &&
            typeof dialogueManager.succes ===
                "function"
        ) {

            dialogueManager.succes(
                `🏆 Succès débloqué : ${succes.titre}`,
                {
                    dansConversation:
                        true
                }
            );

            return true;

        }

        /*
         Si le dialogueManager n'est pas disponible,
         on ne retire pas la notification de la file.
        */
        return false;

    },

    /*=====================================================
     AFFICHER LES NOTIFICATIONS EN ATTENTE

     Cette fonction sera appelée par moteur.js lorsque
     la nouvelle scène aura fini de s'afficher.
    =====================================================*/

    afficherNotificationsEnAttente() {

        if (
            !this.aDesNotificationsEnAttente()
        ) {
            return 0;
        }

        const notifications =
            [
                ...this.notificationsEnAttente
            ];

        const restantes =
            [];

        let nombreAffiche =
            0;

        notifications.forEach(
            succes => {

                const affichee =
                    this.afficherNotification(
                        succes
                    );

                if (affichee) {

                    nombreAffiche +=
                        1;

                }
                else {

                    restantes.push(
                        succes
                    );

                }

            }
        );

        /*
         Seules les notifications qui n'ont pas pu
         être affichées restent dans la file.
        */
        this.notificationsEnAttente =
            restantes;

        return nombreAffiche;

    },

    /*=====================================================
     BORNER UNE VALEUR ENTRE DEUX LIMITES
    =====================================================*/

    bornerValeur(
        valeur,
        minimum,
        maximum
    ) {

        const nombre =
            Number(valeur);

        if (
            !Number.isFinite(nombre)
        ) {
            return minimum;
        }

        return Math.min(
            maximum,
            Math.max(
                minimum,
                nombre
            )
        );

    },

    /*=====================================================
     CALCULER LA PROGRESSION D'UN SUCCÈS
    =====================================================*/

    calculerProgressionSucces(
        succes,
        joueur
    ) {

        if (
            !succes ||
            !succes.progression ||
            !joueur
        ) {
            return null;
        }

        const configuration =
            succes.progression;

        if (
            configuration.type ===
            "stat"
        ) {

            const objectif =
                Number(
                    configuration.objectif
                );

            if (
                !Number.isFinite(objectif) ||
                objectif <= 0
            ) {
                return null;
            }

            const valeurBrute =
                Number(
                    joueur[
                        configuration.variable
                    ]
                );

            const valeur =
                Number.isFinite(
                    valeurBrute
                )
                    ? valeurBrute
                    : 0;

            const valeurAffichee =
                Math.max(
                    0,
                    valeur
                );

            const pourcentage =
                Math.round(
                    this.bornerValeur(
                        (
                            valeurAffichee /
                            objectif
                        ) * 100,
                        0,
                        100
                    )
                );

            return {

                valeur:
                    valeurAffichee,

                objectif,

                pourcentage

            };

        }

        /*-------------------------------------------------
         PROGRESSION MOYENNE DE PLUSIEURS STATISTIQUES

         Utilisé notamment par "amiDeTous".

         Chaque relation contribue au maximum
         jusqu'à son objectif.
        -------------------------------------------------*/

        if (
            configuration.type ===
            "moyenne"
        ) {

            const variables =
                Array.isArray(
                    configuration.variables
                )
                    ? configuration.variables
                    : [];

            const objectif =
                Number(
                    configuration.objectif
                );

            if (
                variables.length === 0 ||
                !Number.isFinite(objectif) ||
                objectif <= 0
            ) {
                return null;
            }

            let total =
                0;

            variables.forEach(
                variable => {

                    const valeurBrute =
                        Number(
                            joueur[
                                variable
                            ]
                        );

                    const valeur =
                        Number.isFinite(
                            valeurBrute
                        )
                            ? valeurBrute
                            : 0;

                    total +=
                        this.bornerValeur(
                            valeur,
                            0,
                            objectif
                        );

                }
            );

            const objectifTotal =
                objectif *
                variables.length;

            const pourcentage =
                Math.round(
                    this.bornerValeur(
                        (
                            total /
                            objectifTotal
                        ) * 100,
                        0,
                        100
                    )
                );

            return {

                valeur:
                    total,

                objectif:
                    objectifTotal,

                pourcentage

            };

        }

        return null;

    },
        /*=====================================================
     METTRE À JOUR LES PROGRESSIONS

     Les valeurs sont stockées séparément des sauvegardes
     de partie afin que le menu des succès puisse les
     afficher même avant le chargement d'une partie.

     La progression n'est enregistrée que pour les succès
     qui possèdent une propriété "progression".
    =====================================================*/

    mettreAJourProgressions(
        joueur
    ) {

        if (!joueur) {
            return;
        }

        const donnees =
            this.charger();

        if (
            !donnees.progressions ||
            typeof donnees.progressions !==
                "object"
        ) {

            donnees.progressions =
                {};

        }

        Object.values(
            this.liste
        )
            .forEach(
                succes => {

                    if (
                        !succes.progression
                    ) {
                        return;
                    }

                    const progression =
                        this.calculerProgressionSucces(
                            succes,
                            joueur
                        );

                    if (!progression) {
                        return;
                    }

                    donnees
                        .progressions[
                            succes.id
                        ] = {

                            valeur:
                                progression.valeur,

                            objectif:
                                progression.objectif,

                            pourcentage:
                                progression.pourcentage

                        };

                }
            );

        this.sauvegarder(
            donnees
        );

    },

    /*=====================================================
     OBTENIR LA PROGRESSION ENREGISTRÉE D'UN SUCCÈS
    =====================================================*/

    obtenirProgressionSucces(
        id
    ) {

        if (!this.existe(id)) {
            return null;
        }

        const succes =
            this.liste[id];

        if (
            !succes.progression
        ) {
            return null;
        }

        /*
         Lorsqu'un succès est déjà débloqué,
         la progression doit toujours apparaître
         à 100 %, même si une statistique a été
         réduite plus tard dans l'histoire.
        */
        if (
            this.estDebloque(id)
        ) {

            const configuration =
                succes.progression;

            if (
                configuration.type ===
                "stat"
            ) {

                return {

                    valeur:
                        Number(
                            configuration.objectif
                        ),

                    objectif:
                        Number(
                            configuration.objectif
                        ),

                    pourcentage:
                        100

                };

            }

            if (
                configuration.type ===
                "moyenne"
            ) {

                const objectif =
                    Number(
                        configuration.objectif
                    );

                const nombreVariables =
                    Array.isArray(
                        configuration.variables
                    )
                        ? configuration.variables.length
                        : 0;

                const objectifTotal =
                    objectif *
                    nombreVariables;

                return {

                    valeur:
                        objectifTotal,

                    objectif:
                        objectifTotal,

                    pourcentage:
                        100

                };

            }

        }

        const donnees =
            this.charger();

        const progression =
            donnees
                .progressions?.[
                    id
                ];

        if (!progression) {

            return {

                valeur:
                    0,

                objectif:
                    succes.progression.type ===
                    "moyenne"
                        ?
                            (
                                Number(
                                    succes
                                        .progression
                                        .objectif
                                ) *
                                (
                                    succes
                                        .progression
                                        .variables
                                        ?.length ||
                                    0
                                )
                            )
                        :
                            Number(
                                succes
                                    .progression
                                    .objectif
                            ),

                pourcentage:
                    0

            };

        }

        return {

            valeur:
                Number(
                    progression.valeur
                ) || 0,

            objectif:
                Number(
                    progression.objectif
                ) || 0,

            pourcentage:
                this.bornerValeur(
                    Number(
                        progression.pourcentage
                    ) || 0,
                    0,
                    100
                )

        };

    },

    /*=====================================================
     VÉRIFIER LES CONDITIONS DES SUCCÈS

     Appelé par moteur.js après les effets
     des scènes et des choix.

     La mise à jour des progressions est effectuée
     AVANT les déblocages pour conserver les valeurs
     les plus récentes dans le menu.
    =====================================================*/

    verifierConditions(
        joueur
    ) {

        if (!joueur) {
            return;
        }

        /*-------------------------------------------------
         METTRE À JOUR LES POURCENTAGES
        -------------------------------------------------*/

        this.mettreAJourProgressions(
            joueur
        );

        /*-------------------------------------------------
         RENCONTRES
        -------------------------------------------------*/

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

        /*-------------------------------------------------
         NUMÉRO D'EVA
        -------------------------------------------------*/

        if (
            joueur.numeroEva ===
            true
        ) {

            this.debloquer(
                "numeroEva"
            );

        }

        /*-------------------------------------------------
         RELATIONS
        -------------------------------------------------*/

        if (
            Number(
                joueur.relationEva
            ) >= 40
        ) {

            this.debloquer(
                "procheEva"
            );

        }

        if (
            Number(
                joueur.relationZoe
            ) >= 10
        ) {

            this.debloquer(
                "procheZoe"
            );

        }

        if (
            Number(
                joueur.relationEmelyne
            ) >= 10
        ) {

            this.debloquer(
                "procheEmelyne"
            );

        }

        if (
            Number(
                joueur.relationBryan
            ) >= 10
        ) {

            this.debloquer(
                "procheBryan"
            );

        }

        /*-------------------------------------------------
         CONFIANCE EVA
        -------------------------------------------------*/

        if (
            Number(
                joueur.confianceEva
            ) >= 40
        ) {

            this.debloquer(
                "confianceEva"
            );

        }

        /*-------------------------------------------------
         AMI DE TOUS
        -------------------------------------------------*/

        if (
            Number(
                joueur.relationEva
            ) >= 40 &&
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

        /*-------------------------------------------------
         PERSONNALITÉ
        -------------------------------------------------*/

        if (
            Number(
                joueur.gentillesse
            ) >= 10
        ) {

            this.debloquer(
                "tresGentil"
            );

        }

        if (
            Number(
                joueur.audace
            ) >= 8
        ) {

            this.debloquer(
                "tresAudacieux"
            );

        }

        if (
            Number(
                joueur.humour
            ) >= 6
        ) {

            this.debloquer(
                "grandHumour"
            );

        }

        if (
            Number(
                joueur.courage
            ) >= 5
        ) {

            this.debloquer(
                "courageux"
            );

        }

        /*-------------------------------------------------
         RENDEZ-VOUS EVA
        -------------------------------------------------*/

        if (
            joueur.rendezVousEva ===
            true
        ) {

            this.debloquer(
                "rendezVousEva"
            );

        }

        /*-------------------------------------------------
         REPAS AVEC EVA
        -------------------------------------------------*/

        if (
            joueur.repasEvaReussi ===
            true
        ) {

            this.debloquer(
                "repasEvaReussi"
            );

        }

        if (
            joueur.repasEvaRate ===
            true
        ) {

            this.debloquer(
                "repasEvaRate"
            );

        }

        if (
            joueur.repasEvaTresProche ===
            true
        ) {

            this.debloquer(
                "repasEvaTresProche"
            );

        }

        /*-------------------------------------------------
         CONFIDENCES D'EVA
        -------------------------------------------------*/

        if (
            joueur.evaAParleDeSesPeurs ===
            true
        ) {

            this.debloquer(
                "confidenceEvaPeurs"
            );

        }

        if (
            joueur.evaAParleDeSonAvenir ===
            true
        ) {

            this.debloquer(
                "avenirEva"
            );

        }

        /*-------------------------------------------------
         ÉMELYNE À LA SOIRÉE
        -------------------------------------------------*/

        if (
            joueur.emelynePresenteSoiree ===
            true
        ) {

            this.debloquer(
                "emelyneSoiree"
            );

        }

        /*-------------------------------------------------
         BAISER AVEC EVA
        -------------------------------------------------*/

        if (
            joueur.baiserEvaAccepte ===
            true
        ) {

            this.debloquer(
                "baiserEva"
            );

        }

        if (
            joueur.baiserEvaHesitation ===
            true
        ) {

            this.debloquer(
                "baiserHesitation"
            );

        }

        if (
            joueur.baiserEvaRefuse ===
            true
        ) {

            this.debloquer(
                "baiserRefuse"
            );

        }

        /*-------------------------------------------------
         MESSAGE DE RETOUR D'EVA
        -------------------------------------------------*/

        if (
            joueur.demandeMessageRetourEva ===
            true
        ) {

            this.debloquer(
                "messageRetourEva"
            );

        }

        /*-------------------------------------------------
         PREMIÈRE INQUIÉTUDE
        -------------------------------------------------*/

        if (
            joueur.messageEvaMatinEnvoye ===
                true ||
            joueur.zoeContacteePourEva ===
                true
        ) {

            this.debloquer(
                "premiereInquietude"
            );

        }

        /*-------------------------------------------------
         CONTACTER ZOÉ
        -------------------------------------------------*/

        if (
            joueur.zoeContacteePourEva ===
            true
        ) {

            this.debloquer(
                "zoeRechercheEva"
            );

        }

        /*-------------------------------------------------
         SOUPÇONNER BRYAN
        -------------------------------------------------*/

        if (
            joueur.bryanSuspectAuxYeuxJoueur ===
            true
        ) {

            this.debloquer(
                "soupconBryan"
            );

        }

        /*-------------------------------------------------
         TÉMOIGNAGE DE BRYAN
        -------------------------------------------------*/

        if (
            joueur.temoignageBryanNote ===
            true
        ) {

            this.debloquer(
                "temoignageBryan"
            );

        }

        /*-------------------------------------------------
         POLICE
        -------------------------------------------------*/

        if (
            joueur.telephoneMontrePolice ===
            true
        ) {

            this.debloquer(
                "toutMontrerPolice"
            );

        }

        if (
            joueur.joueurReconnaitAttachementEva ===
            true
        ) {

            this.debloquer(
                "avouerAttachementEva"
            );

        }

        /*-------------------------------------------------
         RÊVE
        -------------------------------------------------*/

        if (
            joueur.joueurAvoueReveZoe ===
            true
        ) {

            this.debloquer(
                "confierReveZoe"
            );

        }

        if (
            joueur.joueurResisteReve ===
            true
        ) {

            this.debloquer(
                "resisterReve"
            );

        }

        /*-------------------------------------------------
         CHAPITRE 13
        -------------------------------------------------*/

        if (
            joueur.infoEvaCarnet ===
            true
        ) {

            this.debloquer(
                "carnetEva"
            );

        }

        if (
            joueur.infoEvaSentimentsJoueur ===
            true
        ) {

            this.debloquer(
                "sentimentsEva"
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

        return Object.keys(
            donnees.debloques ||
            {}
        )
            .filter(
                id =>
                    this.existe(id)
            )
            .length;

    },

    /*=====================================================
     PROGRESSION GLOBALE DES SUCCÈS
    =====================================================*/

    obtenirProgression() {

        const total =
            this.nombreTotal();

        if (
            total <= 0
        ) {
            return 0;
        }

        return Math.round(
            (
                this.nombreDebloques() /
                total
            ) * 100
        );

    },

    /*=====================================================
     FORMATER LA DATE D'UN SUCCÈS
    =====================================================*/

    formaterDate(
        dateISO
    ) {

        if (!dateISO) {
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
        catch (erreur) {

            return "";

        }

    },
        /*=====================================================
     AFFICHER LA LISTE DES SUCCÈS
    =====================================================*/

    afficher() {

        /*
         Recherche à nouveau le conteneur
         si le menu a été créé après
         l'initialisation de succes.js.
        */
        if (!this.conteneur) {

            this.conteneur =
                document.getElementById(
                    "listeSucces"
                );

        }

        /*
         Si le conteneur n'existe pas
         sur la page actuelle,
         on ne fait rien.
        */
        if (!this.conteneur) {
            return;
        }

        const donnees =
            this.charger();

        this.conteneur.innerHTML =
            "";

        /*-------------------------------------------------
         PROGRESSION GLOBALE
        -------------------------------------------------*/

        const progressionGlobale =
            document.createElement(
                "div"
            );

        progressionGlobale.className =
            "succes-progression";

        const progressionTexte =
            document.createElement(
                "div"
            );

        progressionTexte.className =
            "succes-progression-texte";

        const nombreDebloques =
            this.nombreDebloques();

        const nombreTotal =
            this.nombreTotal();

        progressionTexte.textContent =
            `${nombreDebloques} / ${nombreTotal} succès débloqués`;

        const barreGlobale =
            document.createElement(
                "div"
            );

        barreGlobale.className =
            "succes-progression-barre";

        const remplissageGlobal =
            document.createElement(
                "div"
            );

        remplissageGlobal.className =
            "succes-progression-remplissage";

        remplissageGlobal.style.width =
            `${this.obtenirProgression()}%`;

        barreGlobale.appendChild(
            remplissageGlobal
        );

        progressionGlobale.appendChild(
            progressionTexte
        );

        progressionGlobale.appendChild(
            barreGlobale
        );

        this.conteneur.appendChild(
            progressionGlobale
        );

        /*-------------------------------------------------
         CONTENEUR DES CARTES
        -------------------------------------------------*/

        const liste =
            document.createElement(
                "div"
            );

        liste.className =
            "succes-liste";

        Object.values(
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

                    const estSecretCache =
                        succes.secret === true &&
                        !debloque;

                    /*-------------------------------------
                     CARTE
                    -------------------------------------*/

                    const carte =
                        document.createElement(
                            "div"
                        );

                    carte.className =
                        "succes-carte";

                    if (debloque) {

                        carte.classList.add(
                            "debloque"
                        );

                    }
                    else {

                        carte.classList.add(
                            "verrouille"
                        );

                    }

                    if (estSecretCache) {

                        carte.classList.add(
                            "secret"
                        );

                    }

                    /*-------------------------------------
                     ICÔNE
                    -------------------------------------*/

                    const icone =
                        document.createElement(
                            "div"
                        );

                    icone.className =
                        "succes-icone";

                    if (debloque) {

                        icone.textContent =
                            "🏆";

                    }
                    else if (
                        succes.secret
                    ) {

                        icone.textContent =
                            "❓";

                    }
                    else {

                        icone.textContent =
                            "🔒";

                    }

                    /*-------------------------------------
                     CONTENU
                    -------------------------------------*/

                    const contenu =
                        document.createElement(
                            "div"
                        );

                    contenu.className =
                        "succes-contenu";

                    const titre =
                        document.createElement(
                            "div"
                        );

                    titre.className =
                        "succes-titre";

                    const description =
                        document.createElement(
                            "div"
                        );

                    description.className =
                        "succes-description";

                    if (estSecretCache) {

                        titre.textContent =
                            "Succès secret";

                        description.textContent =
                            "Continue l'histoire pour découvrir ce succès.";

                    }
                    else {

                        titre.textContent =
                            succes.titre;

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
                     PROGRESSION INDIVIDUELLE

                     Elle n'est affichée que si :
                     - le succès possède une configuration
                       de progression ;
                     - le succès n'est pas un secret encore
                       verrouillé.
                    -------------------------------------*/

                    if (
                        succes.progression &&
                        !estSecretCache
                    ) {

                        const progression =
                            this.obtenirProgressionSucces(
                                succes.id
                            );

                        if (progression) {

                            const blocProgression =
                                document.createElement(
                                    "div"
                                );

                            blocProgression.className =
                                "succes-progression-individuelle";

                            /*-----------------------------
                             TEXTE
                            -----------------------------*/

                            const ligneProgression =
                                document.createElement(
                                    "div"
                                );

                            ligneProgression.className =
                                "succes-progression-individuelle-texte";

                            const pourcentage =
                                document.createElement(
                                    "span"
                                );

                            pourcentage.className =
                                "succes-progression-pourcentage";

                            pourcentage.textContent =
                                `Progression : ${progression.pourcentage}%`;

                            const valeurs =
                                document.createElement(
                                    "span"
                                );

                            valeurs.className =
                                "succes-progression-valeurs";

                            valeurs.textContent =
                                `${progression.valeur} / ${progression.objectif}`;

                            ligneProgression.appendChild(
                                pourcentage
                            );

                            ligneProgression.appendChild(
                                valeurs
                            );

                            /*-----------------------------
                             BARRE
                            -----------------------------*/

                            const barre =
                                document.createElement(
                                    "div"
                                );

                            barre.className =
                                "succes-progression-individuelle-barre";

                            const remplissage =
                                document.createElement(
                                    "div"
                                );

                            remplissage.className =
                                "succes-progression-individuelle-remplissage";

                            remplissage.style.width =
                                `${progression.pourcentage}%`;

                            barre.appendChild(
                                remplissage
                            );

                            blocProgression.appendChild(
                                ligneProgression
                            );

                            blocProgression.appendChild(
                                barre
                            );

                            contenu.appendChild(
                                blocProgression
                            );

                        }

                    }

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

                    /*-------------------------------------
                     ÉTAT
                    -------------------------------------*/

                    const etat =
                        document.createElement(
                            "div"
                        );

                    etat.className =
                        "succes-etat";

                    if (debloque) {

                        etat.textContent =
                            "Débloqué";

                    }
                    else {

                        etat.textContent =
                            "Verrouillé";

                    }

                    /*-------------------------------------
                     CONSTRUCTION DE LA CARTE
                    -------------------------------------*/

                    carte.appendChild(
                        icone
                    );

                    carte.appendChild(
                        contenu
                    );

                    carte.appendChild(
                        etat
                    );

                    liste.appendChild(
                        carte
                    );

                }
            );

        this.conteneur.appendChild(
            liste
        );

    },

    /*=====================================================
     OBTENIR UN SUCCÈS
    =====================================================*/

    obtenir(
        id
    ) {

        if (!this.existe(id)) {
            return null;
        }

        return this.liste[id];

    },

    /*=====================================================
     OBTENIR TOUS LES SUCCÈS
    =====================================================*/

    obtenirTous() {

        return Object.values(
            this.liste
        );

    },

    /*=====================================================
     OBTENIR LES SUCCÈS DÉBLOQUÉS
    =====================================================*/

    obtenirDebloques() {

        const donnees =
            this.charger();

        return Object.values(
            this.liste
        )
            .filter(
                succes =>
                    Boolean(
                        donnees
                            .debloques?.[
                                succes.id
                            ]
                    )
            );

    },

    /*=====================================================
     OBTENIR LES SUCCÈS VERROUILLÉS
    =====================================================*/

    obtenirVerrouilles() {

        const donnees =
            this.charger();

        return Object.values(
            this.liste
        )
            .filter(
                succes =>
                    !Boolean(
                        donnees
                            .debloques?.[
                                succes.id
                            ]
                    )
            );

    },

    /*=====================================================
     OBTENIR LES SUCCÈS SECRETS
    =====================================================*/

    obtenirSecrets() {

        return Object.values(
            this.liste
        )
            .filter(
                succes =>
                    succes.secret ===
                    true
            );

    },

    /*=====================================================
     RÉINITIALISER LES SUCCÈS
    =====================================================*/

    reinitialiser() {

        localStorage.removeItem(
            this.cle
        );

        /*
         On vide également les annonces qui n'ont pas
         encore été affichées dans la conversation.
        */
        this.viderNotificationsEnAttente();

        console.log(
            "Les succès ont été réinitialisés."
        );

        this.afficher();

    },
        /*=====================================================
     NETTOYER LES ANCIENS SUCCÈS

     Supprime les identifiants provenant
     d'anciennes versions ou du deuxième jeu.
    =====================================================*/

    nettoyerAnciensSucces() {

        const anciensSucces = [

            "appelIgnore",
            "appelInsistant",
            "prevenirEnqueteur",
            "enqueteSolo"

        ];

        const donnees =
            this.charger();

        let modification =
            false;

        anciensSucces.forEach(
            id => {

                if (
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            donnees.debloques,
                            id
                        )
                ) {

                    delete donnees
                        .debloques[id];

                    modification =
                        true;

                }

                /*
                 Nettoie également une éventuelle
                 ancienne progression associée.
                */
                if (
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            donnees.progressions,
                            id
                        )
                ) {

                    delete donnees
                        .progressions[id];

                    modification =
                        true;

                }

            }
        );

        if (modification) {

            this.sauvegarder(
                donnees
            );

            console.log(
                "Anciens succès incompatibles supprimés."
            );

        }

    },

    /*=====================================================
     SYNCHRONISER AVEC UNE SAUVEGARDE

     À utiliser lorsqu'une partie existante
     est chargée.

     Cela permet :
     - de recalculer les progressions ;
     - de débloquer les succès déjà atteints ;
     - d'actualiser leur affichage.
    =====================================================*/

    synchroniser(
        joueur
    ) {

        if (!joueur) {
            return;
        }

        this.verifierConditions(
            joueur
        );

        this.afficher();

    }

};


/*=========================================================
 INITIALISATION AUTOMATIQUE
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        succesManager
            .initialiser();

        succesManager
            .nettoyerAnciensSucces();

        succesManager
            .afficher();

    }
);


/*=========================================================
 EXPOSITION GLOBALE

 Permet à moteur.js, menu.js et sauvegarde.js
 d'utiliser le gestionnaire.

 Exemples :

 succesManager.verifierConditions(joueur);

 succesManager.synchroniser(joueur);

 succesManager.afficher();

 succesManager.debloquer("procheEva");

 La nouvelle file de notifications peut également
 être déclenchée par moteur.js avec :

 succesManager.afficherNotificationsEnAttente();
=========================================================*/

window.succesManager =
    succesManager;
