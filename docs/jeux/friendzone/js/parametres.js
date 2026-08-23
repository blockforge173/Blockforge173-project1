"use strict";

/*=========================================================
 FRIENDZONÉ REBORN
 parametres.js

 Gestion :
 - volume musique ;
 - volume ambiance ;
 - volume effets ;
 - assombrissement du fond ;
 - synchronisation des sliders ;
 - sauvegarde locale ;
 - compatibilité menu / jeu.
=========================================================*/

const parametresManager = {

    /*=====================================================
     CONFIGURATION
    =====================================================*/

    cleParametres:
        "friendzoneRebornParametres",

    valeursParDefaut: {

        volumeMusique: 0.40,

        volumeAmbiance: 0.25,

        volumeEffets: 0.70,

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

        voileFond: null

    },


    /*=====================================================
     ÉTAT COURANT
    =====================================================*/

    valeurs: null,


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
            "parametresManager initialisé."
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

    },


    /*=====================================================
     CHARGER LES PARAMÈTRES
    =====================================================*/

    charger() {

        const sauvegarde =
            localStorage.getItem(
                this.cleParametres
            );

        if (!sauvegarde) {

            return {
                ...this.valeursParDefaut
            };

        }

        try {

            const donnees =
                JSON.parse(
                    sauvegarde
                );

            return {

                ...this.valeursParDefaut,

                ...donnees

            };

        }
        catch (erreur) {

            console.error(
                "Impossible de charger les paramètres :",
                erreur
            );

            return {
                ...this.valeursParDefaut
            };

        }

    },


    /*=====================================================
     SAUVEGARDER LES PARAMÈTRES
    =====================================================*/

    sauvegarder() {

        if (!this.valeurs) {
            return;
        }

        try {

            localStorage.setItem(
                this.cleParametres,
                JSON.stringify(
                    this.valeurs
                )
            );

        }
        catch (erreur) {

            console.error(
                "Impossible de sauvegarder les paramètres :",
                erreur
            );

        }

    },


    /*=====================================================
     LIMITER UNE VALEUR ENTRE 0 ET 1
    =====================================================*/

    limiterValeur(
        valeur
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

            return 0;

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
     CONVERTIR UN SLIDER EN VALEUR 0 → 1

     Les sliders HTML utiliseront 0 → 100.
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

        if (!this.valeurs) {
            return;
        }


        /*---------------------------------------------
         MUSIQUE
        ---------------------------------------------*/

        if (
            this.elements.volumeMusique
        ) {

            this.elements
                .volumeMusique
                .value =
                this.valeurVersPourcentage(
                    this.valeurs.volumeMusique
                );

        }


        /*---------------------------------------------
         AMBIANCE
        ---------------------------------------------*/

        if (
            this.elements.volumeAmbiance
        ) {

            this.elements
                .volumeAmbiance
                .value =
                this.valeurVersPourcentage(
                    this.valeurs.volumeAmbiance
                );

        }


        /*---------------------------------------------
         EFFETS
        ---------------------------------------------*/

        if (
            this.elements.volumeEffets
        ) {

            this.elements
                .volumeEffets
                .value =
                this.valeurVersPourcentage(
                    this.valeurs.volumeEffets
                );

        }


        /*---------------------------------------------
         ASSOMBRISSEMENT
        ---------------------------------------------*/

        if (
            this.elements.assombrissementFond
        ) {

            this.elements
                .assombrissementFond
                .value =
                this.valeurVersPourcentage(
                    this.valeurs.assombrissementFond
                );

        }


        /*---------------------------------------------
         TEXTES DES POURCENTAGES
        ---------------------------------------------*/

        this.actualiserAffichageValeurs();

    },


    /*=====================================================
     ACTUALISER LES POURCENTAGES AFFICHÉS
    =====================================================*/

    actualiserAffichageValeurs() {

        if (!this.valeurs) {
            return;
        }


        if (
            this.elements.valeurVolumeMusique
        ) {

            this.elements
                .valeurVolumeMusique
                .textContent =
                this.valeurVersPourcentage(
                    this.valeurs.volumeMusique
                ) + " %";

        }


        if (
            this.elements.valeurVolumeAmbiance
        ) {

            this.elements
                .valeurVolumeAmbiance
                .textContent =
                this.valeurVersPourcentage(
                    this.valeurs.volumeAmbiance
                ) + " %";

        }


        if (
            this.elements.valeurVolumeEffets
        ) {

            this.elements
                .valeurVolumeEffets
                .textContent =
                this.valeurVersPourcentage(
                    this.valeurs.volumeEffets
                ) + " %";

        }


        if (
            this.elements.valeurAssombrissementFond
        ) {

            this.elements
                .valeurAssombrissementFond
                .textContent =
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
            typeof audioManager !==
                "undefined" &&
            audioManager !== null
        );

    },


    /*=====================================================
     APPLIQUER LE VOLUME MUSIQUE
    =====================================================*/

    appliquerVolumeMusique() {

        if (
            !this.audioDisponible()
        ) {
            return;
        }

        const valeur =
            this.limiterValeur(
                this.valeurs.volumeMusique
            );


        if (
            typeof audioManager
                .setVolumeMusique ===
                "function"
        ) {

            audioManager
                .setVolumeMusique(
                    valeur
                );

            return;

        }


        /*
         Compatibilité de secours.
        */

        if (
            audioManager.musique
        ) {

            audioManager
                .musique
                .volume =
                valeur;

        }

    },


    /*=====================================================
     APPLIQUER LE VOLUME AMBIANCE
    =====================================================*/

    appliquerVolumeAmbiance() {

        if (
            !this.audioDisponible()
        ) {
            return;
        }

        const valeur =
            this.limiterValeur(
                this.valeurs.volumeAmbiance
            );


        if (
            typeof audioManager
                .setVolumeAmbiance ===
                "function"
        ) {

            audioManager
                .setVolumeAmbiance(
                    valeur
                );

            return;

        }


        if (
            audioManager.ambiance
        ) {

            audioManager
                .ambiance
                .volume =
                valeur;

        }

    },


    /*=====================================================
     APPLIQUER LE VOLUME DES EFFETS
    =====================================================*/

    appliquerVolumeEffets() {

        if (
            !this.audioDisponible()
        ) {
            return;
        }

        const valeur =
            this.limiterValeur(
                this.valeurs.volumeEffets
            );


        if (
            typeof audioManager
                .setVolumeEffets ===
                "function"
        ) {

            audioManager
                .setVolumeEffets(
                    valeur
                );

            return;

        }


        /*
         Compatibilité de secours.
        */

        if (
            "volumeEffets" in
            audioManager
        ) {

            audioManager.volumeEffets =
                valeur;

        }

    },


    /*=====================================================
     APPLIQUER L'ASSOMBRISSEMENT DU FOND
    =====================================================*/

    appliquerAssombrissementFond() {

        if (
            !this.elements.voileFond
        ) {
            return;
        }

        const valeur =
            this.limiterValeur(
                this.valeurs.assombrissementFond
            );

        this.elements
            .voileFond
            .style
            .background =
            `rgba(0, 0, 0, ${valeur})`;

    },


    /*=====================================================
     APPLIQUER TOUS LES PARAMÈTRES
    =====================================================*/

    appliquerTousLesParametres() {

        if (!this.valeurs) {
            return;
        }

        this.appliquerVolumeMusique();

        this.appliquerVolumeAmbiance();

        this.appliquerVolumeEffets();

        this.appliquerAssombrissementFond();

        this.actualiserAffichageValeurs();

    },


    /*=====================================================
     INSTALLER LES ÉVÉNEMENTS
    =====================================================*/

    installerEvenements() {

        /*---------------------------------------------
         MUSIQUE
        ---------------------------------------------*/

        if (
            this.elements.volumeMusique
        ) {

            this.elements
                .volumeMusique
                .addEventListener(
                    "input",
                    event => {

                        this.valeurs
                            .volumeMusique =
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

            this.elements
                .volumeAmbiance
                .addEventListener(
                    "input",
                    event => {

                        this.valeurs
                            .volumeAmbiance =
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

            this.elements
                .volumeEffets
                .addEventListener(
                    "input",
                    event => {

                        this.valeurs
                            .volumeEffets =
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

            this.elements
                .assombrissementFond
                .addEventListener(
                    "input",
                    event => {

                        this.valeurs
                            .assombrissementFond =
                            this.sliderVersValeur(
                                event.target.value
                            );

                        this.appliquerAssombrissementFond();

                        this.actualiserAffichageValeurs();

                        this.sauvegarder();

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
            !Object.prototype
                .hasOwnProperty
                .call(
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
                valeur
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

        this.valeurs = {
            ...this.valeursParDefaut
        };

        this.sauvegarder();

        this.appliquerValeursAuxElements();

        this.appliquerTousLesParametres();

        console.log(
            "Paramètres réinitialisés."
        );

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