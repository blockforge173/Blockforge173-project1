"use strict";

/*=========================================================
    FRIENDZONÉ REBORN
    moteur.js

    Gestion :
    - chapitres ;
    - scènes ;
    - dialogues ;
    - apparition progressive des messages ;
    - délais des narrations ;
    - choix ;
    - effets ;
    - succès ;
    - galerie multimédia ;
    - sauvegardes multi-slot ;
    - audio ;
    - mixage audio artistique ;
    - vidéos ;
    - fonds dynamiques.
=========================================================*/

const moteur = {

    /*=====================================================
        ÉTAT DU JEU
    =====================================================*/

    chapitreActuel:
        0,

    sceneActuelle:
        "",

    chapitre:
        null,

    joueur:
        null,


    /*=====================================================
        TIMERS ET ÉLÉMENTS TEMPORAIRES
    =====================================================*/

    timerChoix:
        null,

    boutonChoix:
        null,

    timerFond:
        null,

    transitionChapitreEnCours:
        false,

    changementFondEnCours:
        false,


    /*=====================================================
        GESTION VIDÉO
    =====================================================*/

    videoEnCours:
        null,

    conteneurVideo:
        null,

    cheminVideos:
        "videos/",

    extensionVideoParDefaut:
        "mp4",


    /*=====================================================
        GESTION DES FONDS
    =====================================================*/

    fondActuel:
        "",

    cheminFonds:
        "images/fonds/",

    extensionFondParDefaut:
        "jpg",

    dureeTransitionFondParDefaut:
        500,


    /*=====================================================
        MIXAGE AUDIO

        Le volume utilisateur reste entièrement géré
        par audioManager / parametresManager.

        Le moteur contrôle uniquement le mixage artistique
        provenant des chapitres et des scènes.

        Exemple JSON :

        {
            "musique": "theme_eva",
            "volumeMusique": 0.85,

            "ambiance": "pluie_nuit",
            "volumeAmbiance": 0.35,

            "volumeEffets": 0.80
        }

        audioManager calculera ensuite :

        volume utilisateur × volume artistique
    =====================================================*/

    volumeMixMusiqueParDefaut:
        1,

    volumeMixAmbianceParDefaut:
        1,

    volumeMixEffetsParDefaut:
        1,


    /*=====================================================
        INITIALISATION
    =====================================================*/

    async initialiser() {

        try {

            this.initialiserTransition();

            this.initialiserFond();


            /*---------------------------------------------
                VÉRIFICATION DES GESTIONNAIRES OBLIGATOIRES
            ---------------------------------------------*/

            if (
                typeof chapitresManager ===
                    "undefined"
            ) {

                throw new Error(
                    "chapitresManager est introuvable."
                );

            }


            if (
                typeof sauvegardeManager ===
                    "undefined"
            ) {

                throw new Error(
                    "sauvegardeManager est introuvable."
                );

            }


            /*---------------------------------------------
                VÉRIFICATION AUDIO

                audioManager reste facultatif pour ne pas
                empêcher complètement le jeu de démarrer
                si l'audio rencontre un problème.
            ---------------------------------------------*/

            if (
                typeof audioManager ===
                    "undefined"
            ) {

                console.warn(
                    "moteur.js : audioManager est introuvable. Le jeu continuera sans audio."
                );

            }


            /*---------------------------------------------
                CHARGEMENT DES CHAPITRES
            ---------------------------------------------*/

            await chapitresManager
                .charger();


            if (
                chapitresManager
                    .nombre() ===
                0
            ) {

                this.afficherErreur(
                    "Aucun chapitre n'a pu être chargé."
                );

                return;

            }


            /*---------------------------------------------
                NOUVELLE PARTIE DEMANDÉE DEPUIS LE MENU
            ---------------------------------------------*/

            const nouvellePartieDemandee =
                localStorage.getItem(
                    "nouvellePartieDemandee"
                ) ===
                "true";


            if (
                nouvellePartieDemandee
            ) {

                localStorage.removeItem(
                    "nouvellePartieDemandee"
                );


                /*
                    IMPORTANT — MULTI-SAUVEGARDE

                    Le menu a déjà :
                    - choisi le slot ;
                    - supprimé son ancienne sauvegarde
                      si nécessaire ;
                    - défini ce slot comme actif.

                    Il ne faut donc pas supprimer
                    la sauvegarde ici.
                */


                let slotActif =
                    null;


                if (
                    typeof sauvegardeManager
                        .obtenirSlotActif ===
                        "function"
                ) {

                    slotActif =
                        sauvegardeManager
                            .obtenirSlotActif();

                }


                if (
                    !slotActif &&
                    typeof sauvegardeManager
                        .obtenirPremierSlotVide ===
                        "function" &&
                    typeof sauvegardeManager
                        .definirSlotActif ===
                        "function"
                ) {

                    const premierSlotVide =
                        sauvegardeManager
                            .obtenirPremierSlotVide();


                    if (
                        premierSlotVide
                    ) {

                        sauvegardeManager
                            .definirSlotActif(
                                premierSlotVide
                            );


                        slotActif =
                            premierSlotVide;

                    }

                }


                if (
                    !slotActif
                ) {

                    this.afficherErreur(
                        "Aucun emplacement de sauvegarde n'a été sélectionné."
                    );

                    return;

                }


                this.nouvellePartie();

                return;

            }


            /*---------------------------------------------
                CHARGEMENT D'UNE SAUVEGARDE
            ---------------------------------------------*/

            const sauvegarde =
                sauvegardeManager
                    .charger();


            if (
                sauvegarde
            ) {

                this.appliquerSauvegarde(
                    sauvegarde
                );

            }
            else {

                let slotActif =
                    null;


                if (
                    typeof sauvegardeManager
                        .obtenirSlotActif ===
                        "function"
                ) {

                    slotActif =
                        sauvegardeManager
                            .obtenirSlotActif();

                }


                if (
                    !slotActif &&
                    typeof sauvegardeManager
                        .obtenirPremierSlotVide ===
                        "function" &&
                    typeof sauvegardeManager
                        .definirSlotActif ===
                        "function"
                ) {

                    const premierSlotVide =
                        sauvegardeManager
                            .obtenirPremierSlotVide();


                    if (
                        premierSlotVide
                    ) {

                        sauvegardeManager
                            .definirSlotActif(
                                premierSlotVide
                            );


                        slotActif =
                            premierSlotVide;

                    }

                }


                if (
                    !slotActif
                ) {

                    this.afficherErreur(
                        "Aucun emplacement de sauvegarde disponible."
                    );

                    return;

                }


                this.nouvellePartie();

            }

        }
        catch (
            erreur
        ) {

            console.error(
                "Erreur d'initialisation du moteur :",
                erreur
            );


            this.afficherErreur(
                "Une erreur est survenue pendant le chargement du jeu."
            );

        }

    },


    /*=====================================================
        INITIALISER LE FOND DU JEU
    =====================================================*/

    initialiserFond() {

        const fond =
            document.getElementById(
                "fond-jeu"
            );


        if (
            !fond
        ) {

            console.warn(
                "L'élément HTML #fond-jeu est introuvable."
            );

            return;

        }


        this.annulerTransitionFond();


        fond.style.backgroundImage =
            "none";


        fond.style.opacity =
            "1";


        fond.classList.remove(
            "changement-fond"
        );


        fond.classList.remove(
            "fond-charge"
        );


        this.fondActuel =
            "";

    },


    /*=====================================================
        TRANSITION D'ENTRÉE
    =====================================================*/

    initialiserTransition() {

        const transition =
            document.getElementById(
                "transition"
            );


        if (
            !transition
        ) {

            return;

        }


        setTimeout(
            () => {

                transition.classList.remove(
                    "actif"
                );


                transition.style.opacity =
                    "0";

            },
            100
        );

    },


    /*=====================================================
        DEMANDER LE NOM DU JOUEUR
    =====================================================*/

    demanderNomJoueur() {

        let nomChoisi =
            window.prompt(
                "Quel est le prénom de ton personnage ?",
                "Mikael"
            );


        nomChoisi =
            String(
                nomChoisi ||
                ""
            )
                .trim();


        if (
            nomChoisi.length <
            2
        ) {

            nomChoisi =
                "Joueur";

        }


        if (
            nomChoisi.length >
            20
        ) {

            nomChoisi =
                nomChoisi.substring(
                    0,
                    20
                );

        }


        return nomChoisi;

    },


    /*=====================================================
        RÉINITIALISER LE MIXAGE ARTISTIQUE

        IMPORTANT :
        cela ne touche PAS aux paramètres du joueur.

        Si le joueur a réglé :
            musique = 70 %
            ambiance = 40 %
            effets = 80 %

        ces valeurs restent intactes.

        Seuls les multiplicateurs artistiques reviennent
        à leur valeur normale : 1.
    =====================================================*/

    reinitialiserMixageAudio() {

        if (
            typeof audioManager ===
                "undefined" ||
            audioManager ===
                null
        ) {

            return false;

        }


        try {

            if (
                typeof audioManager
                    .setVolumeMixMusique ===
                    "function"
            ) {

                audioManager
                    .setVolumeMixMusique(
                        this.volumeMixMusiqueParDefaut
                    );

            }


            if (
                typeof audioManager
                    .setVolumeMixAmbiance ===
                    "function"
            ) {

                audioManager
                    .setVolumeMixAmbiance(
                        this.volumeMixAmbianceParDefaut
                    );

            }


            if (
                typeof audioManager
                    .setVolumeMixEffets ===
                    "function"
            ) {

                audioManager
                    .setVolumeMixEffets(
                        this.volumeMixEffetsParDefaut
                    );

            }


            return true;

        }
        catch (
            erreur
        ) {

            console.error(
                "moteur.js : impossible de réinitialiser le mixage audio.",
                erreur
            );


            return false;

        }

    },


    /*=====================================================
        NOUVELLE PARTIE
    =====================================================*/

    nouvellePartie() {

        const premierChapitre =
            chapitresManager
                .obtenir(
                    0
                );


        if (
            !premierChapitre
        ) {

            this.afficherErreur(
                "Le chapitre 1 est introuvable."
            );

            return;

        }


        this.annulerTransitionFond();

        this.annulerAttenteChoix();


        this.chapitreActuel =
            0;


        this.sceneActuelle =
            premierChapitre
                .debut;


        this.chapitre =
            premierChapitre;


        this.fondActuel =
            "";


        this.joueur =
            sauvegardeManager
                .creerJoueurParDefaut();


        /*---------------------------------------------
            VIDER LES NOTIFICATIONS DE SUCCÈS EN ATTENTE

            Une nouvelle partie doit repartir avec une file
            de notifications vide.

            Cela ne réinitialise pas les succès déjà
            débloqués dans le menu.
        ---------------------------------------------*/

        if (
            typeof succesManager !==
                "undefined" &&
            succesManager !==
                null &&
            typeof succesManager
                .viderNotificationsEnAttente ===
                "function"
        ) {

            try {

                succesManager
                    .viderNotificationsEnAttente();

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur pendant le nettoyage des notifications de succès :",
                    erreur
                );

            }

        }


        this.joueur.nom =
            this.demanderNomJoueur();


        if (
            typeof dialogueManager !==
                "undefined" &&
            typeof dialogueManager
                .vider ===
                "function"
        ) {

            dialogueManager
                .vider();

        }


        /*---------------------------------------------
            ARRÊTER L'AUDIO DE L'ANCIENNE PARTIE
        ---------------------------------------------*/

        if (
            typeof audioManager !==
                "undefined" &&
            audioManager !==
                null &&
            typeof audioManager
                .toutArreter ===
                "function"
        ) {

            audioManager
                .toutArreter();

        }


        /*
            Important avec Audio Manager V4.

            volumeMixEffets, notamment, pourrait provenir
            de la dernière scène d'une ancienne partie.

            On remet donc tous les multiplicateurs
            artistiques à 1 sans modifier les réglages
            utilisateur.
        */

        this.reinitialiserMixageAudio();


        this.retirerFond(
            0
        );


        this.verifierSucces();


        this.sauvegarder();


        this.chargerChapitre(
            0,
            this.sceneActuelle
        );

    },


    /*=====================================================
        APPLIQUER UNE SAUVEGARDE
    =====================================================*/

    appliquerSauvegarde(
        sauvegarde
    ) {

        if (
            !sauvegarde
        ) {

            this.nouvellePartie();

            return;

        }


        this.annulerTransitionFond();

        this.annulerAttenteChoix();


        this.chapitreActuel =
            sauvegarde.chapitre ??
            0;


        this.sceneActuelle =
            sauvegarde.scene ||
            "";


        this.fondActuel =
            sauvegarde.fond ||
            "";


        this.joueur = {

            ...sauvegardeManager
                .creerJoueurParDefaut(),

            ...(
                sauvegarde.joueur ||
                {}
            )

        };


        if (
            !this.joueur.nom ||
            String(
                this.joueur.nom
            )
                .trim()
                .toLowerCase() ===
                "joueur"
        ) {

            this.joueur.nom =
                this.demanderNomJoueur();


            this.sauvegarder();

        }


        this.verifierSucces();


        const chapitreSauvegarde =
            chapitresManager
                .obtenir(
                    this.chapitreActuel
                );


        if (
            !chapitreSauvegarde
        ) {

            console.warn(
                "Le chapitre sauvegardé est introuvable. Une nouvelle partie va être lancée."
            );


            this.nouvellePartie();

            return;

        }


        if (
            !this.sceneActuelle ||
            !chapitreSauvegarde
                .scenes?.[
                    this.sceneActuelle
                ]
        ) {

            this.sceneActuelle =
                chapitreSauvegarde
                    .debut;

        }


        if (
            this.fondActuel
        ) {

            this.appliquerFondImmediat(
                this.fondActuel
            );

        }


        /*
            Le mixage artistique n'est PAS restauré depuis
            les paramètres utilisateur.

            chargerChapitre() puis chargerScene()
            reconstruiront le mixage à partir du JSON
            du chapitre et de la scène correspondante.
        */

        this.reinitialiserMixageAudio();


        this.chargerChapitre(
            this.chapitreActuel,
            this.sceneActuelle
        );

    },


    /*=====================================================
        SAUVEGARDER
    =====================================================*/

    sauvegarder() {

        if (
            typeof sauvegardeManager ===
                "undefined" ||
            typeof sauvegardeManager
                .sauvegarder !==
                "function"
        ) {

            return false;

        }


        if (
            !this.joueur
        ) {

            return false;

        }


        const resultat =
            sauvegardeManager
                .sauvegarder(
                    {

                        chapitre:
                            this.chapitreActuel,

                        scene:
                            this.sceneActuelle,

                        joueur:
                            this.joueur,

                        fond:
                            this.fondActuel ||
                            "",

                        musique:
                            typeof audioManager !==
                            "undefined"

                                ? audioManager
                                    .musiqueActuelle ||
                                    ""

                                : "",

                        ambiance:
                            typeof audioManager !==
                            "undefined"

                                ? audioManager
                                    .ambianceActuelle ||
                                    ""

                                : ""

                    }
                );


        return resultat ===
            true;

    },


    /*=====================================================
        VÉRIFIER LES SUCCÈS
    =====================================================*/

    verifierSucces() {

        if (
            typeof succesManager ===
                "undefined" ||
            succesManager ===
                null ||
            typeof succesManager
                .verifierConditions !==
                "function" ||
            !this.joueur
        ) {

            return;

        }


        try {

            succesManager
                .verifierConditions(
                    this.joueur
                );

        }
        catch (
            erreur
        ) {

            console.error(
                "Erreur pendant la vérification des succès :",
                erreur
            );

        }

    },
        /*=====================================================
        VÉRIFIER SI LA GALERIE EST DISPONIBLE
    =====================================================*/

    galerieDisponible() {

        return (

            typeof galerieManager !==
                "undefined" &&

            galerieManager !==
                null &&

            typeof galerieManager
                .debloquer ===
                "function"

        );

    },


    /*=====================================================
        DÉBLOQUER UN MÉDIA DE GALERIE
    =====================================================*/

    debloquerGalerie(
        valeur
    ) {

        if (
            !valeur ||
            !this.galerieDisponible()
        ) {

            return false;

        }


        /*
            Plusieurs médias peuvent être débloqués
            en une seule fois.
        */

        if (
            Array.isArray(
                valeur
            )
        ) {

            let debloque =
                false;


            valeur.forEach(
                id => {

                    if (
                        this.debloquerGalerie(
                            id
                        )
                    ) {

                        debloque =
                            true;

                    }

                }
            );


            return debloque;

        }


        const id =
            String(
                valeur
            )
                .trim();


        if (
            !id
        ) {

            return false;

        }


        try {

            return galerieManager
                .debloquer(
                    id
                );

        }
        catch (
            erreur
        ) {

            console.error(
                `Erreur pendant le déblocage du média "${id}" :`,
                erreur
            );


            return false;

        }

    },


    /*=====================================================
        GÉRER LA GALERIE D'UN ÉLÉMENT
    =====================================================*/

    gererGalerieElement(
        element
    ) {

        if (
            !element ||
            typeof element !==
                "object"
        ) {

            return false;

        }


        if (
            !Object.prototype
                .hasOwnProperty
                .call(
                    element,
                    "galerie"
                )
        ) {

            return false;

        }


        return this.debloquerGalerie(
            element.galerie
        );

    },


    /*=====================================================
        GÉRER LA GALERIE D'UN DIALOGUE

        Cette fonction est séparée afin que dialogue.js
        puisse avertir le moteur exactement au moment où
        le dialogue est réellement affiché.

        Exemple JSON :

        {
            "personnage": "eva",
            "texte": "...",
            "galerie": "chap1RencontreEva"
        }

        IMPORTANT :

        le média ne doit pas être débloqué simplement parce
        que la scène contenant le dialogue a été chargée.
    =====================================================*/

    gererGalerieDialogue(
        dialogue
    ) {

        if (
            !dialogue ||
            typeof dialogue !==
                "object"
        ) {

            return false;

        }


        return this.gererGalerieElement(
            dialogue
        );

    },


    /*=====================================================
        CHARGER UN CHAPITRE

        IMPORTANT AUDIO V4 :

        gererAudioChapitre() déterminera désormais :
        - la musique ;
        - son volume artistique ;
        - l'ambiance ;
        - son volume artistique ;
        - le volume artistique global des effets.

        Les réglages utilisateur ne sont jamais modifiés ici.
    =====================================================*/

    chargerChapitre(
        index,
        sceneDemandee = null
    ) {

        const indexChapitre =
            Number(
                index
            );


        if (
            !Number.isInteger(
                indexChapitre
            ) ||
            indexChapitre < 0
        ) {

            console.error(
                "moteur.js : index de chapitre invalide :",
                index
            );

            return false;

        }


        const chapitre =
            chapitresManager
                .obtenir(
                    indexChapitre
                );


        if (
            !chapitre
        ) {

            this.afficherErreur(
                `Le chapitre ${indexChapitre + 1} est introuvable.`
            );

            return false;

        }


        this.annulerAttenteChoix();

        this.annulerTransitionFond();


        this.chapitreActuel =
            indexChapitre;


        this.chapitre =
            chapitre;


        /*---------------------------------------------
            TITRE
        ---------------------------------------------*/

        const elementTitre =
            document.getElementById(
                "titre"
            );


        if (
            elementTitre
        ) {

            elementTitre.textContent =
                chapitre.titre ||
                `Chapitre ${indexChapitre + 1}`;

        }


        /*---------------------------------------------
            GALERIE DU CHAPITRE
        ---------------------------------------------*/

        this.gererGalerieElement(
            chapitre
        );


        /*---------------------------------------------
            FOND DU CHAPITRE
        ---------------------------------------------*/

        this.gererFondChapitre(
            chapitre
        );


        /*---------------------------------------------
            AUDIO DU CHAPITRE

            gererAudioChapitre() sera modifié dans
            une prochaine partie pour Audio Manager V4.
        ---------------------------------------------*/

        this.gererAudioChapitre(
            chapitre
        );


        /*---------------------------------------------
            DÉTERMINER LA SCÈNE À CHARGER
        ---------------------------------------------*/

        let sceneCible =
            sceneDemandee ||
            chapitre.debut;


        if (
            !sceneCible ||
            !chapitre.scenes?.[
                sceneCible
            ]
        ) {

            console.warn(
                `moteur.js : scène "${sceneCible}" introuvable dans le chapitre ${indexChapitre + 1}.`
            );


            sceneCible =
                chapitre.debut;

        }


        if (
            !sceneCible ||
            !chapitre.scenes?.[
                sceneCible
            ]
        ) {

            this.afficherErreur(
                `Le chapitre ${indexChapitre + 1} ne possède pas de scène de départ valide.`
            );

            return false;

        }


        /*
            chargerScene() est asynchrone.

            On ne bloque volontairement pas chargerChapitre()
            afin de conserver le comportement actuel du moteur.
        */

        this.chargerScene(
            sceneCible
        );


        return true;

    },


    /*=====================================================
        CHARGER UNE SCÈNE
    =====================================================*/

    async chargerScene(
        idScene
    ) {

        if (
            !this.chapitre ||
            !this.chapitre.scenes
        ) {

            console.error(
                "moteur.js : aucun chapitre actif."
            );

            return false;

        }


        if (
            !idScene
        ) {

            console.error(
                "moteur.js : identifiant de scène manquant."
            );

            return false;

        }


        const scene =
            this.chapitre
                .scenes[
                    idScene
                ];


        if (
            !scene
        ) {

            console.error(
                `moteur.js : scène introuvable : "${idScene}".`
            );


            this.afficherErreur(
                `La scène "${idScene}" est introuvable.`
            );

            return false;

        }


        /*---------------------------------------------
            ANNULER LES ÉTATS DE LA SCÈNE PRÉCÉDENTE
        ---------------------------------------------*/

        this.annulerAttenteChoix();


        if (
            typeof choixManager !==
                "undefined" &&
            choixManager !==
                null &&
            typeof choixManager
                .fermerPopup ===
                "function"
        ) {

            try {

                choixManager
                    .fermerPopup();

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur fermeture popup choix :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
            ENREGISTRER LA SCÈNE ACTIVE
        ---------------------------------------------*/

        this.sceneActuelle =
            idScene;


        console.log(
            `Chargement de la scène : ${idScene}`
        );


        /*---------------------------------------------
            GALERIE DE LA SCÈNE
        ---------------------------------------------*/

        this.gererGalerieElement(
            scene
        );


        /*---------------------------------------------
            EFFETS DE SCÈNE
        ---------------------------------------------*/

        if (
            scene.effet &&
            typeof scene.effet ===
                "object"
        ) {

            this.appliquerEffets(
                scene.effet
            );

        }


        /*
            Compatibilité supplémentaire.

            Certains chapitres peuvent utiliser :

            "effets": [
                {...},
                {...}
            ]

            On accepte donc également un tableau.
        */

        if (
            Array.isArray(
                scene.effets
            )
        ) {

            scene.effets.forEach(
                effet => {

                    if (
                        effet &&
                        typeof effet ===
                            "object"
                    ) {

                        this.appliquerEffets(
                            effet
                        );

                    }

                }
            );

        }


        /*---------------------------------------------
            SUCCÈS
        ---------------------------------------------*/

        this.verifierSucces();


        /*---------------------------------------------
            CONDITIONS DE REDIRECTION
        ---------------------------------------------*/

        if (
            Array.isArray(
                scene.conditions
            ) &&
            scene.conditions.length >
                0
        ) {

            const destination =
                this.evaluerConditionsScene(
                    scene.conditions
                );


            if (
                destination
            ) {

                this.sauvegarder();


                /*
                    Une redirection peut pointer
                    vers une scène ou un chapitre.
                */

                await this.gererDestination(
                    destination
                );


                return true;

            }

        }


        /*---------------------------------------------
            FOND DE LA SCÈNE
        ---------------------------------------------*/

        this.gererFondScene(
            scene
        );


        /*---------------------------------------------
            AUDIO DE LA SCÈNE

            C'est ici que les propriétés comme :

            "volumeMusique": 0.85
            "volumeAmbiance": 0.30
            "volumeEffets": 0.75
            "volumeSon": 0.90

            seront appliquées par gererAudioScene().
        ---------------------------------------------*/

        this.gererAudioScene(
            scene
        );


        /*---------------------------------------------
            SAUVEGARDE
        ---------------------------------------------*/

        this.sauvegarder();


        /*---------------------------------------------
            VIDÉO DE LA SCÈNE

            La vidéo est jouée avant les dialogues.

            Si la vidéo possède un "next",
            la scène change directement après
            la cinématique.
        ---------------------------------------------*/

        if (
            scene.video
        ) {

            const resultatVideo =
                await this.gererVideoScene(
                    scene
                );


            /*
                Une autre scène pourrait avoir
                été chargée pendant la vidéo.
            */

            if (
                this.sceneActuelle !==
                    idScene
            ) {

                return true;

            }


            if (
                resultatVideo
                    ?.destination
            ) {

                await this.gererDestination(
                    resultatVideo.destination
                );


                return true;

            }

        }


        /*---------------------------------------------
            DIALOGUES
        ---------------------------------------------*/

        if (
            typeof dialogueManager !==
                "undefined" &&
            dialogueManager !==
                null &&
            typeof dialogueManager
                .afficherScene ===
                "function"
        ) {

            try {

                await dialogueManager
                    .afficherScene(
                        scene
                    );

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur pendant l'affichage de la scène :",
                    erreur
                );

            }

        }
        else {

            console.warn(
                "moteur.js : dialogueManager.afficherScene() est indisponible."
            );

        }


        /*
            Une autre scène peut avoir été chargée
            pendant l'affichage des dialogues.
        */

        if (
            this.sceneActuelle !==
                idScene
        ) {

            return true;

        }


        /*---------------------------------------------
            NOTIFICATIONS DE SUCCÈS EN ATTENTE

            Les succès débloqués par la scène précédente,
            un choix ou les effets de la scène courante
            sont affichés après les dialogues, avant les
            choix ou la destination suivante.
        ---------------------------------------------*/

        if (
            typeof succesManager !==
                "undefined" &&
            succesManager !==
                null &&
            typeof succesManager
                .afficherNotificationsEnAttente ===
                "function"
        ) {

            try {

                succesManager
                    .afficherNotificationsEnAttente();

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur pendant l'affichage des notifications de succès :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
            FIN D'AFFICHAGE
        ---------------------------------------------*/

        this.terminerAffichageScene(
            scene
        );


        return true;

    },
        /*=====================================================
        GÉRER UNE DESTINATION

        Fonction centrale.

        Formats acceptés :

        "discussionEva"
            -> scène du chapitre actuel

        "chapitre2"
            -> chapitre 2

        "finJeu"
            -> fin du jeu

        {
            "scene": "discussionEva"
        }

        {
            "chapitre": 3
        }

        {
            "chapitre": 3,
            "scene": "arrivee"
        }

        {
            "next": "discussionEva"
        }

        IMPORTANT :

        Pour une destination objet avec "chapitre",
        le numéro correspond au numéro humain :

            1 = chapitre 1
            2 = chapitre 2
            13 = chapitre 13

        tandis que chapitresManager travaille avec
        des index commençant à 0.
    =====================================================*/

    async gererDestination(
        destination
    ) {

        if (
            destination === null ||
            destination === undefined
        ) {

            console.warn(
                "moteur.js : destination manquante."
            );

            return false;

        }


        /*---------------------------------------------
            DESTINATION SOUS FORME D'OBJET
        ---------------------------------------------*/

        if (
            typeof destination ===
                "object" &&
            !Array.isArray(
                destination
            )
        ) {

            /*-----------------------------------------
                CHAPITRE + ÉVENTUELLE SCÈNE
            -----------------------------------------*/

            if (
                Object.prototype
                    .hasOwnProperty
                    .call(
                        destination,
                        "chapitre"
                    )
            ) {

                let numeroChapitre =
                    destination.chapitre;


                /*
                    Accepte aussi :

                    "chapitre": "chapitre13"
                */

                if (
                    typeof numeroChapitre ===
                        "string"
                ) {

                    const correspondance =
                        numeroChapitre
                            .trim()
                            .match(
                                /^chapitre(\d+)$/i
                            );


                    if (
                        correspondance
                    ) {

                        numeroChapitre =
                            Number.parseInt(
                                correspondance[1],
                                10
                            );

                    }

                }


                numeroChapitre =
                    Number(
                        numeroChapitre
                    );


                if (
                    !Number.isInteger(
                        numeroChapitre
                    ) ||
                    numeroChapitre < 1
                ) {

                    console.error(
                        "moteur.js : numéro de chapitre invalide dans la destination :",
                        destination
                    );

                    return false;

                }


                const indexChapitre =
                    numeroChapitre -
                    1;


                const chapitreCible =
                    chapitresManager
                        .obtenir(
                            indexChapitre
                        );


                if (
                    !chapitreCible
                ) {

                    this.afficherErreur(
                        `Le chapitre ${numeroChapitre} est introuvable.`
                    );

                    return false;

                }


                let sceneCible =
                    null;


                if (
                    typeof destination.scene ===
                        "string" &&
                    destination.scene.trim() !==
                        ""
                ) {

                    sceneCible =
                        destination.scene.trim();

                }


                if (
                    !sceneCible
                ) {

                    sceneCible =
                        chapitreCible.debut;

                }


                return this.chargerChapitre(
                    indexChapitre,
                    sceneCible
                );

            }


            /*-----------------------------------------
                SCÈNE DU CHAPITRE ACTUEL
            -----------------------------------------*/

            if (
                typeof destination.scene ===
                    "string" &&
                destination.scene.trim() !==
                    ""
            ) {

                return await this.chargerScene(
                    destination.scene.trim()
                );

            }


            /*-----------------------------------------
                DESTINATION IMBRIQUÉE
            -----------------------------------------*/

            if (
                Object.prototype
                    .hasOwnProperty
                    .call(
                        destination,
                        "next"
                    )
            ) {

                return await this.gererDestination(
                    destination.next
                );

            }


            console.warn(
                "moteur.js : objet de destination non reconnu :",
                destination
            );

            return false;

        }


        /*---------------------------------------------
            DESTINATION TEXTE
        ---------------------------------------------*/

        const destinationTexte =
            String(
                destination
            )
                .trim();


        if (
            !destinationTexte
        ) {

            console.warn(
                "moteur.js : destination vide."
            );

            return false;

        }


        console.log(
            "moteur.js : destination :",
            destinationTexte
        );


        /*---------------------------------------------
            FIN DU JEU
        ---------------------------------------------*/

        if (
            destinationTexte ===
                "finJeu" ||
            destinationTexte ===
                "terminerJeu"
        ) {

            this.terminerJeu();

            return true;

        }


        /*---------------------------------------------
            FIN NOMMÉE

            Exemple :

            "fin:finEva"
        ---------------------------------------------*/

        if (
            destinationTexte
                .toLowerCase()
                .startsWith(
                    "fin:"
                )
        ) {

            const nomFin =
                destinationTexte
                    .substring(
                        4
                    )
                    .trim();


            this.terminerJeu(
                nomFin ||
                "finNeutre"
            );


            return true;

        }


        /*---------------------------------------------
            CHANGEMENT DE CHAPITRE

            Exemples :

            chapitre2
            chapitre3
            chapitre13
        ---------------------------------------------*/

        const correspondanceChapitre =
            destinationTexte.match(
                /^chapitre(\d+)$/i
            );


        if (
            correspondanceChapitre
        ) {

            const numeroChapitre =
                Number.parseInt(
                    correspondanceChapitre[
                        1
                    ],
                    10
                );


            if (
                !Number.isInteger(
                    numeroChapitre
                ) ||
                numeroChapitre < 1
            ) {

                this.afficherErreur(
                    `Destination de chapitre invalide : "${destinationTexte}".`
                );

                return false;

            }


            const indexChapitre =
                numeroChapitre -
                1;


            const chapitreCible =
                chapitresManager
                    .obtenir(
                        indexChapitre
                    );


            if (
                !chapitreCible
            ) {

                this.afficherErreur(
                    `Le chapitre ${numeroChapitre} est introuvable.`
                );

                return false;

            }


            return this.chargerChapitre(
                indexChapitre,
                chapitreCible.debut
            );

        }


        /*---------------------------------------------
            SCÈNE DU CHAPITRE ACTUEL
        ---------------------------------------------*/

        return await this.chargerScene(
            destinationTexte
        );

    },


    /*=====================================================
        GÉRER LE FOND DU CHAPITRE
    =====================================================*/

    gererFondChapitre(
        chapitre
    ) {

        if (
            !chapitre ||
            typeof chapitre !==
                "object"
        ) {

            return false;

        }


        if (
            !chapitre.fond
        ) {

            return false;

        }


        /*
            Le fond du chapitre sert de valeur
            par défaut.

            On évite de remplacer immédiatement
            un fond restauré depuis une sauvegarde.
        */

        if (
            this.fondActuel
        ) {

            return false;

        }


        const duree =
            this.obtenirDureeTransitionFond(
                chapitre
            );


        return this.changerFond(
            chapitre.fond,
            duree,
            chapitre
        );

    },


    /*=====================================================
        GÉRER LE FOND D'UNE SCÈNE
    =====================================================*/

    gererFondScene(
        scene
    ) {

        if (
            !scene ||
            typeof scene !==
                "object"
        ) {

            return false;

        }


        /*---------------------------------------------
            RETIRER LE FOND
        ---------------------------------------------*/

        if (
            scene.fond ===
                false ||
            scene.fond ===
                null
        ) {

            return this.retirerFond(
                this.obtenirDureeTransitionFond(
                    scene
                )
            );

        }


        /*---------------------------------------------
            NOUVEAU FOND
        ---------------------------------------------*/

        if (
            scene.fond
        ) {

            return this.changerFond(
                scene.fond,
                this.obtenirDureeTransitionFond(
                    scene
                ),
                scene
            );

        }


        /*---------------------------------------------
            FOND DU CHAPITRE EN SECOURS
        ---------------------------------------------*/

        if (
            !this.fondActuel &&
            this.chapitre?.fond
        ) {

            return this.changerFond(
                this.chapitre.fond,
                this.obtenirDureeTransitionFond(
                    this.chapitre
                ),
                this.chapitre
            );

        }


        return false;

    },


    /*=====================================================
        GÉRER LE FOND D'UN DIALOGUE
    =====================================================*/

    gererFondDialogue(
        dialogue
    ) {

        if (
            !dialogue ||
            typeof dialogue !==
                "object"
        ) {

            return false;

        }


        /*
            Un dialogue sans propriété "fond"
            ne change rien.
        */

        if (
            !Object.prototype
                .hasOwnProperty
                .call(
                    dialogue,
                    "fond"
                )
        ) {

            return false;

        }


        /*---------------------------------------------
            RETIRER LE FOND
        ---------------------------------------------*/

        if (
            dialogue.fond ===
                false ||
            dialogue.fond ===
                null ||
            dialogue.fond ===
                ""
        ) {

            return this.retirerFond(
                this.obtenirDureeTransitionFond(
                    dialogue
                )
            );

        }


        /*---------------------------------------------
            CHANGER LE FOND
        ---------------------------------------------*/

        return this.changerFond(
            dialogue.fond,
            this.obtenirDureeTransitionFond(
                dialogue
            ),
            dialogue
        );

    },


    /*=====================================================
        VÉRIFIER SI UNE VIDÉO POSSÈDE UNE EXTENSION
    =====================================================*/

    videoPossedeExtension(
        video
    ) {

        if (
            !video
        ) {

            return false;

        }


        return /\.(mp4|webm|ogg|mov)$/i
            .test(
                String(
                    video
                )
            );

    },


    /*=====================================================
        VÉRIFIER SI LE CHEMIN VIDÉO EST DÉJÀ COMPLET
    =====================================================*/

    videoEstCheminComplet(
        video
    ) {

        if (
            !video
        ) {

            return false;

        }


        const valeur =
            String(
                video
            )
                .trim();


        return (

            valeur.startsWith(
                "http://"
            ) ||

            valeur.startsWith(
                "https://"
            ) ||

            valeur.startsWith(
                "/"
            ) ||

            valeur.startsWith(
                "./"
            ) ||

            valeur.startsWith(
                "../"
            ) ||

            valeur.includes(
                "/"
            )

        );

    },


    /*=====================================================
        CONSTRUIRE LE CHEMIN D'UNE VIDÉO

        Exemples :

        "surveillance"
            ->
        videos/surveillance.mp4

        "surveillance.mp4"
            ->
        videos/surveillance.mp4

        "videos/surveillance.mp4"
            ->
        videos/surveillance.mp4

        "../videos/surveillance.mp4"
            ->
        ../videos/surveillance.mp4
    =====================================================*/

    construireCheminVideo(
        video
    ) {

        if (
            video ===
                null ||
            video ===
                undefined
        ) {

            return "";

        }


        const nom =
            String(
                video
            )
                .trim();


        if (
            !nom
        ) {

            return "";

        }


        /*
            Un chemin déjà complet ne doit surtout
            pas recevoir une seconde fois "videos/".
        */

        if (
            this.videoEstCheminComplet(
                nom
            )
        ) {

            return nom;

        }


        /*
            Le fichier contient déjà une extension.
        */

        if (
            this.videoPossedeExtension(
                nom
            )
        ) {

            return (
                this.cheminVideos +
                nom
            );

        }


        /*
            Extension par défaut.
        */

        return (
            this.cheminVideos +
            nom +
            "." +
            this.extensionVideoParDefaut
        );

    },


    /*=====================================================
        NORMALISER LA CONFIGURATION D'UNE VIDÉO

        Formats acceptés :

        "video": "cinematique1"

        ou :

        "video": {
            "fichier": "cinematique1",
            "controls": false,
            "passable": true,
            "pauseAudio": true,
            "volume": 1,
            "muted": false,
            "galerie": "cinematique1",
            "next": "sceneApresVideo"
        }
    =====================================================*/

    normaliserConfigurationVideo(
        valeur
    ) {

        if (
            !valeur
        ) {

            return null;

        }


        /*---------------------------------------------
            FORMAT SIMPLE
        ---------------------------------------------*/

        if (
            typeof valeur ===
                "string"
        ) {

            return {

                fichier:
                    valeur,

                controls:
                    false,

                passable:
                    false,

                pauseAudio:
                    true,

                volume:
                    1,

                muted:
                    false,

                next:
                    null,

                galerie:
                    null

            };

        }


        /*---------------------------------------------
            FORMAT OBJET
        ---------------------------------------------*/

        if (
            typeof valeur !==
                "object" ||
            Array.isArray(
                valeur
            )
        ) {

            return null;

        }


        const fichier =

            valeur.fichier ||

            valeur.src ||

            valeur.source ||

            valeur.nom ||

            "";


        if (
            !fichier
        ) {

            return null;

        }


        const volume =
            Number(
                valeur.volume
            );


        return {

            ...valeur,

            fichier:
                String(
                    fichier
                )
                    .trim(),

            controls:
                valeur.controls ===
                true,

            passable:
                valeur.passable ===
                true,

            pauseAudio:
                valeur.pauseAudio !==
                false,

            volume:
                Number.isFinite(
                    volume
                )

                    ? Math.max(
                        0,
                        Math.min(
                            1,
                            volume
                        )
                    )

                    : 1,

            muted:
                valeur.muted ===
                    true ||
                valeur.muette ===
                    true,

            next:
                valeur.next ??
                null,

            galerie:
                valeur.galerie ??
                null

        };

    },
        /*=====================================================
        CRÉER LE CONTENEUR VIDÉO

        Le conteneur est créé dynamiquement.
        Aucun changement HTML obligatoire.
    =====================================================*/

    creerConteneurVideo() {

        if (
            this.conteneurVideo &&
            document.body.contains(
                this.conteneurVideo
            )
        ) {

            return this.conteneurVideo;

        }


        let conteneur =
            document.getElementById(
                "cinematique-jeu"
            );


        if (
            conteneur
        ) {

            this.conteneurVideo =
                conteneur;

            return conteneur;

        }


        conteneur =
            document.createElement(
                "div"
            );


        conteneur.id =
            "cinematique-jeu";


        /*
            Styles directement ici pour que
            le système fonctionne même sans
            modification immédiate du CSS.
        */

        Object.assign(
            conteneur.style,
            {

                position:
                    "fixed",

                inset:
                    "0",

                width:
                    "100%",

                height:
                    "100%",

                background:
                    "#000",

                display:
                    "none",

                alignItems:
                    "center",

                justifyContent:
                    "center",

                zIndex:
                    "10000",

                overflow:
                    "hidden"

            }
        );


        document.body.appendChild(
            conteneur
        );


        this.conteneurVideo =
            conteneur;


        return conteneur;

    },


    /*=====================================================
        METTRE L'AUDIO DU JEU EN PAUSE POUR UNE VIDÉO

        On mémorise précisément ce qui jouait avant
        la cinématique afin de ne reprendre ensuite
        que ces pistes.

        Le mixage artistique d'Audio Manager V4
        n'est pas modifié.
    =====================================================*/

    mettreAudioEnPausePourVideo() {

        if (
            typeof audioManager ===
                "undefined" ||
            audioManager ===
                null
        ) {

            return {

                musique:
                    false,

                ambiance:
                    false

            };

        }


        const etat = {

            musique:
                false,

            ambiance:
                false

        };


        /*---------------------------------------------
            MUSIQUE
        ---------------------------------------------*/

        try {

            if (
                audioManager.musique &&
                !audioManager
                    .musique
                    .paused
            ) {

                etat.musique =
                    true;


                audioManager
                    .musique
                    .pause();


                audioManager
                    .musiqueEnPause =
                    true;

            }

        }
        catch (
            erreur
        ) {

            console.error(
                "moteur.js : impossible de mettre la musique en pause pour la vidéo :",
                erreur
            );

        }


        /*---------------------------------------------
            AMBIANCE
        ---------------------------------------------*/

        try {

            if (
                audioManager.ambiance &&
                !audioManager
                    .ambiance
                    .paused
            ) {

                etat.ambiance =
                    true;


                audioManager
                    .ambiance
                    .pause();


                audioManager
                    .ambianceEnPause =
                    true;

            }

        }
        catch (
            erreur
        ) {

            console.error(
                "moteur.js : impossible de mettre l'ambiance en pause pour la vidéo :",
                erreur
            );

        }


        return etat;

    },


    /*=====================================================
        REPRENDRE L'AUDIO APRÈS UNE VIDÉO

        Compatible avec Audio Manager V4.

        On privilégie audioManager.lancerLecture()
        afin de conserver sa gestion sécurisée
        des restrictions du navigateur.
    =====================================================*/

    reprendreAudioApresVideo(
        etat
    ) {

        if (
            !etat ||
            typeof audioManager ===
                "undefined" ||
            audioManager ===
                null
        ) {

            return;

        }


        /*---------------------------------------------
            REPRENDRE LA MUSIQUE
        ---------------------------------------------*/

        if (
            etat.musique &&
            audioManager.musique &&
            audioManager.musiqueActuelle
        ) {

            try {

                if (
                    typeof audioManager
                        .lancerLecture ===
                        "function"
                ) {

                    audioManager
                        .lancerLecture(
                            audioManager.musique,
                            audioManager.musiqueActuelle
                        );

                }
                else {

                    const lecture =
                        audioManager
                            .musique
                            .play();


                    if (
                        lecture &&
                        typeof lecture.catch ===
                            "function"
                    ) {

                        lecture.catch(
                            () => {}
                        );

                    }

                }


                audioManager
                    .musiqueEnPause =
                    false;

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur reprise musique après vidéo :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
            REPRENDRE L'AMBIANCE
        ---------------------------------------------*/

        if (
            etat.ambiance &&
            audioManager.ambiance &&
            audioManager.ambianceActuelle
        ) {

            try {

                if (
                    typeof audioManager
                        .lancerLecture ===
                        "function"
                ) {

                    audioManager
                        .lancerLecture(
                            audioManager.ambiance,
                            audioManager.ambianceActuelle
                        );

                }
                else {

                    const lecture =
                        audioManager
                            .ambiance
                            .play();


                    if (
                        lecture &&
                        typeof lecture.catch ===
                            "function"
                    ) {

                        lecture.catch(
                            () => {}
                        );

                    }

                }


                audioManager
                    .ambianceEnPause =
                    false;

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur reprise ambiance après vidéo :",
                    erreur
                );

            }

        }

    },


    /*=====================================================
        ARRÊTER LA VIDÉO EN COURS
    =====================================================*/

    arreterVideo() {

        if (
            this.videoEnCours
        ) {

            try {

                this.videoEnCours
                    .pause();


                this.videoEnCours
                    .removeAttribute(
                        "src"
                    );


                this.videoEnCours
                    .load();

            }
            catch (
                erreur
            ) {

                /*
                    L'arrêt de la vidéo ne doit jamais
                    bloquer le jeu.
                */

            }

        }


        this.videoEnCours =
            null;


        if (
            this.conteneurVideo
        ) {

            this.conteneurVideo
                .innerHTML =
                "";


            this.conteneurVideo
                .style
                .display =
                "none";

        }

    },


    /*=====================================================
        LANCER UNE VIDÉO

        Retourne une Promise qui se termine lorsque :

        - la vidéo arrive à la fin ;
        - le joueur la passe ;
        - une erreur de lecture se produit.

        Résultat :

        {
            terminee: true,
            raison: "fin" | "passee" | "erreur",
            destination: ...
        }
    =====================================================*/

    async jouerVideo(
        valeur
    ) {

        const configuration =
            this.normaliserConfigurationVideo(
                valeur
            );


        if (
            !configuration
        ) {

            return {

                terminee:
                    false,

                raison:
                    "configuration-invalide",

                destination:
                    null

            };

        }


        const chemin =
            this.construireCheminVideo(
                configuration.fichier
            );


        if (
            !chemin
        ) {

            return {

                terminee:
                    false,

                raison:
                    "chemin-invalide",

                destination:
                    configuration.next

            };

        }


        /*---------------------------------------------
            ARRÊTER UNE ANCIENNE VIDÉO
        ---------------------------------------------*/

        this.arreterVideo();


        /*---------------------------------------------
            CONTENEUR
        ---------------------------------------------*/

        const conteneur =
            this.creerConteneurVideo();


        if (
            !conteneur
        ) {

            return {

                terminee:
                    false,

                raison:
                    "conteneur-introuvable",

                destination:
                    configuration.next

            };

        }


        /*---------------------------------------------
            AUDIO DU JEU
        ---------------------------------------------*/

        let etatAudio =
            null;


        if (
            configuration.pauseAudio
        ) {

            etatAudio =
                this.mettreAudioEnPausePourVideo();

        }


        /*---------------------------------------------
            CRÉER LA VIDÉO
        ---------------------------------------------*/

        const video =
            document.createElement(
                "video"
            );


        video.src =
            chemin;


        video.preload =
            "auto";


        video.autoplay =
            true;


        video.playsInline =
            true;


        video.controls =
            configuration.controls;


        video.muted =
            configuration.muted;


        video.volume =
            configuration.volume;


        video.style.width =
            "100%";


        video.style.height =
            "100%";


        video.style.objectFit =
            configuration.objectFit ||
            configuration.taille ||
            "contain";


        video.style.background =
            "#000";


        this.videoEnCours =
            video;


        conteneur.innerHTML =
            "";


        conteneur.appendChild(
            video
        );


        /*---------------------------------------------
            MASQUER LE JEU PENDANT LA CINÉMATIQUE
        ---------------------------------------------*/

        const conversation =
            document.getElementById(
                "conversation"
            );


        const popupChoix =
            document.getElementById(
                "popupChoix"
            );


        if (
            conversation
        ) {

            conversation.style.visibility =
                "hidden";

        }


        if (
            popupChoix
        ) {

            popupChoix.style.display =
                "none";

        }


        conteneur.style.display =
            "flex";


        /*---------------------------------------------
            BOUTON PASSER
        ---------------------------------------------*/

        let boutonPasser =
            null;


        if (
            configuration.passable
        ) {

            boutonPasser =
                document.createElement(
                    "button"
                );


            boutonPasser.type =
                "button";


            boutonPasser.textContent =
                configuration.textePasser ||
                "Passer";


            Object.assign(
                boutonPasser.style,
                {

                    position:
                        "absolute",

                    right:
                        "24px",

                    bottom:
                        "24px",

                    zIndex:
                        "2",

                    padding:
                        "12px 20px",

                    border:
                        "1px solid rgba(255,255,255,.4)",

                    borderRadius:
                        "12px",

                    background:
                        "rgba(0,0,0,.65)",

                    color:
                        "#fff",

                    cursor:
                        "pointer",

                    fontSize:
                        "16px"

                }
            );


            conteneur.appendChild(
                boutonPasser
            );

        }


        /*---------------------------------------------
            ATTENDRE LA FIN DE LA CINÉMATIQUE
        ---------------------------------------------*/

        return await new Promise(
            resolve => {

                let termine =
                    false;


                const terminer =
                    (
                        raison =
                            "fin"
                    ) => {

                        /*
                            Plusieurs événements pourraient
                            théoriquement arriver presque
                            simultanément.

                            On ne termine qu'une seule fois.
                        */

                        if (
                            termine
                        ) {

                            return;

                        }


                        termine =
                            true;


                        /*---------------------------------
                            ARRÊTER LA VIDÉO
                        ---------------------------------*/

                        try {

                            video.pause();

                        }
                        catch (
                            erreur
                        ) {

                            /*
                                Rien à faire.
                            */

                        }


                        if (
                            this.videoEnCours ===
                            video
                        ) {

                            this.videoEnCours =
                                null;

                        }


                        /*---------------------------------
                            NETTOYER LE CONTENEUR
                        ---------------------------------*/

                        conteneur.innerHTML =
                            "";


                        conteneur.style.display =
                            "none";


                        /*---------------------------------
                            RÉAFFICHER LE JEU
                        ---------------------------------*/

                        if (
                            conversation
                        ) {

                            conversation.style.visibility =
                                "";

                        }


                        if (
                            popupChoix
                        ) {

                            popupChoix.style.display =
                                "";

                        }


                        /*---------------------------------
                            REPRENDRE L'AUDIO
                        ---------------------------------*/

                        if (
                            configuration.pauseAudio
                        ) {

                            this.reprendreAudioApresVideo(
                                etatAudio
                            );

                        }


                        /*---------------------------------
                            GALERIE

                            La vidéo n'est débloquée que si :

                            - elle arrive réellement à la fin ;
                            - le joueur la passe volontairement.

                            Une erreur de chargement ou de
                            lecture ne doit pas débloquer
                            automatiquement la cinématique.
                        ---------------------------------*/

                        if (
                            configuration.galerie &&
                            (
                                raison ===
                                    "fin" ||
                                raison ===
                                    "passee"
                            )
                        ) {

                            this.debloquerGalerie(
                                configuration.galerie
                            );

                        }


                        /*---------------------------------
                            TERMINER LA PROMESSE
                        ---------------------------------*/

                        resolve(
                            {

                                terminee:
                                    true,

                                raison:
                                    raison,

                                destination:
                                    configuration.next ??
                                    null

                            }
                        );

                    };


                /*-----------------------------------------
                    FIN NORMALE
                -----------------------------------------*/

                video.addEventListener(
                    "ended",
                    () => {

                        terminer(
                            "fin"
                        );

                    },
                    {
                        once:
                            true
                    }
                );


                /*-----------------------------------------
                    ERREUR
                -----------------------------------------*/

                video.addEventListener(
                    "error",
                    () => {

                        console.error(
                            `moteur.js : impossible de lire la vidéo "${chemin}".`
                        );


                        terminer(
                            "erreur"
                        );

                    },
                    {
                        once:
                            true
                    }
                );


                /*-----------------------------------------
                    PASSER LA VIDÉO
                -----------------------------------------*/

                if (
                    boutonPasser
                ) {

                    boutonPasser
                        .addEventListener(
                            "click",
                            () => {

                                terminer(
                                    "passee"
                                );

                            },
                            {
                                once:
                                    true
                            }
                        );

                }


                /*-----------------------------------------
                    DÉMARRER LA LECTURE
                -----------------------------------------*/

                try {

                    const lecture =
                        video.play();


                    if (
                        lecture &&
                        typeof lecture.catch ===
                            "function"
                    ) {

                        lecture.catch(
                            erreur => {

                                /*
                                    L'autoplay avec son peut être
                                    bloqué par le navigateur.

                                    On active alors les contrôles
                                    pour permettre au joueur de
                                    démarrer manuellement.
                                */

                                console.warn(
                                    "moteur.js : lecture automatique de la vidéo bloquée :",
                                    erreur
                                );


                                video.controls =
                                    true;

                            }
                        );

                    }

                }
                catch (
                    erreur
                ) {

                    console.error(
                        "moteur.js : erreur de démarrage vidéo :",
                        erreur
                    );


                    /*
                        Une exception réelle lors du démarrage
                        est considérée comme une erreur vidéo.
                    */

                    terminer(
                        "erreur"
                    );

                }

            }
        );

    },


    /*=====================================================
        GÉRER LA VIDÉO D'UNE SCÈNE
    =====================================================*/

    async gererVideoScene(
        scene
    ) {

        if (
            !scene ||
            typeof scene !==
                "object" ||
            !scene.video
        ) {

            return {

                video:
                    false,

                destination:
                    null

            };

        }


        const resultat =
            await this.jouerVideo(
                scene.video
            );


        return {

            video:
                true,

            raison:
                resultat?.raison ||
                null,

            destination:
                resultat?.destination ??
                null

        };

    },
        /*=====================================================
        NORMALISER UN VOLUME ARTISTIQUE

        Le moteur travaille avec des valeurs comprises
        entre 0 et 1.

        Exemples :

        1
            = niveau artistique maximal

        0.80
            = 80 % du réglage utilisateur

        0
            = silence

        Si Audio Manager V4 possède sa propre fonction
        de normalisation, elle est utilisée en priorité.
    =====================================================*/

    normaliserVolumeAudio(
        valeur,
        valeurParDefaut = 1
    ) {

        if (
            valeur === undefined ||
            valeur === null ||
            valeur === ""
        ) {

            valeur =
                valeurParDefaut;

        }


        if (
            typeof audioManager !==
                "undefined" &&
            audioManager !==
                null &&
            typeof audioManager
                .normaliserVolumeMix ===
                "function"
        ) {

            return audioManager
                .normaliserVolumeMix(
                    valeur,
                    valeurParDefaut
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
        NORMALISER UNE DURÉE DE TRANSITION AUDIO

        Les durées sont exprimées en millisecondes.

        Exemple :

        "transitionMusique": 1500

        = fondu de 1,5 seconde.
    =====================================================*/

    normaliserDureeAudio(
        valeur,
        valeurParDefaut = 0
    ) {

        if (
            valeur === undefined ||
            valeur === null ||
            valeur === ""
        ) {

            return Math.max(
                0,
                Number(
                    valeurParDefaut
                ) || 0
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
                Number(
                    valeurParDefaut
                ) || 0
            );

        }


        return Math.max(
            0,
            nombre
        );

    },


    /*=====================================================
        VÉRIFIER SI UNE VALEUR AUDIO SIGNIFIE "AUCUNE"

        Permet d'utiliser :

        false
        null
        ""
        "aucun"
        "aucune"
        "none"
    =====================================================*/

    audioEstDesactive(
        valeur
    ) {

        if (
            valeur === false ||
            valeur === null ||
            valeur === undefined ||
            valeur === ""
        ) {

            return true;

        }


        if (
            typeof valeur !==
                "string"
        ) {

            return false;

        }


        const texte =
            valeur
                .trim()
                .toLowerCase();


        return (
            texte === "aucun" ||
            texte === "aucune" ||
            texte === "none" ||
            texte === "false"
        );

    },


    /*=====================================================
        GÉRER L'AUDIO DU CHAPITRE

        Le chapitre définit le mixage de base.

        Exemple :

        {
            "musique": "chapitre14",
            "volumeMusique": 0.85,
            "transitionMusique": 1200,

            "ambiance": "pluie",
            "volumeAmbiance": 0.35,
            "transitionAmbiance": 800,

            "volumeEffets": 0.90
        }

        Les scènes peuvent ensuite modifier ces valeurs.
    =====================================================*/

    gererAudioChapitre(
        chapitre
    ) {

        if (
            !chapitre ||
            typeof chapitre !==
                "object" ||
            typeof audioManager ===
                "undefined" ||
            audioManager ===
                null
        ) {

            return false;

        }


        /*=================================================
            MIXAGE GLOBAL DES EFFETS
        =================================================*/

        const volumeEffets =
            Object.prototype
                .hasOwnProperty
                .call(
                    chapitre,
                    "volumeEffets"
                )

                ? this.normaliserVolumeAudio(
                    chapitre.volumeEffets,
                    this.volumeMixEffetsParDefaut
                )

                : this.volumeMixEffetsParDefaut;


        if (
            typeof audioManager
                .setVolumeMixEffets ===
                "function"
        ) {

            try {

                audioManager
                    .setVolumeMixEffets(
                        volumeEffets
                    );

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur volume des effets du chapitre :",
                    erreur
                );

            }

        }


        /*=================================================
            MUSIQUE DU CHAPITRE
        =================================================*/

        const possedeMusique =
            Object.prototype
                .hasOwnProperty
                .call(
                    chapitre,
                    "musique"
                );


        const possedeVolumeMusique =
            Object.prototype
                .hasOwnProperty
                .call(
                    chapitre,
                    "volumeMusique"
                );


        const volumeMusique =
            this.normaliserVolumeAudio(

                possedeVolumeMusique

                    ? chapitre.volumeMusique

                    : this.volumeMixMusiqueParDefaut,

                this.volumeMixMusiqueParDefaut

            );


        const transitionMusique =
            this.normaliserDureeAudio(
                chapitre.transitionMusique,
                0
            );


        if (
            possedeMusique
        ) {

            /*-----------------------------------------
                ARRÊTER LA MUSIQUE
            -----------------------------------------*/

            if (
                this.audioEstDesactive(
                    chapitre.musique
                )
            ) {

                try {

                    if (
                        transitionMusique > 0 &&
                        typeof audioManager
                            .fadeOut ===
                            "function"
                    ) {

                        audioManager
                            .fadeOut(
                                transitionMusique
                            );

                    }
                    else if (
                        typeof audioManager
                            .arreterMusique ===
                            "function"
                    ) {

                        audioManager
                            .arreterMusique();

                    }

                }
                catch (
                    erreur
                ) {

                    console.error(
                        "moteur.js : erreur arrêt musique chapitre :",
                        erreur
                    );

                }

            }

            /*-----------------------------------------
                JOUER / CHANGER LA MUSIQUE
            -----------------------------------------*/

            else {

                try {

                    if (
                        transitionMusique > 0 &&
                        typeof audioManager
                            .changerMusique ===
                            "function"
                    ) {

                        audioManager
                            .changerMusique(
                                chapitre.musique,
                                transitionMusique,
                                volumeMusique
                            );

                    }
                    else if (
                        typeof audioManager
                            .jouerMusique ===
                            "function"
                    ) {

                        audioManager
                            .jouerMusique(
                                chapitre.musique,
                                volumeMusique
                            );

                    }

                }
                catch (
                    erreur
                ) {

                    console.error(
                        "moteur.js : erreur musique chapitre :",
                        erreur
                    );

                }

            }

        }

        /*
            Le chapitre peut modifier uniquement
            le volume de la musique déjà en cours.

            Exemple :

            "volumeMusique": 0.60

            sans propriété "musique".
        */

        else if (
            possedeVolumeMusique &&
            typeof audioManager
                .setVolumeMixMusique ===
                "function"
        ) {

            try {

                audioManager
                    .setVolumeMixMusique(
                        volumeMusique
                    );

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur mixage musique chapitre :",
                    erreur
                );

            }

        }


        /*=================================================
            AMBIANCE DU CHAPITRE
        =================================================*/

        const possedeAmbiance =
            Object.prototype
                .hasOwnProperty
                .call(
                    chapitre,
                    "ambiance"
                );


        const possedeVolumeAmbiance =
            Object.prototype
                .hasOwnProperty
                .call(
                    chapitre,
                    "volumeAmbiance"
                );


        const volumeAmbiance =
            this.normaliserVolumeAudio(

                possedeVolumeAmbiance

                    ? chapitre.volumeAmbiance

                    : this.volumeMixAmbianceParDefaut,

                this.volumeMixAmbianceParDefaut

            );


        const transitionAmbiance =
            this.normaliserDureeAudio(
                chapitre.transitionAmbiance,
                0
            );


        if (
            possedeAmbiance
        ) {

            /*-----------------------------------------
                ARRÊTER L'AMBIANCE
            -----------------------------------------*/

            if (
                this.audioEstDesactive(
                    chapitre.ambiance
                )
            ) {

                try {

                    if (
                        transitionAmbiance > 0 &&
                        typeof audioManager
                            .fadeOutAmbiance ===
                            "function"
                    ) {

                        audioManager
                            .fadeOutAmbiance(
                                transitionAmbiance
                            );

                    }
                    else if (
                        typeof audioManager
                            .arreterAmbiance ===
                            "function"
                    ) {

                        audioManager
                            .arreterAmbiance();

                    }

                }
                catch (
                    erreur
                ) {

                    console.error(
                        "moteur.js : erreur arrêt ambiance chapitre :",
                        erreur
                    );

                }

            }

            /*-----------------------------------------
                JOUER / CHANGER L'AMBIANCE
            -----------------------------------------*/

            else {

                try {

                    if (
                        transitionAmbiance > 0 &&
                        typeof audioManager
                            .changerAmbiance ===
                            "function"
                    ) {

                        audioManager
                            .changerAmbiance(
                                chapitre.ambiance,
                                transitionAmbiance,
                                volumeAmbiance
                            );

                    }
                    else if (
                        typeof audioManager
                            .jouerAmbiance ===
                            "function"
                    ) {

                        audioManager
                            .jouerAmbiance(
                                chapitre.ambiance,
                                volumeAmbiance
                            );

                    }

                }
                catch (
                    erreur
                ) {

                    console.error(
                        "moteur.js : erreur ambiance chapitre :",
                        erreur
                    );

                }

            }

        }

        /*
            Même principe que pour la musique :
            possibilité de modifier uniquement le mixage.
        */

        else if (
            possedeVolumeAmbiance &&
            typeof audioManager
                .setVolumeMixAmbiance ===
                "function"
        ) {

            try {

                audioManager
                    .setVolumeMixAmbiance(
                        volumeAmbiance
                    );

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur mixage ambiance chapitre :",
                    erreur
                );

            }

        }


        return true;

    },


    /*=====================================================
        GÉRER L'AUDIO D'UNE SCÈNE

        Une scène peut :

        - changer la musique ;
        - changer uniquement son volume ;
        - arrêter la musique ;
        - changer l'ambiance ;
        - changer uniquement son volume ;
        - arrêter l'ambiance ;
        - modifier le volume global des effets ;
        - jouer un effet sonore individuel.

        Exemple :

        {
            "musique": "tension",
            "volumeMusique": 0.80,
            "transitionMusique": 1200,

            "ambiance": "pluie_ruelle",
            "volumeAmbiance": 0.45,
            "transitionAmbiance": 700,

            "volumeEffets": 0.90,

            "son": "tonnerre",
            "volumeSon": 0.75
        }
    =====================================================*/

    gererAudioScene(
        scene
    ) {

        if (
            !scene ||
            typeof scene !==
                "object" ||
            typeof audioManager ===
                "undefined" ||
            audioManager ===
                null
        ) {

            return false;

        }


        /*=================================================
            VOLUME GLOBAL DES EFFETS DE LA SCÈNE

            Contrairement au volumeSon, cette valeur
            influence tous les effets sonores suivants.
        =================================================*/

        if (
            Object.prototype
                .hasOwnProperty
                .call(
                    scene,
                    "volumeEffets"
                )
        ) {

            const volumeEffets =
                this.normaliserVolumeAudio(
                    scene.volumeEffets,
                    this.volumeMixEffetsParDefaut
                );


            if (
                typeof audioManager
                    .setVolumeMixEffets ===
                    "function"
            ) {

                try {

                    audioManager
                        .setVolumeMixEffets(
                            volumeEffets
                        );

                }
                catch (
                    erreur
                ) {

                    console.error(
                        "moteur.js : erreur volume des effets scène :",
                        erreur
                    );

                }

            }

        }


        /*=================================================
            MUSIQUE
        =================================================*/

        const possedeMusique =
            Object.prototype
                .hasOwnProperty
                .call(
                    scene,
                    "musique"
                );


        const possedeVolumeMusique =
            Object.prototype
                .hasOwnProperty
                .call(
                    scene,
                    "volumeMusique"
                );


        /*
            Si la scène ne définit pas de nouveau
            volume, on conserve le mixage actuellement
            actif.

            Cela permet par exemple :

            scène A :
                musique tension + volume 0.40

            scène B :
                aucun réglage audio

            La musique continue à 0.40.
        */

        const volumeMusiqueActuel =
            typeof audioManager
                .volumeMixMusique ===
                "number"

                ? audioManager
                    .volumeMixMusique

                : this.volumeMixMusiqueParDefaut;


        const volumeMusique =
            this.normaliserVolumeAudio(

                possedeVolumeMusique

                    ? scene.volumeMusique

                    : volumeMusiqueActuel,

                volumeMusiqueActuel

            );


        const transitionMusique =
            this.normaliserDureeAudio(
                scene.transitionMusique,
                0
            );


        if (
            possedeMusique
        ) {

            /*-----------------------------------------
                ARRÊT MUSIQUE
            -----------------------------------------*/

            if (
                this.audioEstDesactive(
                    scene.musique
                )
            ) {

                try {

                    if (
                        transitionMusique > 0 &&
                        typeof audioManager
                            .fadeOut ===
                            "function"
                    ) {

                        audioManager
                            .fadeOut(
                                transitionMusique
                            );

                    }
                    else if (
                        typeof audioManager
                            .arreterMusique ===
                            "function"
                    ) {

                        audioManager
                            .arreterMusique();

                    }

                }
                catch (
                    erreur
                ) {

                    console.error(
                        "moteur.js : erreur arrêt musique scène :",
                        erreur
                    );

                }

            }

            /*-----------------------------------------
                NOUVELLE MUSIQUE
            -----------------------------------------*/

            else {

                try {

                    if (
                        transitionMusique > 0 &&
                        typeof audioManager
                            .changerMusique ===
                            "function"
                    ) {

                        audioManager
                            .changerMusique(
                                scene.musique,
                                transitionMusique,
                                volumeMusique
                            );

                    }
                    else if (
                        typeof audioManager
                            .jouerMusique ===
                            "function"
                    ) {

                        audioManager
                            .jouerMusique(
                                scene.musique,
                                volumeMusique
                            );

                    }

                }
                catch (
                    erreur
                ) {

                    console.error(
                        "moteur.js : erreur musique scène :",
                        erreur
                    );

                }

            }

        }

        /*---------------------------------------------
            MODIFIER UNIQUEMENT LE VOLUME MUSIQUE
        ---------------------------------------------*/

        else if (
            possedeVolumeMusique &&
            typeof audioManager
                .setVolumeMixMusique ===
                "function"
        ) {

            try {

                audioManager
                    .setVolumeMixMusique(
                        volumeMusique
                    );

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur mixage musique scène :",
                    erreur
                );

            }

        }


        /*=================================================
            AMBIANCE
        =================================================*/

        const possedeAmbiance =
            Object.prototype
                .hasOwnProperty
                .call(
                    scene,
                    "ambiance"
                );


        const possedeVolumeAmbiance =
            Object.prototype
                .hasOwnProperty
                .call(
                    scene,
                    "volumeAmbiance"
                );


        const volumeAmbianceActuel =
            typeof audioManager
                .volumeMixAmbiance ===
                "number"

                ? audioManager
                    .volumeMixAmbiance

                : this.volumeMixAmbianceParDefaut;


        const volumeAmbiance =
            this.normaliserVolumeAudio(

                possedeVolumeAmbiance

                    ? scene.volumeAmbiance

                    : volumeAmbianceActuel,

                volumeAmbianceActuel

            );


        const transitionAmbiance =
            this.normaliserDureeAudio(
                scene.transitionAmbiance,
                0
            );


        if (
            possedeAmbiance
        ) {

            /*-----------------------------------------
                ARRÊT AMBIANCE
            -----------------------------------------*/

            if (
                this.audioEstDesactive(
                    scene.ambiance
                )
            ) {

                try {

                    if (
                        transitionAmbiance > 0 &&
                        typeof audioManager
                            .fadeOutAmbiance ===
                            "function"
                    ) {

                        audioManager
                            .fadeOutAmbiance(
                                transitionAmbiance
                            );

                    }
                    else if (
                        typeof audioManager
                            .arreterAmbiance ===
                            "function"
                    ) {

                        audioManager
                            .arreterAmbiance();

                    }

                }
                catch (
                    erreur
                ) {

                    console.error(
                        "moteur.js : erreur arrêt ambiance scène :",
                        erreur
                    );

                }

            }

            /*-----------------------------------------
                NOUVELLE AMBIANCE
            -----------------------------------------*/

            else {

                try {

                    if (
                        transitionAmbiance > 0 &&
                        typeof audioManager
                            .changerAmbiance ===
                            "function"
                    ) {

                        audioManager
                            .changerAmbiance(
                                scene.ambiance,
                                transitionAmbiance,
                                volumeAmbiance
                            );

                    }
                    else if (
                        typeof audioManager
                            .jouerAmbiance ===
                            "function"
                    ) {

                        audioManager
                            .jouerAmbiance(
                                scene.ambiance,
                                volumeAmbiance
                            );

                    }

                }
                catch (
                    erreur
                ) {

                    console.error(
                        "moteur.js : erreur ambiance scène :",
                        erreur
                    );

                }

            }

        }

        /*---------------------------------------------
            MODIFIER UNIQUEMENT LE VOLUME AMBIANCE
        ---------------------------------------------*/

        else if (
            possedeVolumeAmbiance &&
            typeof audioManager
                .setVolumeMixAmbiance ===
                "function"
        ) {

            try {

                audioManager
                    .setVolumeMixAmbiance(
                        volumeAmbiance
                    );

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur mixage ambiance scène :",
                    erreur
                );

            }

        }


        /*=================================================
            EFFET SONORE UNIQUE DE LA SCÈNE

            volumeSon est un multiplicateur local.

            Exemple :

            volume utilisateur effets = 0.70
            volumeEffets scène        = 0.80
            volumeSon                 = 0.50

            résultat :

            0.70 × 0.80 × 0.50
            = 0.28
        =================================================*/

        if (
            Object.prototype
                .hasOwnProperty
                .call(
                    scene,
                    "son"
                ) &&
            !this.audioEstDesactive(
                scene.son
            ) &&
            typeof audioManager
                .jouerSon ===
                "function"
        ) {

            const volumeSon =
                this.normaliserVolumeAudio(

                    Object.prototype
                        .hasOwnProperty
                        .call(
                            scene,
                            "volumeSon"
                        )

                        ? scene.volumeSon

                        : 1,

                    1

                );


            try {

                audioManager
                    .jouerSon(
                        scene.son,
                        volumeSon
                    );

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur effet sonore scène :",
                    erreur
                );

            }

        }


        return true;

    },
        /*=====================================================
        ÉVALUER LES CONDITIONS D'UNE SCÈNE

        Exemple :

        "conditions": [
            {
                "si": {
                    "relationEva": {
                        "min": 5
                    }
                },
                "next": "sceneBonneRelation"
            },
            {
                "sinon": "sceneRelationFaible"
            }
        ]
    =====================================================*/

    evaluerConditionsScene(
        conditions
    ) {

        if (
            !Array.isArray(
                conditions
            ) ||
            conditions.length ===
                0
        ) {

            return null;

        }


        let destinationSinon =
            null;


        for (
            const condition
            of conditions
        ) {

            if (
                !condition ||
                typeof condition !==
                    "object"
            ) {

                continue;

            }


            /*-----------------------------------------
                SINON
            -----------------------------------------*/

            if (
                condition.sinon
            ) {

                destinationSinon =
                    condition.sinon;

                continue;

            }


            /*-----------------------------------------
                SI
            -----------------------------------------*/

            if (
                condition.si &&
                condition.next
            ) {

                const valide =
                    this.verifierObjetCondition(
                        condition.si
                    );


                if (
                    valide
                ) {

                    return condition.next;

                }

            }

        }


        return destinationSinon;

    },


    /*=====================================================
        VÉRIFIER UNE CONDITION AU FORMAT HISTORIQUE

        Exemple :

        "condition": {
            "variable": "rencontreZoe",
            "operateur": "===",
            "valeur": true
        }
    =====================================================*/

    verifierConditionClassique(
        condition
    ) {

        if (
            !condition ||
            typeof condition !==
                "object" ||
            !this.joueur
        ) {

            return false;

        }


        if (
            !Object.prototype
                .hasOwnProperty
                .call(
                    condition,
                    "variable"
                )
        ) {

            return false;

        }


        const variable =
            condition.variable;


        const valeurActuelle =
            this.joueur[
                variable
            ];


        const valeurAttendue =
            condition.valeur;


        const operateur =
            condition.operateur ||
            "==";


        switch (
            operateur
        ) {

            case ">":

                return (
                    valeurActuelle >
                    valeurAttendue
                );


            case ">=":

                return (
                    valeurActuelle >=
                    valeurAttendue
                );


            case "<":

                return (
                    valeurActuelle <
                    valeurAttendue
                );


            case "<=":

                return (
                    valeurActuelle <=
                    valeurAttendue
                );


            case "===":

                return (
                    valeurActuelle ===
                    valeurAttendue
                );


            case "!==":

                return (
                    valeurActuelle !==
                    valeurAttendue
                );


            case "!=":

                return (
                    valeurActuelle !=
                    valeurAttendue
                );


            case "==":

                return (
                    valeurActuelle ==
                    valeurAttendue
                );


            default:

                console.warn(
                    `moteur.js : opérateur de condition inconnu : "${operateur}".`
                );


                return (
                    valeurActuelle ==
                    valeurAttendue
                );

        }

    },


    /*=====================================================
        VÉRIFIER UN OBJET DE CONDITION

        Deux formats sont acceptés.

        FORMAT HISTORIQUE :

        {
            "variable": "relationEva",
            "operateur": ">=",
            "valeur": 5
        }

        FORMAT MODERNE SIMPLE :

        {
            "rencontreZoe": true
        }

        FORMAT MODERNE AVANCÉ :

        {
            "relationEva": {
                "min": 5
            },

            "confianceEva": {
                "max": 10
            }
        }

        Opérateurs modernes :

        min
        max
        egal
        different
    =====================================================*/

    verifierObjetCondition(
        condition
    ) {

        if (
            !condition ||
            typeof condition !==
                "object" ||
            !this.joueur
        ) {

            return false;

        }


        /*---------------------------------------------
            FORMAT HISTORIQUE
        ---------------------------------------------*/

        if (
            Object.prototype
                .hasOwnProperty
                .call(
                    condition,
                    "variable"
                )
        ) {

            return this
                .verifierConditionClassique(
                    condition
                );

        }


        /*---------------------------------------------
            FORMAT MODERNE
        ---------------------------------------------*/

        return Object
            .entries(
                condition
            )
            .every(
                ([
                    cle,
                    attendu
                ]) => {

                    const valeur =
                        this.joueur[
                            cle
                        ];


                    /*---------------------------------
                        VALEUR SIMPLE

                        {
                            "rencontreEva": true
                        }
                    ---------------------------------*/

                    if (
                        attendu ===
                            null ||
                        typeof attendu !==
                            "object" ||
                        Array.isArray(
                            attendu
                        )
                    ) {

                        return (
                            valeur ===
                            attendu
                        );

                    }


                    /*---------------------------------
                        MINIMUM
                    ---------------------------------*/

                    if (
                        Object.prototype
                            .hasOwnProperty
                            .call(
                                attendu,
                                "min"
                            ) &&
                        Number(
                            valeur
                        ) <
                        Number(
                            attendu.min
                        )
                    ) {

                        return false;

                    }


                    /*---------------------------------
                        MAXIMUM
                    ---------------------------------*/

                    if (
                        Object.prototype
                            .hasOwnProperty
                            .call(
                                attendu,
                                "max"
                            ) &&
                        Number(
                            valeur
                        ) >
                        Number(
                            attendu.max
                        )
                    ) {

                        return false;

                    }


                    /*---------------------------------
                        ÉGAL
                    ---------------------------------*/

                    if (
                        Object.prototype
                            .hasOwnProperty
                            .call(
                                attendu,
                                "egal"
                            ) &&
                        valeur !==
                            attendu.egal
                    ) {

                        return false;

                    }


                    /*---------------------------------
                        DIFFÉRENT
                    ---------------------------------*/

                    if (
                        Object.prototype
                            .hasOwnProperty
                            .call(
                                attendu,
                                "different"
                            ) &&
                        valeur ===
                            attendu.different
                    ) {

                        return false;

                    }


                    return true;

                }
            );

    },


    /*=====================================================
        FIN DE L'AFFICHAGE D'UNE SCÈNE
    =====================================================*/

    terminerAffichageScene(
        scene
    ) {

        if (
            !scene
        ) {

            return;

        }


        /*---------------------------------------------
            CHOIX
        ---------------------------------------------*/

        if (
            Array.isArray(
                scene.choix
            ) &&
            scene.choix.length >
                0
        ) {

            this.preparerChoix(
                scene.choix,
                scene
            );

            return;

        }


        /*---------------------------------------------
            SCÈNE / CHAPITRE SUIVANT
        ---------------------------------------------*/

        if (
            scene.next
        ) {

            this.gererDestination(
                scene.next
            );

            return;

        }


        /*---------------------------------------------
            FIN DE CHAPITRE
        ---------------------------------------------*/

        if (
            scene.finChapitre ===
                true ||
            scene.fin ===
                "chapitre"
        ) {

            this.terminerChapitre();

            return;

        }


        /*---------------------------------------------
            FIN DU JEU
        ---------------------------------------------*/

        if (
            scene.finJeu ===
                true ||
            scene.fin ===
                "jeu"
        ) {

            this.terminerJeu(
                scene
            );

            return;

        }


        /*---------------------------------------------
            SAUVEGARDE FINALE DE LA SCÈNE
        ---------------------------------------------*/

        this.sauvegarder();

    },


    /*=====================================================
        PRÉPARER LES CHOIX
    =====================================================*/

    preparerChoix(
        listeChoix,
        scene = null
    ) {

        if (
            !Array.isArray(
                listeChoix
            ) ||
            listeChoix.length ===
                0
        ) {

            return;

        }


        /*---------------------------------------------
            ANNULER UN ANCIEN TIMER DE CHOIX
        ---------------------------------------------*/

        this.annulerAttenteChoix();


        /*---------------------------------------------
            FILTRER LES CHOIX DISPONIBLES
        ---------------------------------------------*/

        const choixDisponibles =
            listeChoix
                .filter(
                    choix => {

                        return this
                            .choixEstDisponible(
                                choix
                            );

                    }
                );


        /*---------------------------------------------
            AUCUN CHOIX DISPONIBLE
        ---------------------------------------------*/

        if (
            choixDisponibles.length ===
                0
        ) {

            console.warn(
                "moteur.js : aucun choix disponible pour cette scène."
            );


            /*
                Si aucun choix n'est disponible mais
                que la scène possède un next,
                on continue automatiquement.

                gererDestination() accepte maintenant
                aussi bien une scène qu'un chapitre
                ou une destination objet.
            */

            if (
                scene?.next
            ) {

                this.gererDestination(
                    scene.next
                );

            }


            return;

        }


        /*---------------------------------------------
            DÉLAI AVANT AFFICHAGE
        ---------------------------------------------*/

        const delai =
            this.obtenirDelaiChoix(
                scene
            );


        if (
            delai >
            0
        ) {

            this.timerChoix =
                setTimeout(
                    () => {

                        this.timerChoix =
                            null;


                        this.afficherChoix(
                            choixDisponibles
                        );

                    },
                    delai
                );


            return;

        }


        this.afficherChoix(
            choixDisponibles
        );

    },


    /*=====================================================
        VÉRIFIER SI UN CHOIX EST DISPONIBLE
    =====================================================*/

    choixEstDisponible(
        choix
    ) {

        if (
            !choix ||
            typeof choix !==
                "object"
        ) {

            return false;

        }


        /*---------------------------------------------
            CHOIX DÉSACTIVÉ
        ---------------------------------------------*/

        if (
            choix.actif ===
                false
        ) {

            return false;

        }


        /*---------------------------------------------
            CHOIX VERROUILLÉ EXPLICITEMENT
        ---------------------------------------------*/

        if (
            choix.verrouille ===
                true
        ) {

            return false;

        }


        /*---------------------------------------------
            CONDITION
        ---------------------------------------------*/

        if (
            choix.condition &&
            typeof choix.condition ===
                "object"
        ) {

            if (
                !this.verifierObjetCondition(
                    choix.condition
                )
            ) {

                return false;

            }

        }


        /*---------------------------------------------
            CONDITION "SI"
        ---------------------------------------------*/

        if (
            choix.si &&
            typeof choix.si ===
                "object"
        ) {

            if (
                !this.verifierObjetCondition(
                    choix.si
                )
            ) {

                return false;

            }

        }


        return true;

    },


    /*=====================================================
        OBTENIR LE DÉLAI AVANT LES CHOIX

        Compatibilité avec :

        delaiChoix
        choixDelai
        delayChoix
    =====================================================*/

    obtenirDelaiChoix(
        scene
    ) {

        if (
            !scene ||
            typeof scene !==
                "object"
        ) {

            return 0;

        }


        const valeurs = [

            scene.delaiChoix,

            scene.choixDelai,

            scene.delayChoix

        ];


        for (
            const valeur
            of valeurs
        ) {

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
        AFFICHER LES CHOIX
    =====================================================*/

    afficherChoix(
        listeChoix
    ) {

        if (
            typeof choixManager ===
                "undefined" ||
            choixManager ===
                null ||
            typeof choixManager
                .afficher !==
                "function"
        ) {

            console.error(
                "moteur.js : choixManager est introuvable."
            );

            return;

        }


        const choixPourInterface =
            listeChoix
                .map(
                    choix => {

                        return {

                            ...choix,

                            action:
                                () => {

                                    this.traiterChoix(
                                        choix
                                    );

                                }

                        };

                    }
                );


        try {

            choixManager
                .afficher(
                    choixPourInterface
                );

        }
        catch (
            erreur
        ) {

            console.error(
                "moteur.js : erreur pendant l'affichage des choix :",
                erreur
            );

        }

    },


    /*=====================================================
        TRAITER UN CHOIX
    =====================================================*/

    async traiterChoix(
        choix
    ) {

        if (
            !choix ||
            typeof choix !==
                "object"
        ) {

            return false;

        }


        /*---------------------------------------------
            VÉRIFICATION FINALE DE DISPONIBILITÉ

            La condition est revérifiée au moment du
            clic afin qu'un choix devenu invalide entre
            son affichage et son activation ne soit pas
            exécuté.
        ---------------------------------------------*/

        if (
            !this.choixEstDisponible(
                choix
            )
        ) {

            return false;

        }


        /*---------------------------------------------
            FERMER LA POPUP
        ---------------------------------------------*/

        if (
            typeof choixManager !==
                "undefined" &&
            choixManager !==
                null &&
            typeof choixManager
                .fermerPopup ===
                "function"
        ) {

            try {

                choixManager
                    .fermerPopup();

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur fermeture popup choix :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
            MESSAGE DU JOUEUR ASSOCIÉ AU CHOIX
        ---------------------------------------------*/

        if (
            choix.message
        ) {

            await this
                .afficherMessageChoix(
                    choix.message
                );

        }


        /*---------------------------------------------
            GALERIE DU CHOIX
        ---------------------------------------------*/

        this.gererGalerieElement(
            choix
        );


        /*---------------------------------------------
            EFFET UNIQUE DU CHOIX

            Format historique :

            "effet": {
                "relationEva": 1
            }
        ---------------------------------------------*/

        if (
            choix.effet &&
            typeof choix.effet ===
                "object" &&
            !Array.isArray(
                choix.effet
            )
        ) {

            this.appliquerEffets(
                choix.effet
            );

        }


        /*---------------------------------------------
            PLUSIEURS EFFETS

            Nouveau format également accepté :

            "effets": [
                {
                    "relationEva": 1
                },
                {
                    "confianceEva": 2
                },
                {
                    "aDefenduEva": true
                }
            ]
        ---------------------------------------------*/

        if (
            Array.isArray(
                choix.effets
            )
        ) {

            choix.effets.forEach(
                effet => {

                    if (
                        effet &&
                        typeof effet ===
                            "object" &&
                        !Array.isArray(
                            effet
                        )
                    ) {

                        this.appliquerEffets(
                            effet
                        );

                    }

                }
            );

        }


        /*---------------------------------------------
            SUCCÈS
        ---------------------------------------------*/

        this.verifierSucces();


        /*---------------------------------------------
            SAUVEGARDE IMMÉDIATE APRÈS LE CHOIX

            C'est important :
            les conséquences du choix sont enregistrées
            avant le chargement de la prochaine scène.
        ---------------------------------------------*/

        this.sauvegarder();


        /*---------------------------------------------
            POURSUITE
        ---------------------------------------------*/

        await this
            .poursuivreApresChoix(
                choix
            );


        return true;

    },


    /*=====================================================
        AFFICHER LE MESSAGE ASSOCIÉ AU CHOIX
    =====================================================*/

    async afficherMessageChoix(
        message
    ) {

        if (
            !message
        ) {

            return null;

        }


        /*---------------------------------------------
            CHAÎNE SIMPLE

            Exemple :

            "message": "Je vais venir avec toi."
        ---------------------------------------------*/

        if (
            typeof message ===
                "string"
        ) {

            if (
                typeof dialogueManager !==
                    "undefined" &&
                dialogueManager !==
                    null &&
                typeof dialogueManager
                    .ajouterMessage ===
                    "function"
            ) {

                return dialogueManager
                    .ajouterMessage(
                        message,
                        "joueur",
                        {}
                    );

            }


            return null;

        }


        if (
            typeof message !==
                "object"
        ) {

            return null;

        }


        /*---------------------------------------------
            GALERIE DU MESSAGE

            dialogueManager gère normalement le
            déblocage lorsqu'il affiche réellement
            le message.

            Ce secours ne s'exécute que si le
            dialogueManager est absent.
        ---------------------------------------------*/

        if (
            typeof dialogueManager ===
                "undefined" ||
            dialogueManager ===
                null
        ) {

            this.gererGalerieElement(
                message
            );

        }


        /*---------------------------------------------
            FOND DU MESSAGE
        ---------------------------------------------*/

        this.gererFondDialogue(
            message
        );


        /*---------------------------------------------
            API MODERNE
        ---------------------------------------------*/

        if (
            typeof dialogueManager !==
                "undefined" &&
            dialogueManager !==
                null &&
            typeof dialogueManager
                .afficher ===
                "function"
        ) {

            try {

                return await dialogueManager
                    .afficher(
                        {

                            personnage:
                                message.personnage ||
                                "joueur",

                            ...message

                        },

                        this.joueur
                    );

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur pendant l'affichage du message de choix :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
            API DE SECOURS
        ---------------------------------------------*/

        if (
            typeof dialogueManager !==
                "undefined" &&
            dialogueManager !==
                null &&
            typeof dialogueManager
                .ajouterMessage ===
                "function"
        ) {

            const texte =
                message.texte ||
                "";


            if (
                texte
            ) {

                return dialogueManager
                    .ajouterMessage(
                        texte,
                        message.personnage ||
                            "joueur",
                        message
                    );

            }

        }


        return null;

    },


    /*=====================================================
        POURSUIVRE APRÈS UN CHOIX
    =====================================================*/

    async poursuivreApresChoix(
        choix
    ) {

        if (
            !choix
        ) {

            return;

        }


        /*---------------------------------------------
            CONDITIONS DE REDIRECTION

            Exemple :

            "conditions": [
                {
                    "si": {
                        "relationEva": {
                            "min": 8
                        }
                    },
                    "next": "evaSeConfie"
                },
                {
                    "sinon": "evaResteDistante"
                }
            ]
        ---------------------------------------------*/

        if (
            Array.isArray(
                choix.conditions
            ) &&
            choix.conditions.length >
                0
        ) {

            const destination =
                this.evaluerConditionsScene(
                    choix.conditions
                );


            if (
                destination
            ) {

                await this.gererDestination(
                    destination
                );


                return;

            }

        }


        /*---------------------------------------------
            NEXT
        ---------------------------------------------*/

        if (
            choix.next
        ) {

            await this.gererDestination(
                choix.next
            );


            return;

        }


        /*---------------------------------------------
            FIN DE CHAPITRE
        ---------------------------------------------*/

        if (
            choix.finChapitre ===
                true ||
            choix.fin ===
                "chapitre"
        ) {

            this.terminerChapitre();

            return;

        }


        /*---------------------------------------------
            FIN DU JEU
        ---------------------------------------------*/

        if (
            choix.finJeu ===
                true ||
            choix.fin ===
                "jeu"
        ) {

            this.terminerJeu(
                choix
            );

            return;

        }

    },


    /*=====================================================
        APPLIQUER LES EFFETS

        Deux systèmes sont conservés :

        1. conditionsManager.appliquerEffet()
           s'il est disponible ;

        2. système interne de secours.

        Formats internes acceptés :

        "relationEva": 2

            ajoute 2

        "relationEva": {
            "ajouter": 2
        }

        "relationEva": {
            "retirer": 1
        }

        "relationEva": {
            "definir": 10
        }

        "rencontreEva": true

        "brancheChapitre6": "solo"
    =====================================================*/

    appliquerEffets(
        effets
    ) {

        if (
            !effets ||
            typeof effets !==
                "object" ||
            Array.isArray(
                effets
            ) ||
            !this.joueur
        ) {

            return false;

        }


        /*---------------------------------------------
            GESTIONNAIRE EXTERNE SI DISPONIBLE
        ---------------------------------------------*/

        if (
            typeof conditionsManager !==
                "undefined" &&
            conditionsManager !==
                null &&
            typeof conditionsManager
                .appliquerEffet ===
                "function"
        ) {

            try {

                conditionsManager
                    .appliquerEffet(
                        effets,
                        this.joueur
                    );


                /*
                    Une modification de variable peut
                    immédiatement débloquer un succès.
                */

                this.verifierSucces();


                return true;

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur conditionsManager.appliquerEffet() :",
                    erreur
                );


                /*
                    On continue volontairement vers
                    le système interne de secours.
                */

            }

        }


        /*---------------------------------------------
            APPLICATION INTERNE
        ---------------------------------------------*/

        for (
            const [
                variable,
                modification
            ]
            of Object.entries(
                effets
            )
        ) {

            /*-----------------------------------------
                NOMBRE = MODIFICATION RELATIVE

                Exemple :

                "relationEva": 2

                ajoute +2 à la valeur actuelle.
            -----------------------------------------*/

            if (
                typeof modification ===
                    "number"
            ) {

                const ancienneValeur =
                    Number(
                        this.joueur[
                            variable
                        ]
                    );


                this.joueur[
                    variable
                ] =
                    (
                        Number.isFinite(
                            ancienneValeur
                        )
                            ? ancienneValeur
                            : 0
                    ) +
                    modification;


                continue;

            }


            /*-----------------------------------------
                OBJET SPÉCIAL
            -----------------------------------------*/

            if (
                modification &&
                typeof modification ===
                    "object" &&
                !Array.isArray(
                    modification
                )
            ) {

                /*-------------------------------------
                    AJOUTER
                -------------------------------------*/

                if (
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            modification,
                            "ajouter"
                        )
                ) {

                    const ancienneValeur =
                        Number(
                            this.joueur[
                                variable
                            ]
                        );


                    const ajout =
                        Number(
                            modification.ajouter
                        );


                    this.joueur[
                        variable
                    ] =
                        (
                            Number.isFinite(
                                ancienneValeur
                            )
                                ? ancienneValeur
                                : 0
                        ) +
                        (
                            Number.isFinite(
                                ajout
                            )
                                ? ajout
                                : 0
                        );


                    continue;

                }


                /*-------------------------------------
                    RETIRER
                -------------------------------------*/

                if (
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            modification,
                            "retirer"
                        )
                ) {

                    const ancienneValeur =
                        Number(
                            this.joueur[
                                variable
                            ]
                        );


                    const retrait =
                        Number(
                            modification.retirer
                        );


                    this.joueur[
                        variable
                    ] =
                        (
                            Number.isFinite(
                                ancienneValeur
                            )
                                ? ancienneValeur
                                : 0
                        ) -
                        (
                            Number.isFinite(
                                retrait
                            )
                                ? retrait
                                : 0
                        );


                    continue;

                }


                /*-------------------------------------
                    DÉFINIR
                -------------------------------------*/

                if (
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            modification,
                            "definir"
                        )
                ) {

                    this.joueur[
                        variable
                    ] =
                        modification.definir;


                    continue;

                }

            }


            /*-----------------------------------------
                BOOLÉEN / CHAÎNE / NULL / TABLEAU

                Exemples :

                "numeroEva": true

                "brancheChapitre6": "solo"

                "indicesTrouves": [
                    "telephone",
                    "camera"
                ]
            -----------------------------------------*/

            this.joueur[
                variable
            ] =
                modification;

        }


        /*
            Vérification centralisée des succès après
            l'application de tous les effets.

            traiterChoix() et chargerScene() effectuent
            également une vérification pour préserver
            le fonctionnement existant.

            succesManager doit donc rester idempotent :
            un succès déjà débloqué ne doit pas être
            créé une deuxième fois.
        */

        this.verifierSucces();


        return true;

    },
        /*=====================================================
        ANNULER L'ATTENTE DES CHOIX
    =====================================================*/

    annulerAttenteChoix() {

        if (
            this.timerChoix !==
                null
        ) {

            clearTimeout(
                this.timerChoix
            );


            this.timerChoix =
                null;

        }


        if (
            this.boutonChoix
        ) {

            try {

                this.boutonChoix
                    .remove();

            }
            catch (
                erreur
            ) {

                /*
                    Le bouton a peut-être déjà été retiré.
                */

            }


            this.boutonChoix =
                null;

        }

    },


    /*=====================================================
        OBTENIR LA DURÉE DE TRANSITION D'UN FOND

        Plusieurs noms historiques sont conservés :

        transitionFond
        dureeFond
        fondDuree
        delaiFond
    =====================================================*/

    obtenirDureeTransitionFond(
        element
    ) {

        if (
            !element ||
            typeof element !==
                "object"
        ) {

            return this
                .dureeTransitionFondParDefaut;

        }


        const valeurs = [

            element.transitionFond,

            element.dureeFond,

            element.fondDuree,

            element.delaiFond

        ];


        for (
            const valeur
            of valeurs
        ) {

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
            .dureeTransitionFondParDefaut;

    },


    /*=====================================================
        NORMALISER UN NOM DE FOND
    =====================================================*/

    normaliserNomFond(
        fond
    ) {

        if (
            fond ===
                null ||
            fond ===
                undefined
        ) {

            return "";

        }


        return String(
            fond
        )
            .trim();

    },


    /*=====================================================
        VÉRIFIER SI LE FOND POSSÈDE UNE EXTENSION
    =====================================================*/

    fondPossedeExtension(
        fond
    ) {

        if (
            !fond
        ) {

            return false;

        }


        return /\.(png|jpe?g|webp|gif|avif)$/i
            .test(
                String(
                    fond
                )
            );

    },


    /*=====================================================
        VÉRIFIER SI LE FOND EST DÉJÀ UN CHEMIN COMPLET

        Exemples acceptés :

        images/fonds/chambre.jpg
        ./images/fonds/chambre.jpg
        ../images/fonds/chambre.jpg
        /images/fonds/chambre.jpg
        https://...
    =====================================================*/

    fondEstCheminComplet(
        fond
    ) {

        if (
            !fond
        ) {

            return false;

        }


        const valeur =
            String(
                fond
            )
                .trim();


        return (

            valeur.startsWith(
                "http://"
            ) ||

            valeur.startsWith(
                "https://"
            ) ||

            valeur.startsWith(
                "/"
            ) ||

            valeur.startsWith(
                "./"
            ) ||

            valeur.startsWith(
                "../"
            ) ||

            valeur.includes(
                "/"
            )

        );

    },


    /*=====================================================
        CONSTRUIRE LE CHEMIN D'UN FOND

        Exemples :

        "chambre"
            ->
        images/fonds/chambre.jpg

        "chambre.png"
            ->
        images/fonds/chambre.png

        "images/fonds/chambre.png"
            ->
        images/fonds/chambre.png
    =====================================================*/

    construireCheminFond(
        fond
    ) {

        const nomFond =
            this.normaliserNomFond(
                fond
            );


        if (
            !nomFond
        ) {

            return "";

        }


        /*---------------------------------------------
            CHEMIN DÉJÀ COMPLET
        ---------------------------------------------*/

        if (
            this.fondEstCheminComplet(
                nomFond
            )
        ) {

            return nomFond;

        }


        /*---------------------------------------------
            NOM AVEC EXTENSION
        ---------------------------------------------*/

        if (
            this.fondPossedeExtension(
                nomFond
            )
        ) {

            return (
                this.cheminFonds +
                nomFond
            );

        }


        /*---------------------------------------------
            NOM SIMPLE
        ---------------------------------------------*/

        return (
            this.cheminFonds +
            nomFond +
            "." +
            this.extensionFondParDefaut
        );

    },


    /*=====================================================
        OBTENIR LES OPTIONS VISUELLES DU FOND

        Deux syntaxes restent compatibles.

        FORMAT DIRECT :

        {
            "fond": "chambre",
            "positionFond": "center top",
            "tailleFond": "cover",
            "opaciteFond": 0.9
        }

        FORMAT REGROUPÉ :

        {
            "fond": "chambre",

            "optionsFond": {
                "position": "center top",
                "taille": "cover",
                "repetition": "no-repeat",
                "filtre": "",
                "opacite": 0.9
            }
        }
    =====================================================*/

    obtenirOptionsFond(
        source = null
    ) {

        if (
            !source ||
            typeof source !==
                "object"
        ) {

            return {

                position:
                    "center",

                taille:
                    "cover",

                repetition:
                    "no-repeat",

                filtre:
                    "",

                opacite:
                    1

            };

        }


        const options =
            source.optionsFond &&
            typeof source.optionsFond ===
                "object"

                ? source.optionsFond

                : {};


        return {

            position:

                options.position ||

                source.positionFond ||

                "center",


            taille:

                options.taille ||

                options.size ||

                source.tailleFond ||

                source.fondTaille ||

                "cover",


            repetition:

                options.repetition ||

                source.repetitionFond ||

                "no-repeat",


            filtre:

                options.filtre ||

                source.filtreFond ||

                "",


            opacite:

                Number.isFinite(
                    Number(
                        options.opacite
                    )
                )

                    ? Math.max(
                        0,
                        Math.min(
                            1,
                            Number(
                                options.opacite
                            )
                        )
                    )

                    : Number.isFinite(
                        Number(
                            source.opaciteFond
                        )
                    )

                        ? Math.max(
                            0,
                            Math.min(
                                1,
                                Number(
                                    source.opaciteFond
                                )
                            )
                        )

                        : 1

        };

    },


    /*=====================================================
        APPLIQUER LES OPTIONS VISUELLES DU FOND
    =====================================================*/

    appliquerOptionsFond(
        elementFond,
        source = null
    ) {

        if (
            !elementFond
        ) {

            return;

        }


        const options =
            this.obtenirOptionsFond(
                source
            );


        elementFond
            .style
            .backgroundPosition =
            options.position;


        elementFond
            .style
            .backgroundSize =
            options.taille;


        elementFond
            .style
            .backgroundRepeat =
            options.repetition;


        elementFond
            .style
            .filter =
            options.filtre;


        /*
            L'opacité du fond lui-même est distincte
            de l'opacité temporaire utilisée pendant
            l'animation de transition.

            On conserve donc la valeur cible dans
            dataset.opaciteCible.
        */

        elementFond.dataset
            .opaciteCible =
            String(
                options.opacite
            );

    },


    /*=====================================================
        OBTENIR L'OPACITÉ CIBLE DU FOND
    =====================================================*/

    obtenirOpaciteFond(
        elementFond
    ) {

        if (
            !elementFond
        ) {

            return 1;

        }


        const valeur =
            Number(
                elementFond.dataset
                    .opaciteCible
            );


        if (
            !Number.isFinite(
                valeur
            )
        ) {

            return 1;

        }


        return Math.max(
            0,
            Math.min(
                1,
                valeur
            )
        );

    },


    /*=====================================================
        PRÉCHARGER UNE IMAGE DE FOND

        Le fond n'est remplacé qu'une fois l'image
        réellement chargée.

        Cela évite autant que possible un écran vide
        pendant les transitions.
    =====================================================*/

    prechargerFond(
        chemin
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                if (
                    !chemin
                ) {

                    reject(
                        new Error(
                            "Chemin de fond vide."
                        )
                    );

                    return;

                }


                const image =
                    new Image();


                image.onload =
                    () => {

                        resolve(
                            chemin
                        );

                    };


                image.onerror =
                    () => {

                        reject(
                            new Error(
                                `Impossible de charger le fond : ${chemin}`
                            )
                        );

                    };


                image.src =
                    chemin;

            }
        );

    },


    /*=====================================================
        CHANGER LE FOND
    =====================================================*/

    changerFond(
        fond,
        duree = null,
        source = null
    ) {

        const nomFond =
            this.normaliserNomFond(
                fond
            );


        if (
            !nomFond
        ) {

            return false;

        }


        const elementFond =
            document.getElementById(
                "fond-jeu"
            );


        if (
            !elementFond
        ) {

            console.warn(
                "moteur.js : #fond-jeu est introuvable."
            );

            return false;

        }


        /*---------------------------------------------
            APPLIQUER LES OPTIONS
        ---------------------------------------------*/

        this.appliquerOptionsFond(
            elementFond,
            source
        );


        const opaciteCible =
            this.obtenirOpaciteFond(
                elementFond
            );


        /*---------------------------------------------
            MÊME FOND

            L'image ne redémarre pas de transition,
            mais les options peuvent quand même changer.
        ---------------------------------------------*/

        if (
            nomFond ===
                this.fondActuel
        ) {

            elementFond
                .style
                .opacity =
                String(
                    opaciteCible
                );


            return true;

        }


        /*---------------------------------------------
            ANNULER L'ANCIENNE TRANSITION
        ---------------------------------------------*/

        this.annulerTransitionFond();


        /*---------------------------------------------
            DURÉE
        ---------------------------------------------*/

        let dureeTransition =
            Number(
                duree
            );


        if (
            !Number.isFinite(
                dureeTransition
            ) ||
            dureeTransition <
                0
        ) {

            dureeTransition =
                this
                    .dureeTransitionFondParDefaut;

        }


        /*---------------------------------------------
            CONSTRUIRE LE CHEMIN
        ---------------------------------------------*/

        const chemin =
            this.construireCheminFond(
                nomFond
            );


        if (
            !chemin
        ) {

            return false;

        }


        this.changementFondEnCours =
            true;


        /*---------------------------------------------
            CHANGEMENT IMMÉDIAT
        ---------------------------------------------*/

        if (
            dureeTransition ===
                0
        ) {

            elementFond
                .style
                .transition =
                "none";


            elementFond
                .style
                .backgroundImage =
                `url("${chemin}")`;


            this.appliquerOptionsFond(
                elementFond,
                source
            );


            elementFond
                .style
                .opacity =
                String(
                    this.obtenirOpaciteFond(
                        elementFond
                    )
                );


            elementFond
                .classList
                .remove(
                    "changement-fond"
                );


            elementFond
                .classList
                .add(
                    "fond-charge"
                );


            /*
                Force le navigateur à appliquer l'état
                immédiat avant de remettre la transition CSS.
            */

            void elementFond
                .offsetWidth;


            elementFond
                .style
                .transition =
                "";


            this.fondActuel =
                nomFond;


            this.changementFondEnCours =
                false;


            return true;

        }


        /*---------------------------------------------
            PRÉCHARGEMENT
        ---------------------------------------------*/

        this.prechargerFond(
            chemin
        )
            .then(
                () => {

                    /*
                        Une nouvelle transition a peut-être
                        été demandée pendant le chargement.
                    */

                    if (
                        !this.changementFondEnCours
                    ) {

                        return;

                    }


                    /*---------------------------------
                        FONDU DE SORTIE
                    ---------------------------------*/

                    elementFond
                        .style
                        .transition =
                        `opacity ${dureeTransition}ms ease`;


                    elementFond
                        .classList
                        .add(
                            "changement-fond"
                        );


                    elementFond
                        .classList
                        .remove(
                            "fond-charge"
                        );


                    elementFond
                        .style
                        .opacity =
                        "0";


                    /*---------------------------------
                        CHANGEMENT D'IMAGE
                    ---------------------------------*/

                    this.timerFond =
                        setTimeout(
                            () => {

                                elementFond
                                    .style
                                    .backgroundImage =
                                    `url("${chemin}")`;


                                this.appliquerOptionsFond(
                                    elementFond,
                                    source
                                );


                                this.fondActuel =
                                    nomFond;


                                elementFond
                                    .classList
                                    .remove(
                                        "changement-fond"
                                    );


                                /*---------------------
                                    FONDU D'ENTRÉE
                                ---------------------*/

                                requestAnimationFrame(
                                    () => {

                                        elementFond
                                            .style
                                            .opacity =
                                            String(
                                                this.obtenirOpaciteFond(
                                                    elementFond
                                                )
                                            );


                                        elementFond
                                            .classList
                                            .add(
                                                "fond-charge"
                                            );


                                        this.timerFond =
                                            setTimeout(
                                                () => {

                                                    this.timerFond =
                                                        null;


                                                    this.changementFondEnCours =
                                                        false;


                                                    elementFond
                                                        .style
                                                        .transition =
                                                        "";

                                                },
                                                dureeTransition
                                            );

                                    }
                                );

                            },
                            dureeTransition
                        );

                }
            )
            .catch(
                erreur => {

                    console.error(
                        "moteur.js : erreur pendant le préchargement du fond :",
                        erreur
                    );


                    /*---------------------------------
                        SOLUTION DE SECOURS

                        Même si le préchargement signale
                        une erreur, on laisse le navigateur
                        essayer directement l'URL.
                    ---------------------------------*/

                    elementFond
                        .style
                        .backgroundImage =
                        `url("${chemin}")`;


                    this.appliquerOptionsFond(
                        elementFond,
                        source
                    );


                    elementFond
                        .style
                        .opacity =
                        String(
                            this.obtenirOpaciteFond(
                                elementFond
                            )
                        );


                    elementFond
                        .classList
                        .remove(
                            "changement-fond"
                        );


                    elementFond
                        .classList
                        .add(
                            "fond-charge"
                        );


                    elementFond
                        .style
                        .transition =
                        "";


                    this.fondActuel =
                        nomFond;


                    this.changementFondEnCours =
                        false;


                    this.timerFond =
                        null;

                }
            );


        return true;

    },


    /*=====================================================
        APPLIQUER UN FOND IMMÉDIATEMENT

        Utilisé notamment lors du chargement
        d'une sauvegarde.
    =====================================================*/

    appliquerFondImmediat(
        fond,
        source = null
    ) {

        const nomFond =
            this.normaliserNomFond(
                fond
            );


        if (
            !nomFond
        ) {

            return false;

        }


        const elementFond =
            document.getElementById(
                "fond-jeu"
            );


        if (
            !elementFond
        ) {

            return false;

        }


        this.annulerTransitionFond();


        const chemin =
            this.construireCheminFond(
                nomFond
            );


        if (
            !chemin
        ) {

            return false;

        }


        elementFond
            .style
            .transition =
            "none";


        elementFond
            .style
            .backgroundImage =
            `url("${chemin}")`;


        this.appliquerOptionsFond(
            elementFond,
            source
        );


        elementFond
            .style
            .opacity =
            String(
                this.obtenirOpaciteFond(
                    elementFond
                )
            );


        elementFond
            .classList
            .remove(
                "changement-fond"
            );


        elementFond
            .classList
            .add(
                "fond-charge"
            );


        void elementFond
            .offsetWidth;


        elementFond
            .style
            .transition =
            "";


        this.fondActuel =
            nomFond;


        this.changementFondEnCours =
            false;


        return true;

    },


    /*=====================================================
        RETIRER LE FOND
    =====================================================*/

    retirerFond(
        duree = 300
    ) {

        const elementFond =
            document.getElementById(
                "fond-jeu"
            );


        if (
            !elementFond
        ) {

            this.fondActuel =
                "";

            return false;

        }


        this.annulerTransitionFond();


        let dureeTransition =
            Number(
                duree
            );


        if (
            !Number.isFinite(
                dureeTransition
            ) ||
            dureeTransition <
                0
        ) {

            dureeTransition =
                300;

        }


        /*---------------------------------------------
            FONCTION DE NETTOYAGE

            Centralise l'état final du fond.
        ---------------------------------------------*/

        const nettoyerFond =
            () => {

                elementFond
                    .style
                    .backgroundImage =
                    "none";


                elementFond
                    .style
                    .opacity =
                    "1";


                elementFond
                    .style
                    .filter =
                    "";


                elementFond
                    .style
                    .backgroundPosition =
                    "center";


                elementFond
                    .style
                    .backgroundSize =
                    "cover";


                elementFond
                    .style
                    .backgroundRepeat =
                    "no-repeat";


                elementFond
                    .classList
                    .remove(
                        "changement-fond",
                        "fond-charge"
                    );


                elementFond.dataset
                    .opaciteCible =
                    "1";


                this.fondActuel =
                    "";


                this.changementFondEnCours =
                    false;

            };


        /*---------------------------------------------
            SUPPRESSION IMMÉDIATE
        ---------------------------------------------*/

        if (
            dureeTransition ===
                0
        ) {

            nettoyerFond();


            elementFond
                .style
                .transition =
                "";


            return true;

        }


        /*---------------------------------------------
            FONDU
        ---------------------------------------------*/

        this.changementFondEnCours =
            true;


        elementFond
            .style
            .transition =
            `opacity ${dureeTransition}ms ease`;


        elementFond
            .style
            .opacity =
            "0";


        elementFond
            .classList
            .add(
                "changement-fond"
            );


        this.timerFond =
            setTimeout(
                () => {

                    nettoyerFond();


                    elementFond
                        .style
                        .transition =
                        "";


                    this.timerFond =
                        null;

                },
                dureeTransition
            );


        return true;

    },


    /*=====================================================
        ANNULER UNE TRANSITION DE FOND
    =====================================================*/

    annulerTransitionFond() {

        if (
            this.timerFond !==
                null
        ) {

            clearTimeout(
                this.timerFond
            );


            this.timerFond =
                null;

        }


        this.changementFondEnCours =
            false;


        const elementFond =
            document.getElementById(
                "fond-jeu"
            );


        if (
            elementFond
        ) {

            elementFond
                .classList
                .remove(
                    "changement-fond"
                );


            elementFond
                .style
                .transition =
                "";

        }

    },


    /*=====================================================
        OBTENIR LE FOND ACTUEL
    =====================================================*/

    obtenirFondActuel() {

        return this.fondActuel ||
            "";

    },


    /*=====================================================
        VÉRIFIER SI UN FOND EST ACTIF
    =====================================================*/

    fondActif() {

        return Boolean(
            this.fondActuel
        );

    },
        /*=====================================================
        TERMINER LE CHAPITRE ACTUEL
    =====================================================*/

    terminerChapitre() {

        if (
            this.transitionChapitreEnCours
        ) {

            return;

        }


        this.transitionChapitreEnCours =
            true;


        /*---------------------------------------------
            ANNULER LES ÉTATS TEMPORAIRES
        ---------------------------------------------*/

        this.annulerAttenteChoix();

        this.annulerTransitionFond();


        /*---------------------------------------------
            SAUVEGARDE AVANT TRANSITION
        ---------------------------------------------*/

        this.sauvegarder();


        /*---------------------------------------------
            CHAPITRE SUIVANT
        ---------------------------------------------*/

        const indexSuivant =
            this.chapitreActuel +
            1;


        const chapitreSuivant =
            chapitresManager
                .obtenir(
                    indexSuivant
                );


        /*---------------------------------------------
            PLUS AUCUN CHAPITRE
        ---------------------------------------------*/

        if (
            !chapitreSuivant
        ) {

            this.transitionChapitreEnCours =
                false;


            this.terminerJeu(
                {
                    raison:
                        "finChapitres"
                }
            );


            return;

        }


        /*---------------------------------------------
            LANCER LE CHAPITRE SUIVANT
        ---------------------------------------------*/

        const lancerChapitreSuivant =
            () => {

                this.transitionChapitreEnCours =
                    false;


                this.chargerChapitre(
                    indexSuivant,
                    chapitreSuivant.debut
                );

            };


        /*---------------------------------------------
            TRANSITION VISUELLE
        ---------------------------------------------*/

        if (
            typeof animationManager !==
                "undefined" &&
            animationManager !==
                null &&
            typeof animationManager
                .transitionVersNoir ===
                "function"
        ) {

            try {

                animationManager
                    .transitionVersNoir(
                        lancerChapitreSuivant
                    );


                return;

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur pendant la transition de chapitre :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
            SECOURS
        ---------------------------------------------*/

        lancerChapitreSuivant();

    },


    /*=====================================================
        TERMINER UNE SCÈNE AVEC EFFETS

        Utile pour une scène terminale qui possède :

        - galerie ;
        - effet ;
        - effets ;
        - succès ;
        - next ;
        - finChapitre ;
        - finJeu.
    =====================================================*/

    terminerSceneAvecEffets(
        scene
    ) {

        if (
            !scene ||
            typeof scene !==
                "object"
        ) {

            return;

        }


        /*---------------------------------------------
            GALERIE
        ---------------------------------------------*/

        this.gererGalerieElement(
            scene
        );


        /*---------------------------------------------
            EFFET UNIQUE
        ---------------------------------------------*/

        if (
            scene.effet &&
            typeof scene.effet ===
                "object" &&
            !Array.isArray(
                scene.effet
            )
        ) {

            this.appliquerEffets(
                scene.effet
            );

        }


        /*---------------------------------------------
            PLUSIEURS EFFETS
        ---------------------------------------------*/

        if (
            Array.isArray(
                scene.effets
            )
        ) {

            scene.effets.forEach(
                effet => {

                    if (
                        effet &&
                        typeof effet ===
                            "object" &&
                        !Array.isArray(
                            effet
                        )
                    ) {

                        this.appliquerEffets(
                            effet
                        );

                    }

                }
            );

        }


        /*---------------------------------------------
            SUCCÈS
        ---------------------------------------------*/

        this.verifierSucces();


        /*---------------------------------------------
            SAUVEGARDE
        ---------------------------------------------*/

        this.sauvegarder();


        /*---------------------------------------------
            FIN DU JEU
        ---------------------------------------------*/

        if (
            scene.finJeu ===
                true ||
            scene.fin ===
                "jeu"
        ) {

            this.terminerJeu(
                scene
            );


            return;

        }


        /*---------------------------------------------
            FIN DE CHAPITRE
        ---------------------------------------------*/

        if (
            scene.finChapitre ===
                true ||
            scene.fin ===
                "chapitre"
        ) {

            this.terminerChapitre();


            return;

        }


        /*---------------------------------------------
            DESTINATION SUIVANTE

            Peut être :
            - une scène ;
            - chapitre2 ;
            - une destination objet.
        ---------------------------------------------*/

        if (
            scene.next
        ) {

            this.gererDestination(
                scene.next
            );

        }

    },


    /*=====================================================
        TERMINER LE JEU
    =====================================================*/

    terminerJeu(
        source = null
    ) {

        this.annulerAttenteChoix();

        this.annulerTransitionFond();


        this.transitionChapitreEnCours =
            false;


        /*---------------------------------------------
            ARRÊTER UNE ÉVENTUELLE VIDÉO
        ---------------------------------------------*/

        this.arreterVideo();


        /*---------------------------------------------
            GALERIE FINALE
        ---------------------------------------------*/

        if (
            source &&
            typeof source ===
                "object"
        ) {

            this.gererGalerieElement(
                source
            );

        }


        /*---------------------------------------------
            EFFET FINAL UNIQUE
        ---------------------------------------------*/

        if (
            source?.effet &&
            typeof source.effet ===
                "object" &&
            !Array.isArray(
                source.effet
            )
        ) {

            this.appliquerEffets(
                source.effet
            );

        }


        /*---------------------------------------------
            PLUSIEURS EFFETS FINAUX
        ---------------------------------------------*/

        if (
            Array.isArray(
                source?.effets
            )
        ) {

            source.effets.forEach(
                effet => {

                    if (
                        effet &&
                        typeof effet ===
                            "object" &&
                        !Array.isArray(
                            effet
                        )
                    ) {

                        this.appliquerEffets(
                            effet
                        );

                    }

                }
            );

        }


        /*---------------------------------------------
            SUCCÈS FINAUX
        ---------------------------------------------*/

        this.verifierSucces();


        /*---------------------------------------------
            AFFICHER LES SUCCÈS FINAUX EN ATTENTE

            Certains succès peuvent être débloqués
            par les derniers effets du jeu.
        ---------------------------------------------*/

        if (
            typeof succesManager !==
                "undefined" &&
            succesManager !==
                null &&
            typeof succesManager
                .afficherNotificationsEnAttente ===
                "function"
        ) {

            try {

                succesManager
                    .afficherNotificationsEnAttente();

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur pendant l'affichage des notifications finales de succès :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
            SAUVEGARDE FINALE
        ---------------------------------------------*/

        this.sauvegarder();


        /*---------------------------------------------
            CRÉATION DE L'HÉRITAGE

            Cette sauvegarde est indépendante
            des slots de Friendzoné Reborn.

            Elle pourra être utilisée par le jeu
            suivant afin de conserver les décisions
            importantes du joueur.
        ---------------------------------------------*/

        if (
            typeof sauvegardeManager !==
                "undefined" &&
            sauvegardeManager !==
                null &&
            typeof sauvegardeManager
                .sauvegarderHeritage ===
                "function" &&
            this.joueur
        ) {

            try {

                const heritageCree =
                    sauvegardeManager
                        .sauvegarderHeritage(
                            this.joueur
                        );


                if (
                    heritageCree
                ) {

                    console.log(
                        "moteur.js : héritage du joueur enregistré."
                    );

                }

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur pendant la création de l'héritage :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
            ARRÊT DES CHOIX
        ---------------------------------------------*/

        if (
            typeof choixManager !==
                "undefined" &&
            choixManager !==
                null &&
            typeof choixManager
                .fermerPopup ===
                "function"
        ) {

            try {

                choixManager
                    .fermerPopup();

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur pendant la fermeture des choix en fin de jeu :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
            FONDU AUDIO

            Compatible Audio Manager V4.

            On utilise le volume réel actuellement
            calculé par le mixage sans modifier
            les paramètres utilisateur.
        ---------------------------------------------*/

        if (
            typeof audioManager !==
                "undefined" &&
            audioManager !==
                null
        ) {

            try {

                /*-------------------------------------
                    MUSIQUE
                -------------------------------------*/

                if (
                    typeof audioManager
                        .fadeOut ===
                        "function"
                ) {

                    audioManager
                        .fadeOut(
                            1000
                        );

                }
                else if (
                    typeof audioManager
                        .arreterMusique ===
                        "function"
                ) {

                    audioManager
                        .arreterMusique();

                }


                /*-------------------------------------
                    AMBIANCE
                -------------------------------------*/

                if (
                    typeof audioManager
                        .fadeOutAmbiance ===
                        "function"
                ) {

                    audioManager
                        .fadeOutAmbiance(
                            800
                        );

                }
                else if (
                    typeof audioManager
                        .arreterAmbiance ===
                        "function"
                ) {

                    audioManager
                        .arreterAmbiance();

                }

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur pendant l'arrêt audio de fin :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
            MESSAGE DE FIN
        ---------------------------------------------*/

        this.afficherMessageFin(
            source
        );


        /*---------------------------------------------
            BOUTON RETOUR MENU
        ---------------------------------------------*/

        this.creerBoutonRetourMenuFin();

    },


    /*=====================================================
        AFFICHER LE MESSAGE DE FIN
    =====================================================*/

    afficherMessageFin(
        source = null
    ) {

        const conversation =
            document.getElementById(
                "conversation"
            );


        if (
            !conversation
        ) {

            return false;

        }


        const message =
            document.createElement(
                "div"
            );


        message.classList.add(
            "message",
            "narration"
        );


        const bulle =
            document.createElement(
                "div"
            );


        bulle.classList.add(
            "bulle"
        );


        /*
            Si terminerJeu() reçoit directement une
            chaîne, elle peut également servir de
            message de fin.

            Sinon on utilise les propriétés JSON
            habituelles.
        */

        if (
            typeof source ===
                "string" &&
            source.trim() !==
                ""
        ) {

            bulle.textContent =
                source.trim();

        }
        else {

            bulle.textContent =

                source?.messageFin ||

                source?.texteFin ||

                "Fin de cette version de Friendzoné Reborn.";

        }


        message.appendChild(
            bulle
        );


        conversation.appendChild(
            message
        );


        try {

            conversation.scrollTo(
                {

                    top:
                        conversation.scrollHeight,

                    behavior:
                        "smooth"

                }
            );

        }
        catch (
            erreur
        ) {

            conversation.scrollTop =
                conversation.scrollHeight;

        }


        return true;

    },


    /*=====================================================
        CRÉER LE BOUTON RETOUR MENU
    =====================================================*/

    creerBoutonRetourMenuFin() {

        const conversation =
            document.getElementById(
                "conversation"
            );


        if (
            !conversation
        ) {

            return false;

        }


        /*---------------------------------------------
            ÉVITER LES DOUBLONS
        ---------------------------------------------*/

        if (
            document.getElementById(
                "retourMenuFin"
            )
        ) {

            return false;

        }


        const zone =
            document.createElement(
                "div"
            );


        zone.className =
            "zone-afficher-choix";


        const bouton =
            document.createElement(
                "button"
            );


        bouton.id =
            "retourMenuFin";


        bouton.type =
            "button";


        bouton.className =
            "bouton-afficher-choix";


        bouton.textContent =
            "Retour au menu";


        bouton.addEventListener(
            "click",
            () => {

                /*
                    Dernière sauvegarde avant
                    de retourner au menu.
                */

                this.sauvegarder();


                const retourner =
                    () => {

                        window.location.href =
                            "index.html";

                    };


                if (
                    typeof animationManager !==
                        "undefined" &&
                    animationManager !==
                        null &&
                    typeof animationManager
                        .transitionVersNoir ===
                        "function"
                ) {

                    try {

                        animationManager
                            .transitionVersNoir(
                                retourner
                            );


                        return;

                    }
                    catch (
                        erreur
                    ) {

                        console.error(
                            "moteur.js : erreur transition retour menu :",
                            erreur
                        );

                    }

                }


                retourner();

            }
        );


        zone.appendChild(
            bouton
        );


        conversation.appendChild(
            zone
        );


        try {

            conversation.scrollTo(
                {

                    top:
                        conversation.scrollHeight,

                    behavior:
                        "smooth"

                }
            );

        }
        catch (
            erreur
        ) {

            conversation.scrollTop =
                conversation.scrollHeight;

        }


        return true;

    },


    /*=====================================================
        TERMINER UN CHAPITRE AVEC UN MÉDIA GALERIE
    =====================================================*/

    terminerChapitreAvecGalerie(
        idGalerie
    ) {

        if (
            idGalerie
        ) {

            this.debloquerGalerie(
                idGalerie
            );

        }


        this.terminerChapitre();

    },


    /*=====================================================
        DÉBLOQUER UNE CINÉMATIQUE
    =====================================================*/

    debloquerCinematique(
        idGalerie
    ) {

        if (
            !idGalerie
        ) {

            return false;

        }


        return this.debloquerGalerie(
            idGalerie
        );

    },


    /*=====================================================
        DÉBLOQUER UN APPEL AUDIO
    =====================================================*/

    debloquerAppel(
        idGalerie
    ) {

        if (
            !idGalerie
        ) {

            return false;

        }


        return this.debloquerGalerie(
            idGalerie
        );

    },


    /*=====================================================
        AFFICHER UNE ERREUR
    =====================================================*/

    afficherErreur(
        message
    ) {

        console.error(
            message
        );


        const conversation =
            document.getElementById(
                "conversation"
            );


        if (
            !conversation
        ) {

            window.alert(
                message
            );

            return;

        }


        const conteneur =
            document.createElement(
                "div"
            );


        conteneur.className =
            "message narration";


        const bulle =
            document.createElement(
                "div"
            );


        bulle.className =
            "bulle";


        bulle.textContent =
            String(
                message ||
                "Une erreur est survenue."
            );


        conteneur.appendChild(
            bulle
        );


        conversation.appendChild(
            conteneur
        );


        try {

            conversation.scrollTo(
                {

                    top:
                        conversation.scrollHeight,

                    behavior:
                        "smooth"

                }
            );

        }
        catch (
            erreur
        ) {

            conversation.scrollTop =
                conversation.scrollHeight;

        }

    },


    /*=====================================================
        OBTENIR LA SCÈNE ACTUELLE
    =====================================================*/

    obtenirSceneActuelle() {

        if (
            !this.chapitre ||
            !this.sceneActuelle
        ) {

            return null;

        }


        return (
            this.chapitre
                .scenes?.[
                    this.sceneActuelle
                ] ||
            null
        );

    },


    /*=====================================================
        OBTENIR LE CHAPITRE ACTUEL
    =====================================================*/

    obtenirChapitreActuel() {

        return this.chapitre ||
            null;

    },


    /*=====================================================
        OBTENIR LE JOUEUR
    =====================================================*/

    obtenirJoueur() {

        return this.joueur ||
            null;

    },


    /*=====================================================
        OBTENIR LE SLOT ACTIF
    =====================================================*/

    obtenirSlotActif() {

        if (
            typeof sauvegardeManager ===
                "undefined" ||
            sauvegardeManager ===
                null ||
            typeof sauvegardeManager
                .obtenirSlotActif !==
                "function"
        ) {

            return null;

        }


        return sauvegardeManager
            .obtenirSlotActif();

    },


    /*=====================================================
        FORCER UNE SAUVEGARDE
    =====================================================*/

    sauvegardeManuelle() {

        const resultat =
            this.sauvegarder();


        if (
            resultat
        ) {

            console.log(
                "moteur.js : sauvegarde manuelle effectuée."
            );

        }
        else {

            console.warn(
                "moteur.js : la sauvegarde manuelle a échoué."
            );

        }


        return resultat;

    },


    /*=====================================================
        RECHARGER LA SCÈNE ACTUELLE
    =====================================================*/

    rechargerScene() {

        if (
            !this.sceneActuelle
        ) {

            return false;

        }


        this.chargerScene(
            this.sceneActuelle
        );


        return true;

    },


    /*=====================================================
        ALLER À UNE SCÈNE

        Fonction de développement.
    =====================================================*/

    allerScene(
        idScene
    ) {

        if (
            !idScene
        ) {

            return false;

        }


        this.chargerScene(
            idScene
        );


        return true;

    },


    /*=====================================================
        ALLER À UN CHAPITRE

        Fonction de développement.

        IMPORTANT :

        index commence à 0.

        moteur.allerChapitre(0)
            = chapitre 1

        moteur.allerChapitre(12)
            = chapitre 13
    =====================================================*/

    allerChapitre(
        index,
        scene = null
    ) {

        const indexChapitre =
            Number(
                index
            );


        if (
            !Number.isInteger(
                indexChapitre
            ) ||
            indexChapitre <
                0
        ) {

            console.warn(
                "moteur.js : index de chapitre invalide :",
                index
            );


            return false;

        }


        return this.chargerChapitre(
            indexChapitre,
            scene
        );

    },


    /*=====================================================
        TESTER LA GALERIE
    =====================================================*/

    testGalerie(
        idGalerie
    ) {

        if (
            !idGalerie
        ) {

            return false;

        }


        return this.debloquerGalerie(
            idGalerie
        );

    },


    /*=====================================================
        TESTER PLUSIEURS MÉDIAS DE GALERIE
    =====================================================*/

    testGalerieMultiple(
        ids
    ) {

        if (
            !Array.isArray(
                ids
            )
        ) {

            return false;

        }


        return this.debloquerGalerie(
            ids
        );

    },


    /*=====================================================
        TESTER UN SUCCÈS
    =====================================================*/

    testSucces(
        idSucces
    ) {

        if (
            !idSucces
        ) {

            return false;

        }


        if (
            typeof succesManager ===
                "undefined" ||
            succesManager ===
                null ||
            typeof succesManager
                .debloquer !==
                "function"
        ) {

            return false;

        }


        try {

            return succesManager
                .debloquer(
                    idSucces
                );

        }
        catch (
            erreur
        ) {

            console.error(
                "moteur.js : erreur pendant le test du succès :",
                erreur
            );


            return false;

        }

    },


    /*=====================================================
        MODIFIER UNE VARIABLE DU JOUEUR
    =====================================================*/

    definirVariable(
        nom,
        valeur
    ) {

        if (
            !this.joueur ||
            !nom
        ) {

            return false;

        }


        this.joueur[
            nom
        ] =
            valeur;


        this.verifierSucces();

        this.sauvegarder();


        return true;

    },


    /*=====================================================
        OBTENIR UNE VARIABLE DU JOUEUR
    =====================================================*/

    obtenirVariable(
        nom
    ) {

        if (
            !this.joueur ||
            !nom
        ) {

            return undefined;

        }


        return this.joueur[
            nom
        ];

    },


    /*=====================================================
        AJOUTER UNE VALEUR À UNE VARIABLE
    =====================================================*/

    ajouterVariable(
        nom,
        valeur
    ) {

        if (
            !this.joueur ||
            !nom
        ) {

            return false;

        }


        const ancienneValeur =
            Number(
                this.joueur[
                    nom
                ]
            );


        const ajout =
            Number(
                valeur
            );


        this.joueur[
            nom
        ] =
            (
                Number.isFinite(
                    ancienneValeur
                )
                    ? ancienneValeur
                    : 0
            ) +
            (
                Number.isFinite(
                    ajout
                )
                    ? ajout
                    : 0
            );


        this.verifierSucces();

        this.sauvegarder();


        return true;

    },


    /*=====================================================
        VÉRIFIER LES DÉPENDANCES DU MOTEUR

        Fonction pratique pour la console :

        moteur.verifierDependances()
    =====================================================*/

    verifierDependances() {

        const dependances = {

            chapitresManager:
                typeof chapitresManager !==
                    "undefined",

            sauvegardeManager:
                typeof sauvegardeManager !==
                    "undefined",

            dialogueManager:
                typeof dialogueManager !==
                    "undefined",

            choixManager:
                typeof choixManager !==
                    "undefined",

            audioManager:
                typeof audioManager !==
                    "undefined",

            animationManager:
                typeof animationManager !==
                    "undefined",

            succesManager:
                typeof succesManager !==
                    "undefined",

            galerieManager:
                typeof galerieManager !==
                    "undefined"

        };


        console.table(
            dependances
        );


        return dependances;

    },


    /*=====================================================
        AFFICHER L'ÉTAT AUDIO

        Fonction de développement spécifique
        à Audio Manager V4.

        Dans la console :

        moteur.verifierAudio()
    =====================================================*/

    verifierAudio() {

        if (
            typeof audioManager ===
                "undefined" ||
            audioManager ===
                null
        ) {

            console.warn(
                "moteur.js : audioManager est indisponible."
            );

            return null;

        }


        if (
            typeof audioManager
                .obtenirEtatMixage ===
                "function"
        ) {

            const etat =
                audioManager
                    .obtenirEtatMixage();


            console.log(
                "moteur.js : état du mixage audio :",
                etat
            );


            return etat;

        }


        const etat = {

            musique:
                audioManager.musiqueActuelle ||
                "",

            ambiance:
                audioManager.ambianceActuelle ||
                "",

            volumeMusique:
                audioManager.volumeMusique,

            volumeAmbiance:
                audioManager.volumeAmbiance,

            volumeEffets:
                audioManager.volumeEffets

        };


        console.log(
            "moteur.js : état audio :",
            etat
        );


        return etat;

    },


    /*=====================================================
        NETTOYER LES ÉTATS TEMPORAIRES
    =====================================================*/

    nettoyer() {

        this.annulerAttenteChoix();

        this.annulerTransitionFond();

        this.arreterVideo();


        this.transitionChapitreEnCours =
            false;


        this.changementFondEnCours =
            false;


        /*---------------------------------------------
            ARRÊTER LES DIALOGUES EN COURS
        ---------------------------------------------*/

        if (
            typeof dialogueManager !==
                "undefined" &&
            dialogueManager !==
                null &&
            typeof dialogueManager
                .arreter ===
                "function"
        ) {

            try {

                dialogueManager
                    .arreter();

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur nettoyage dialogueManager :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
            FERMER LES CHOIX
        ---------------------------------------------*/

        if (
            typeof choixManager !==
                "undefined" &&
            choixManager !==
                null &&
            typeof choixManager
                .fermerPopup ===
                "function"
        ) {

            try {

                choixManager
                    .fermerPopup();

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur nettoyage choixManager :",
                    erreur
                );

            }

        }

    },


    /*=====================================================
        PRÉPARER LE MOTEUR AVANT DE QUITTER
    =====================================================*/

    avantQuitter() {

        if (
            this.joueur &&
            this.sceneActuelle
        ) {

            try {

                this.sauvegarder();

            }
            catch (
                erreur
            ) {

                console.error(
                    "moteur.js : erreur sauvegarde avant fermeture :",
                    erreur
                );

            }

        }


        this.nettoyer();

    }

};


/*=========================================================
    SAUVEGARDE AVANT FERMETURE OU CHANGEMENT DE PAGE
=========================================================*/

window.addEventListener(
    "beforeunload",
    () => {

        try {

            moteur
                .avantQuitter();

        }
        catch (
            erreur
        ) {

            console.error(
                "moteur.js : erreur avant fermeture :",
                erreur
            );

        }

    }
);


/*=========================================================
    INITIALISATION AUTOMATIQUE
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        moteur
            .initialiser()
            .catch(
                erreur => {

                    console.error(
                        "moteur.js : erreur fatale pendant l'initialisation :",
                        erreur
                    );


                    moteur
                        .afficherErreur(
                            "Impossible d'initialiser le jeu."
                        );

                }
            );

    }
);