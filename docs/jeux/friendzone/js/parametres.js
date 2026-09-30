"use strict";

/*=========================================================
 FRIENDZONÉ REBORN
 parametres.js — V4

 Gestion :
 - volume utilisateur musique ;
 - volume utilisateur ambiance ;
 - volume utilisateur effets ;
 - assombrissement du fond ;
 - synchronisation des sliders ;
 - sauvegarde locale ;
 - migration des anciens volumes ;
 - réinitialisation ;
 - compatibilité menu / jeu ;
 - compatibilité Audio Manager V4.

 IMPORTANT AUDIO V4
 ------------------
 parametres.js contrôle uniquement les volumes utilisateur.

 Les volumes artistiques provenant des chapitres et scènes
 sont gérés par moteur.js / audioManager.js :

 volume final = volume utilisateur × volume artistique
=========================================================*/

const parametresManager = {

    /*=====================================================
     CONFIGURATION
    =====================================================*/

    cleParametres:
        "friendzoneRebornParametres",

    /*
     Ancienne sauvegarde autonome d'audioManager.

     Elle est conservée pour permettre une migration
     transparente des anciennes installations.
    */
    cleVolumesLegacy:
        "friendzoneRebornVolumes",

    valeursParDefaut: {

        volumeMusique: 0.50,

        volumeAmbiance: 0.25,

        volumeEffets: 0.15,

        assombrissementFond: 0.35

    },


    /*=====================================================
     ÉLÉMENTS HTML

     Ces éléments peuvent ne pas exister selon la page.
    =====================================================*/

    elements: {

        volumeMusique: null,
        volumeAmbiance: null,
        volumeEffets: null,
        assombrissementFond: null,

        valeurVolumeMusique: null,
        valeurVolumeAmbiance: null,
        valeurVolumeEffets: null,
        valeurAssombrissementFond: null,

        voileFond: null,

        reinitialiserParametres: null

    },


    /*=====================================================
     ÉTAT COURANT
    =====================================================*/

    valeurs:
        null,

    evenementsInstalles:
        false,


    /*=====================================================
     INITIALISATION
    =====================================================*/

    initialiser() {

        this.recupererElements();

        this.valeurs =
            this.charger();

        this.appliquerValeursAuxElements();

        this.appliquerTousLesParametres();

        this.installerEvenements();

        console.log(
            "parametresManager V4 initialisé."
        );

    },


    /*=====================================================
     RÉCUPÉRER LES ÉLÉMENTS HTML
    =====================================================*/

    recupererElements() {

        /*---------------------------------------------
         SLIDERS
        ---------------------------------------------*/

        this.elements.volumeMusique =
            document.getElementById(
                "volumeMusique"
            );

        this.elements.volumeAmbiance =
            document.getElementById(
                "volumeAmbiance"
            );

        this.elements.volumeEffets =
            document.getElementById(
                "volumeEffets"
            );

        this.elements.assombrissementFond =
            document.getElementById(
                "assombrissementFond"
            );


        /*---------------------------------------------
         AFFICHAGE DES VALEURS
        ---------------------------------------------*/

        this.elements.valeurVolumeMusique =
            document.getElementById(
                "valeurVolumeMusique"
            );

        this.elements.valeurVolumeAmbiance =
            document.getElementById(
                "valeurVolumeAmbiance"
            );

        this.elements.valeurVolumeEffets =
            document.getElementById(
                "valeurVolumeEffets"
            );

        this.elements.valeurAssombrissementFond =
            document.getElementById(
                "valeurAssombrissementFond"
            );


        /*---------------------------------------------
         VOILE DU JEU
        ---------------------------------------------*/

        this.elements.voileFond =
            document.getElementById(
                "voile-fond"
            );


        /*---------------------------------------------
         BOUTON RÉINITIALISER
        ---------------------------------------------*/

        this.elements.reinitialiserParametres =
            document.getElementById(
                "reinitialiserParametres"
            );

    },


    /*=====================================================
     LIMITER UNE VALEUR ENTRE 0 ET 1
    =====================================================*/

    limiterValeur(
        valeur,
        valeurParDefaut = 0
    ) {

        const nombre =
            Number(
                valeur
            );

        if (
            !Number.isFinite(
                nombre
            )
        ) {

            const secours =
                Number(
                    valeurParDefaut
                );

            return Math.max(
                0,
                Math.min(
                    1,
                    Number.isFinite(
                        secours
                    )
                        ? secours
                        : 0
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
     NORMALISER UN OBJET DE PARAMÈTRES

     Seules les propriétés connues sont conservées.
     Cela évite qu'une ancienne donnée invalide ou une
     valeur hors limites se propage dans le jeu.
    =====================================================*/

    normaliserParametres(
        donnees = {}
    ) {

        const source =
            donnees &&
            typeof donnees === "object" &&
            !Array.isArray(
                donnees
            )

                ? donnees

                : {};

        return {

            volumeMusique:
                this.limiterValeur(
                    source.volumeMusique,
                    this.valeursParDefaut.volumeMusique
                ),

            volumeAmbiance:
                this.limiterValeur(
                    source.volumeAmbiance,
                    this.valeursParDefaut.volumeAmbiance
                ),

            volumeEffets:
                this.limiterValeur(
                    source.volumeEffets,
                    this.valeursParDefaut.volumeEffets
                ),

            assombrissementFond:
                this.limiterValeur(
                    source.assombrissementFond,
                    this.valeursParDefaut.assombrissementFond
                )

        };

    },


    /*=====================================================
     LIRE LES ANCIENS VOLUMES D'AUDIOMANAGER

     Ancien format attendu :

     {
         "musique": 0.4,
         "ambiance": 0.25,
         "effets": 0.7
     }
    =====================================================*/

    chargerVolumesLegacy() {

        let sauvegarde =
            null;

        try {

            sauvegarde =
                localStorage.getItem(
                    this.cleVolumesLegacy
                );

        }
        catch (
            erreur
        ) {

            console.warn(
                "parametres.js : impossible de lire les anciens volumes.",
                erreur
            );

            return null;

        }

        if (
            !sauvegarde
        ) {

            return null;

        }

        try {

            const donnees =
                JSON.parse(
                    sauvegarde
                );

            if (
                !donnees ||
                typeof donnees !== "object"
            ) {

                return null;

            }

            return {

                volumeMusique:
                    this.limiterValeur(
                        donnees.musique,
                        this.valeursParDefaut.volumeMusique
                    ),

                volumeAmbiance:
                    this.limiterValeur(
                        donnees.ambiance,
                        this.valeursParDefaut.volumeAmbiance
                    ),

                volumeEffets:
                    this.limiterValeur(
                        donnees.effets,
                        this.valeursParDefaut.volumeEffets
                    )

            };

        }
        catch (
            erreur
        ) {

            console.warn(
                "parametres.js : anciens volumes invalides.",
                erreur
            );

            return null;

        }

    },


    /*=====================================================
     CHARGER LES PARAMÈTRES

     Ordre de priorité :

     1. friendzoneRebornParametres ;
     2. migration de friendzoneRebornVolumes ;
     3. valeurs par défaut.

     friendzoneRebornParametres devient donc la référence
     principale pour les réglages du joueur.
    =====================================================*/

    charger() {

        let sauvegarde =
            null;

        try {

            sauvegarde =
                localStorage.getItem(
                    this.cleParametres
                );

        }
        catch (
            erreur
        ) {

            console.error(
                "Impossible de lire les paramètres :",
                erreur
            );

        }


        /*---------------------------------------------
         SAUVEGARDE PRINCIPALE DISPONIBLE
        ---------------------------------------------*/

        if (
            sauvegarde
        ) {

            try {

                const donnees =
                    JSON.parse(
                        sauvegarde
                    );

                return this.normaliserParametres(
                    {
                        ...this.valeursParDefaut,
                        ...donnees
                    }
                );

            }
            catch (
                erreur
            ) {

                console.error(
                    "Impossible de charger les paramètres :",
                    erreur
                );

            }

        }


        /*---------------------------------------------
         MIGRATION DES ANCIENS VOLUMES
        ---------------------------------------------*/

        const anciensVolumes =
            this.chargerVolumesLegacy();

        if (
            anciensVolumes
        ) {

            const valeursMigrees =
                this.normaliserParametres(
                    {
                        ...this.valeursParDefaut,
                        ...anciensVolumes
                    }
                );

            try {

                localStorage.setItem(
                    this.cleParametres,
                    JSON.stringify(
                        valeursMigrees
                    )
                );

                console.log(
                    "parametres.js : anciens volumes migrés vers friendzoneRebornParametres."
                );

            }
            catch (
                erreur
            ) {

                console.warn(
                    "parametres.js : migration effectuée en mémoire mais impossible à sauvegarder.",
                    erreur
                );

            }

            return valeursMigrees;

        }


        /*---------------------------------------------
         VALEURS PAR DÉFAUT
        ---------------------------------------------*/

        return this.normaliserParametres(
            this.valeursParDefaut
        );

    },


    /*=====================================================
     SAUVEGARDER LES PARAMÈTRES
    =====================================================*/

    sauvegarder() {

        if (
            !this.valeurs
        ) {

            return false;

        }

        this.valeurs =
            this.normaliserParametres(
                this.valeurs
            );

        try {

            localStorage.setItem(
                this.cleParametres,
                JSON.stringify(
                    this.valeurs
                )
            );

            return true;

        }
        catch (
            erreur
        ) {

            console.error(
                "Impossible de sauvegarder les paramètres :",
                erreur
            );

            return false;

        }

    },


    /*=====================================================
     CONVERTIR UN SLIDER EN VALEUR 0 → 1

     Les sliders HTML utilisent 0 → 100.
    =====================================================*/

    sliderVersValeur(
        valeur
    ) {

        return this.limiterValeur(
            Number(
                valeur
            ) / 100
        );

    },


    /*=====================================================
     CONVERTIR UNE VALEUR 0 → 1 EN POURCENTAGE
    =====================================================*/

    valeurVersPourcentage(
        valeur
    ) {

        return Math.round(
            this.limiterValeur(
                valeur
            ) * 100
        );

    },


    /*=====================================================
     APPLIQUER LES VALEURS AUX SLIDERS
    =====================================================*/

    appliquerValeursAuxElements() {

        if (
            !this.valeurs
        ) {

            return;

        }

        if (
            this.elements.volumeMusique
        ) {

            this.elements.volumeMusique.value =
                this.valeurVersPourcentage(
                    this.valeurs.volumeMusique
                );

        }

        if (
            this.elements.volumeAmbiance
        ) {

            this.elements.volumeAmbiance.value =
                this.valeurVersPourcentage(
                    this.valeurs.volumeAmbiance
                );

        }

        if (
            this.elements.volumeEffets
        ) {

            this.elements.volumeEffets.value =
                this.valeurVersPourcentage(
                    this.valeurs.volumeEffets
                );

        }

        if (
            this.elements.assombrissementFond
        ) {

            this.elements.assombrissementFond.value =
                this.valeurVersPourcentage(
                    this.valeurs.assombrissementFond
                );

        }

        this.actualiserAffichageValeurs();

    },


    /*=====================================================
     ACTUALISER LES POURCENTAGES AFFICHÉS
    =====================================================*/

    actualiserAffichageValeurs() {

        if (
            !this.valeurs
        ) {

            return;

        }

        if (
            this.elements.valeurVolumeMusique
        ) {

            this.elements.valeurVolumeMusique.textContent =
                this.valeurVersPourcentage(
                    this.valeurs.volumeMusique
                ) + " %";

        }

        if (
            this.elements.valeurVolumeAmbiance
        ) {

            this.elements.valeurVolumeAmbiance.textContent =
                this.valeurVersPourcentage(
                    this.valeurs.volumeAmbiance
                ) + " %";

        }

        if (
            this.elements.valeurVolumeEffets
        ) {

            this.elements.valeurVolumeEffets.textContent =
                this.valeurVersPourcentage(
                    this.valeurs.volumeEffets
                ) + " %";

        }

        if (
            this.elements.valeurAssombrissementFond
        ) {

            this.elements.valeurAssombrissementFond.textContent =
                this.valeurVersPourcentage(
                    this.valeurs.assombrissementFond
                ) + " %";

        }

    },
        /*=====================================================
     VÉRIFIER AUDIO MANAGER
    =====================================================*/

    audioDisponible() {

        return (
            typeof audioManager !== "undefined" &&
            audioManager !== null
        );

    },


    /*=====================================================
     APPLIQUER LE VOLUME UTILISATEUR DE LA MUSIQUE

     Audio Manager V4 se charge ensuite de calculer :

     utilisateur × mix artistique
    =====================================================*/

    appliquerVolumeMusique() {

        if (
            !this.audioDisponible() ||
            !this.valeurs
        ) {

            return false;

        }

        const valeur =
            this.limiterValeur(
                this.valeurs.volumeMusique,
                this.valeursParDefaut.volumeMusique
            );

        if (
            typeof audioManager.setVolumeMusique ===
                "function"
        ) {

            audioManager.setVolumeMusique(
                valeur
            );

            return true;

        }

        /*
         Compatibilité avec un ancien audioManager.
         Ce secours ne doit pas être utilisé avec V4.
        */
        if (
            audioManager.musique
        ) {

            audioManager.musique.volume =
                valeur;

            return true;

        }

        return false;

    },


    /*=====================================================
     APPLIQUER LE VOLUME UTILISATEUR DE L'AMBIANCE
    =====================================================*/

    appliquerVolumeAmbiance() {

        if (
            !this.audioDisponible() ||
            !this.valeurs
        ) {

            return false;

        }

        const valeur =
            this.limiterValeur(
                this.valeurs.volumeAmbiance,
                this.valeursParDefaut.volumeAmbiance
            );

        if (
            typeof audioManager.setVolumeAmbiance ===
                "function"
        ) {

            audioManager.setVolumeAmbiance(
                valeur
            );

            return true;

        }

        if (
            audioManager.ambiance
        ) {

            audioManager.ambiance.volume =
                valeur;

            return true;

        }

        return false;

    },


    /*=====================================================
     APPLIQUER LE VOLUME UTILISATEUR DES EFFETS
    =====================================================*/

    appliquerVolumeEffets() {

        if (
            !this.audioDisponible() ||
            !this.valeurs
        ) {

            return false;

        }

        const valeur =
            this.limiterValeur(
                this.valeurs.volumeEffets,
                this.valeursParDefaut.volumeEffets
            );

        if (
            typeof audioManager.setVolumeEffets ===
                "function"
        ) {

            audioManager.setVolumeEffets(
                valeur
            );

            return true;

        }

        if (
            "volumeEffets" in audioManager
        ) {

            audioManager.volumeEffets =
                valeur;

            return true;

        }

        return false;

    },


    /*=====================================================
     APPLIQUER L'ASSOMBRISSEMENT DU FOND
    =====================================================*/

    appliquerAssombrissementFond() {

        if (
            !this.elements.voileFond ||
            !this.valeurs
        ) {

            return false;

        }

        const valeur =
            this.limiterValeur(
                this.valeurs.assombrissementFond,
                this.valeursParDefaut.assombrissementFond
            );

        this.elements.voileFond.style.background =
            `rgba(0, 0, 0, ${valeur})`;

        return true;

    },


    /*=====================================================
     APPLIQUER TOUS LES PARAMÈTRES
    =====================================================*/

    appliquerTousLesParametres() {

        if (
            !this.valeurs
        ) {

            return false;

        }

        this.appliquerVolumeMusique();
        this.appliquerVolumeAmbiance();
        this.appliquerVolumeEffets();
        this.appliquerAssombrissementFond();
        this.actualiserAffichageValeurs();

        return true;

    },


    /*=====================================================
     INSTALLER LES ÉVÉNEMENTS
    =====================================================*/

    installerEvenements() {

        /*
         Empêche l'installation multiple des mêmes
         listeners si initialiser() est rappelé.
        */
        if (
            this.evenementsInstalles
        ) {

            return;

        }

        this.evenementsInstalles =
            true;


        /*---------------------------------------------
         MUSIQUE
        ---------------------------------------------*/

        if (
            this.elements.volumeMusique
        ) {

            this.elements.volumeMusique.addEventListener(
                "input",
                event => {

                    this.valeurs.volumeMusique =
                        this.sliderVersValeur(
                            event.target.value
                        );

                    this.appliquerVolumeMusique();
                    this.actualiserAffichageValeurs();
                    this.sauvegarder();

                }
            );

        }


        /*---------------------------------------------
         AMBIANCE
        ---------------------------------------------*/

        if (
            this.elements.volumeAmbiance
        ) {

            this.elements.volumeAmbiance.addEventListener(
                "input",
                event => {

                    this.valeurs.volumeAmbiance =
                        this.sliderVersValeur(
                            event.target.value
                        );

                    this.appliquerVolumeAmbiance();
                    this.actualiserAffichageValeurs();
                    this.sauvegarder();

                }
            );

        }


        /*---------------------------------------------
         EFFETS
        ---------------------------------------------*/

        if (
            this.elements.volumeEffets
        ) {

            this.elements.volumeEffets.addEventListener(
                "input",
                event => {

                    this.valeurs.volumeEffets =
                        this.sliderVersValeur(
                            event.target.value
                        );

                    this.appliquerVolumeEffets();
                    this.actualiserAffichageValeurs();
                    this.sauvegarder();

                }
            );

        }


        /*---------------------------------------------
         ASSOMBRISSEMENT
        ---------------------------------------------*/

        if (
            this.elements.assombrissementFond
        ) {

            this.elements.assombrissementFond.addEventListener(
                "input",
                event => {

                    this.valeurs.assombrissementFond =
                        this.sliderVersValeur(
                            event.target.value
                        );

                    this.appliquerAssombrissementFond();
                    this.actualiserAffichageValeurs();
                    this.sauvegarder();

                }
            );

        }


        /*---------------------------------------------
         RÉINITIALISER LES PARAMÈTRES
        ---------------------------------------------*/

        if (
            this.elements.reinitialiserParametres
        ) {

            this.elements.reinitialiserParametres.addEventListener(
                "click",
                () => {

                    const confirmation =
                        window.confirm(
                            "Réinitialiser tous les paramètres par défaut ?"
                        );

                    if (
                        !confirmation
                    ) {

                        return;

                    }

                    this.reinitialiser();

                }
            );

        }

    },


    /*=====================================================
     OBTENIR UNE VALEUR
    =====================================================*/

    obtenir(
        nom
    ) {

        if (
            !this.valeurs
        ) {

            this.valeurs =
                this.charger();

        }

        return this.valeurs[
            nom
        ];

    },


    /*=====================================================
     MODIFIER UNE VALEUR
    =====================================================*/

    definir(
        nom,
        valeur
    ) {

        if (
            !this.valeurs
        ) {

            this.valeurs =
                this.charger();

        }

        if (
            !Object.prototype.hasOwnProperty.call(
                this.valeursParDefaut,
                nom
            )
        ) {

            console.warn(
                "Paramètre inconnu :",
                nom
            );

            return false;

        }

        this.valeurs[nom] =
            this.limiterValeur(
                valeur,
                this.valeursParDefaut[nom]
            );

        this.sauvegarder();
        this.appliquerValeursAuxElements();
        this.appliquerTousLesParametres();

        return true;

    },


    /*=====================================================
     RÉINITIALISER LES PARAMÈTRES
    =====================================================*/

    reinitialiser() {

        this.valeurs =
            this.normaliserParametres(
                this.valeursParDefaut
            );

        this.sauvegarder();
        this.appliquerValeursAuxElements();
        this.appliquerTousLesParametres();

        console.log(
            "Paramètres réinitialisés."
        );

        return true;

    },


    /*=====================================================
     VÉRIFIER L'ÉTAT DES PARAMÈTRES

     Fonction de développement :

     parametresManager.verifier()
    =====================================================*/

    verifier() {

        if (
            !this.valeurs
        ) {

            this.valeurs =
                this.charger();

        }

        const etat = {

            parametres:
                {
                    ...this.valeurs
                },

            audioDisponible:
                this.audioDisponible(),

            audio:
                this.audioDisponible()

                    ? {

                        volumeUtilisateurMusique:
                            audioManager.volumeMusique,

                        volumeUtilisateurAmbiance:
                            audioManager.volumeAmbiance,

                        volumeUtilisateurEffets:
                            audioManager.volumeEffets,

                        volumeMixMusique:
                            audioManager.volumeMixMusique,

                        volumeMixAmbiance:
                            audioManager.volumeMixAmbiance,

                        volumeMixEffets:
                            audioManager.volumeMixEffets

                    }

                    : null

        };

        console.log(
            "parametresManager : état :",
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

        parametresManager
            .initialiser();

    }
);