"use strict";

/*=========================================================
    FRIENDZONÉ REBORN
    audioManager.js
    Audio Manager V4

    Gestion :
    - musique de fond ;
    - ambiance de scène ;
    - effets sonores ;
    - mixage artistique défini par les chapitres/scènes ;
    - volume utilisateur défini dans les paramètres ;
    - fondus sonores ;
    - pause et reprise ;
    - mise à jour des sons déjà en cours ;
    - blocage automatique du navigateur.

    PRINCIPE DE MIXAGE
    ------------------

    volume final = volume utilisateur × volume artistique

    Exemple :

    volume utilisateur musique = 0.80
    volume artistique musique   = 0.75

    volume réellement joué      = 0.60

    Les propriétés historiques :

    volumeMusique
    volumeAmbiance
    volumeEffets

    restent les volumes UTILISATEUR afin de conserver
    la compatibilité avec parametres.js.
=========================================================*/

const audioManager = {

    /*=====================================================
        ÉLÉMENTS AUDIO PRINCIPAUX
    =====================================================*/

    musique: new Audio(),
    ambiance: new Audio(),

    /*=====================================================
        ÉTAT AUDIO
    =====================================================*/

    musiqueActuelle: "",
    ambianceActuelle: "",

    musiqueEnPause: false,
    ambianceEnPause: false,

    audioDebloque: false,

    /*=====================================================
        VOLUMES UTILISATEUR

        Ces valeurs sont contrôlées par parametres.js.
        Elles ne doivent jamais être remplacées par les
        volumes artistiques provenant des chapitres JSON.
    =====================================================*/

    volumeMusique: 0.50,
    volumeAmbiance: 0.25,
    volumeEffets: 0.15,

    /*=====================================================
        VOLUMES ARTISTIQUES / MIXAGE

        Ces valeurs sont contrôlées par le jeu.

        1 = niveau normal prévu par le joueur.
        0 = muet.

        Le moteur pourra les modifier à partir de :

        volumeMusique
        volumeAmbiance
        volumeEffets
        volumeSon

        définis dans les chapitres/scènes/dialogues.
    =====================================================*/

    volumeMixMusique: 1,
    volumeMixAmbiance: 1,
    volumeMixEffets: 1,

    /*=====================================================
        DOSSIERS AUDIO
    =====================================================*/

    chemins: {

        musique: "audio/",
        ambiance: "audio/ambiance/",
        sons: "audio/sons/"

    },

    /*=====================================================
        FONDUS ET TRANSITIONS
    =====================================================*/

    intervalleMusique: null,
    intervalleAmbiance: null,

    timerChangementMusique: null,
    timerChangementAmbiance: null,

    typeFonduMusique: "",
    typeFonduAmbiance: "",

    /*=====================================================
        EFFETS SONORES EN COURS

        Chaque entrée contient :

        {
            audio: HTMLAudioElement,
            volumeMix: nombre
        }

        Cela permet de mettre à jour immédiatement les
        effets déjà en lecture si le joueur déplace le
        curseur du volume des effets.
    =====================================================*/

    sonsActifs: new Set(),

    /*=====================================================
        INITIALISATION
    =====================================================*/

    initialiser() {

        this.musique.loop = true;
        this.ambiance.loop = true;

        this.musique.preload = "auto";
        this.ambiance.preload = "auto";

        this.actualiserVolumeMusique();
        this.actualiserVolumeAmbiance();

        /*
            Le navigateur bloque souvent le son tant que
            le joueur n'a pas effectué une interaction.
        */

        const debloquerAudio = () => {

            this.audioDebloque = true;

            document.removeEventListener(
                "click",
                debloquerAudio
            );

            document.removeEventListener(
                "keydown",
                debloquerAudio
            );

            document.removeEventListener(
                "touchstart",
                debloquerAudio
            );

        };

        document.addEventListener(
            "click",
            debloquerAudio,
            {
                once: true
            }
        );

        document.addEventListener(
            "keydown",
            debloquerAudio,
            {
                once: true
            }
        );

        document.addEventListener(
            "touchstart",
            debloquerAudio,
            {
                once: true
            }
        );

        console.log(
            "audioManager V4 initialisé."
        );

    },

    /*=====================================================
        LIMITER UN VOLUME ENTRE 0 ET 1
    =====================================================*/

    limiterVolume(volume) {

        const valeur =
            Number(
                volume
            );

        if (!Number.isFinite(valeur)) {
            return 0;
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
        NORMALISER UN VOLUME ARTISTIQUE

        Une valeur absente utilise la valeur de secours.
        Cela évite qu'un undefined devienne accidentellement 0.
    =====================================================*/

    normaliserVolumeMix(
        volume,
        valeurParDefaut = 1
    ) {

        if (
            volume === undefined ||
            volume === null ||
            volume === ""
        ) {

            return this.limiterVolume(
                valeurParDefaut
            );

        }

        return this.limiterVolume(
            volume
        );

    },

    /*=====================================================
        CALCULER LE VOLUME FINAL
    =====================================================*/

    calculerVolumeFinal(
        volumeUtilisateur,
        volumeMix = 1
    ) {

        return this.limiterVolume(
            this.limiterVolume(
                volumeUtilisateur
            ) *
            this.limiterVolume(
                volumeMix
            )
        );

    },

    /*=====================================================
        OBTENIR LES VOLUMES FINAUX
    =====================================================*/

    obtenirVolumeFinalMusique() {

        return this.calculerVolumeFinal(
            this.volumeMusique,
            this.volumeMixMusique
        );

    },

    obtenirVolumeFinalAmbiance() {

        return this.calculerVolumeFinal(
            this.volumeAmbiance,
            this.volumeMixAmbiance
        );

    },

    obtenirVolumeFinalEffets(
        volumeMixSon = 1
    ) {

        const volumeMixTotal =
            this.limiterVolume(
                this.volumeMixEffets *
                this.normaliserVolumeMix(
                    volumeMixSon,
                    1
                )
            );

        return this.calculerVolumeFinal(
            this.volumeEffets,
            volumeMixTotal
        );

    },

    /*=====================================================
        ACTUALISER LES VOLUMES CONTINUS
    =====================================================*/

    actualiserVolumeMusique() {

        /*
            Pendant un fondu, l'intervalle lui-même contrôle
            le niveau. On ne le casse pas avec une mise à jour
            brutale provenant du curseur des paramètres.
        */

        if (
            this.intervalleMusique !== null
        ) {
            return;
        }

        this.musique.volume =
            this.obtenirVolumeFinalMusique();

    },

    actualiserVolumeAmbiance() {

        if (
            this.intervalleAmbiance !== null
        ) {
            return;
        }

        this.ambiance.volume =
            this.obtenirVolumeFinalAmbiance();

    },

    actualiserVolumeEffetsActifs() {

        this.sonsActifs.forEach(
            entree => {

                if (
                    !entree ||
                    !entree.audio
                ) {
                    return;
                }

                try {

                    entree.audio.volume =
                        this.obtenirVolumeFinalEffets(
                            entree.volumeMix
                        );

                }
                catch (erreur) {

                    console.warn(
                        "audioManager : impossible d'actualiser un effet sonore en cours.",
                        erreur
                    );

                }

            }
        );

    },
        /*=====================================================
        CONSTRUIRE UN CHEMIN AUDIO
    =====================================================*/

    construireChemin(
        dossier,
        nom
    ) {

        if (
            typeof nom !== "string" ||
            nom.trim() === ""
        ) {
            return "";
        }

        const nomNettoye =
            nom.trim();

        if (
            /\.(mp3|ogg|wav|m4a|aac|flac)$/i.test(
                nomNettoye
            )
        ) {

            return (
                dossier +
                nomNettoye
            );

        }

        return (
            dossier +
            nomNettoye +
            ".mp3"
        );

    },

    /*=====================================================
        LECTURE AUDIO SÉCURISÉE
    =====================================================*/

    async lancerLecture(
        audio,
        nom = "audio"
    ) {

        if (!audio) {
            return false;
        }

        try {

            await audio.play();

            this.audioDebloque = true;

            return true;

        }
        catch (erreur) {

            if (
                erreur &&
                erreur.name === "NotAllowedError"
            ) {

                console.warn(
                    `audioManager : lecture de "${nom}" bloquée jusqu'à une interaction du joueur.`
                );

            }
            else {

                console.warn(
                    `audioManager : impossible de lire "${nom}".`,
                    erreur
                );

            }

            return false;

        }

    },

    /*=====================================================
        ANNULER LES TRANSITIONS EN ATTENTE
    =====================================================*/

    annulerChangementMusique() {

        if (
            this.timerChangementMusique !== null
        ) {

            clearTimeout(
                this.timerChangementMusique
            );

            this.timerChangementMusique =
                null;

        }

    },

    annulerChangementAmbiance() {

        if (
            this.timerChangementAmbiance !== null
        ) {

            clearTimeout(
                this.timerChangementAmbiance
            );

            this.timerChangementAmbiance =
                null;

        }

    },

    /*=====================================================
        ARRÊTER LES INTERVALLES DE FONDU
    =====================================================*/

    arreterFonduMusique() {

        if (
            this.intervalleMusique !== null
        ) {

            clearInterval(
                this.intervalleMusique
            );

            this.intervalleMusique =
                null;

        }

        this.typeFonduMusique =
            "";

    },

    arreterFonduAmbiance() {

        if (
            this.intervalleAmbiance !== null
        ) {

            clearInterval(
                this.intervalleAmbiance
            );

            this.intervalleAmbiance =
                null;

        }

        this.typeFonduAmbiance =
            "";

    },

    /*=====================================================
        DÉFINIR LE MIXAGE ARTISTIQUE DE LA MUSIQUE
    =====================================================*/

    setVolumeMixMusique(
        volume = 1
    ) {

        this.volumeMixMusique =
            this.normaliserVolumeMix(
                volume,
                1
            );

        this.actualiserVolumeMusique();

        return this.volumeMixMusique;

    },

    /*=====================================================
        DÉFINIR LE MIXAGE ARTISTIQUE DE L'AMBIANCE
    =====================================================*/

    setVolumeMixAmbiance(
        volume = 1
    ) {

        this.volumeMixAmbiance =
            this.normaliserVolumeMix(
                volume,
                1
            );

        this.actualiserVolumeAmbiance();

        return this.volumeMixAmbiance;

    },

    /*=====================================================
        DÉFINIR LE MIXAGE ARTISTIQUE GLOBAL DES EFFETS
    =====================================================*/

    setVolumeMixEffets(
        volume = 1
    ) {

        this.volumeMixEffets =
            this.normaliserVolumeMix(
                volume,
                1
            );

        this.actualiserVolumeEffetsActifs();

        return this.volumeMixEffets;

    },
        /*=====================================================
        MUSIQUE

        Le paramètre volumeMix représente le volume
        ARTISTIQUE du morceau, pas le volume utilisateur.
    =====================================================*/

    jouerMusique(
        nom,
        volumeMix = 1
    ) {

        if (
            typeof nom !== "string" ||
            nom.trim() === "" ||
            nom.toLowerCase() === "aucune" ||
            nom.toLowerCase() === "aucun"
        ) {

            this.arreterMusique();

            return;

        }

        const nomNettoye =
            nom.trim();

        this.annulerChangementMusique();

        this.setVolumeMixMusique(
            volumeMix
        );

        const volumeFinal =
            this.obtenirVolumeFinalMusique();

        /*
            Si la même musique joue déjà,
            elle ne redémarre pas.

            Seul son mixage est mis à jour.
        */

        if (
            this.musiqueActuelle ===
                nomNettoye &&
            !this.musique.paused
        ) {

            this.arreterFonduMusique();

            this.musique.volume =
                volumeFinal;

            return;

        }

        this.arreterFonduMusique();

        this.musique.pause();

        this.musique.src =
            this.construireChemin(
                this.chemins.musique,
                nomNettoye
            );

        try {

            this.musique.currentTime =
                0;

        }
        catch (erreur) {

            /*
                Certains navigateurs peuvent empêcher
                currentTime avant le chargement du média.
            */

        }

        this.musique.volume =
            volumeFinal;

        this.musique.loop =
            true;

        this.musiqueActuelle =
            nomNettoye;

        this.musiqueEnPause =
            false;

        this.lancerLecture(
            this.musique,
            nomNettoye
        );

    },

    /*=====================================================
        FONDU D'ENTRÉE DE LA MUSIQUE
    =====================================================*/

    fadeIn(
        nom,
        duree = 1200,
        volumeMix = 1
    ) {

        if (
            typeof nom !== "string" ||
            nom.trim() === ""
        ) {

            return;

        }

        const nomNettoye =
            nom.trim();

        const dureeFinale =
            Math.max(
                0,
                Number(duree) || 0
            );

        this.annulerChangementMusique();

        this.arreterFonduMusique();

        /*
            On enregistre le niveau artistique
            demandé par le chapitre ou la scène.
        */

        this.volumeMixMusique =
            this.normaliserVolumeMix(
                volumeMix,
                1
            );

        /*
            Si le morceau est différent,
            on charge le nouveau fichier.
        */

        if (
            this.musiqueActuelle !==
            nomNettoye
        ) {

            this.musique.pause();

            this.musique.src =
                this.construireChemin(
                    this.chemins.musique,
                    nomNettoye
                );

            try {

                this.musique.currentTime =
                    0;

            }
            catch (erreur) {

                /*
                    Rien à faire.
                */

            }

            this.musiqueActuelle =
                nomNettoye;

        }

        this.musique.loop =
            true;

        /*
            Le morceau commence silencieusement.
        */

        this.musique.volume =
            0;

        this.musiqueEnPause =
            false;

        this.lancerLecture(
            this.musique,
            nomNettoye
        );

        /*
            Sans durée de fondu,
            le volume final est appliqué immédiatement.
        */

        if (
            dureeFinale === 0
        ) {

            this.musique.volume =
                this.obtenirVolumeFinalMusique();

            return;

        }

        const intervalle =
            40;

        const nombreEtapes =
            Math.max(
                1,
                Math.ceil(
                    dureeFinale /
                    intervalle
                )
            );

        let etape =
            0;

        this.typeFonduMusique =
            "in";

        this.intervalleMusique =
            setInterval(
                () => {

                    etape += 1;

                    const progression =
                        Math.min(
                            1,
                            etape /
                            nombreEtapes
                        );

                    /*
                        IMPORTANT :

                        Le volume final est recalculé
                        à chaque étape.

                        Si le joueur change son curseur
                        pendant le fade-in, le fondu reste
                        donc cohérent avec son réglage.
                    */

                    this.musique.volume =
                        this.limiterVolume(
                            this.obtenirVolumeFinalMusique() *
                            progression
                        );

                    if (
                        progression >= 1
                    ) {

                        this.arreterFonduMusique();

                        this.musique.volume =
                            this.obtenirVolumeFinalMusique();

                    }

                },
                intervalle
            );

    },

    /*=====================================================
        FONDU DE SORTIE DE LA MUSIQUE
    =====================================================*/

    fadeOut(
        duree = 1200,
        arreterCompletement = true
    ) {

        this.annulerChangementMusique();

        this.arreterFonduMusique();

        const dureeFinale =
            Math.max(
                0,
                Number(duree) || 0
            );

        /*
            Si aucune musique ne joue,
            il n'y a rien à faire.
        */

        if (
            this.musique.paused
        ) {

            if (
                arreterCompletement
            ) {

                this.arreterMusique();

            }

            return;

        }

        const volumeDepart =
            this.musique.volume;

        /*
            Arrêt immédiat si aucune transition
            n'est demandée.
        */

        if (
            dureeFinale === 0 ||
            volumeDepart <= 0
        ) {

            this.musique.volume =
                0;

            this.musique.pause();

            if (
                arreterCompletement
            ) {

                try {

                    this.musique.currentTime =
                        0;

                }
                catch (erreur) {

                    /*
                        Rien à faire.
                    */

                }

                this.musiqueActuelle =
                    "";

            }

            return;

        }

        const intervalle =
            40;

        const nombreEtapes =
            Math.max(
                1,
                Math.ceil(
                    dureeFinale /
                    intervalle
                )
            );

        let etape =
            0;

        this.typeFonduMusique =
            "out";

        this.intervalleMusique =
            setInterval(
                () => {

                    etape += 1;

                    const progression =
                        Math.min(
                            1,
                            etape /
                            nombreEtapes
                        );

                    this.musique.volume =
                        this.limiterVolume(
                            volumeDepart *
                            (
                                1 -
                                progression
                            )
                        );

                    if (
                        progression >= 1
                    ) {

                        this.musique.volume =
                            0;

                        this.musique.pause();

                        this.arreterFonduMusique();

                        /*
                            Lors d'un changement de morceau,
                            arreterCompletement vaut false.

                            On conserve alors temporairement
                            musiqueActuelle jusqu'au lancement
                            du prochain morceau.
                        */

                        if (
                            arreterCompletement
                        ) {

                            try {

                                this.musique.currentTime =
                                    0;

                            }
                            catch (erreur) {

                                /*
                                    Rien à faire.
                                */

                            }

                            this.musiqueActuelle =
                                "";

                        }

                    }

                },
                intervalle
            );

    },

    /*=====================================================
        CHANGER DE MUSIQUE AVEC TRANSITION
    =====================================================*/

    changerMusique(
        nom,
        duree = 800,
        volumeMix = 1
    ) {

        /*
            Valeur vide ou "aucune" :
            extinction progressive de la musique.
        */

        if (
            typeof nom !== "string" ||
            nom.trim() === "" ||
            nom.toLowerCase() === "aucune" ||
            nom.toLowerCase() === "aucun"
        ) {

            this.fadeOut(
                duree
            );

            return;

        }

        const nomNettoye =
            nom.trim();

        const volumeMixFinal =
            this.normaliserVolumeMix(
                volumeMix,
                1
            );

        const dureeFinale =
            Math.max(
                0,
                Number(duree) || 0
            );

        /*
            Évite qu'un ancien setTimeout de transition
            change le morceau après une nouvelle demande.
        */

        this.annulerChangementMusique();

        /*
            Même morceau :

            on ne le redémarre surtout pas.
            On modifie simplement son mixage.
        */

        if (
            this.musiqueActuelle ===
            nomNettoye
        ) {

            this.setVolumeMixMusique(
                volumeMixFinal
            );

            return;

        }

        /*
            Aucune musique active :
            simple fade-in.
        */

        if (
            !this.musiqueActuelle ||
            this.musique.paused
        ) {

            this.fadeIn(
                nomNettoye,
                dureeFinale,
                volumeMixFinal
            );

            return;

        }

        /*
            Une autre musique joue déjà.

            1. Fade-out de l'ancienne.
            2. Attente.
            3. Fade-in de la nouvelle.

            arreterCompletement = false permet de ne pas
            provoquer un nettoyage total entre les deux.
        */

        this.fadeOut(
            dureeFinale,
            false
        );

        this.timerChangementMusique =
            setTimeout(
                () => {

                    this.timerChangementMusique =
                        null;

                    this.fadeIn(
                        nomNettoye,
                        dureeFinale,
                        volumeMixFinal
                    );

                },
                dureeFinale
            );

    },

    /*=====================================================
        ARRÊTER LA MUSIQUE
    =====================================================*/

    arreterMusique() {

        this.annulerChangementMusique();

        this.arreterFonduMusique();

        this.musique.pause();

        try {

            this.musique.currentTime =
                0;

        }
        catch (erreur) {

            console.warn(
                "audioManager : impossible de réinitialiser la musique.",
                erreur
            );

        }

        this.musique.removeAttribute(
            "src"
        );

        this.musique.load();

        this.musiqueActuelle =
            "";

        this.musiqueEnPause =
            false;

        /*
            Une future musique qui ne précise pas
            de volume artistique recommencera à 1.
        */

        this.volumeMixMusique =
            1;

    },
        /*=====================================================
        AMBIANCE
    =====================================================*/

    jouerAmbiance(
        nom,
        volumeMix = 1
    ) {

        if (
            nom === null ||
            nom === undefined ||
            nom === "" ||
            String(nom).toLowerCase() === "aucune" ||
            String(nom).toLowerCase() === "aucun"
        ) {

            this.arreterAmbiance();

            return;

        }

        const nomNettoye =
            String(
                nom
            ).trim();

        this.annulerChangementAmbiance();

        this.setVolumeMixAmbiance(
            volumeMix
        );

        const volumeFinal =
            this.obtenirVolumeFinalAmbiance();

        /*
            Si la même ambiance joue déjà,
            elle ne redémarre pas.

            Seul son niveau de mixage est actualisé.
        */

        if (
            this.ambianceActuelle ===
                nomNettoye &&
            !this.ambiance.paused
        ) {

            this.arreterFonduAmbiance();

            this.ambiance.volume =
                volumeFinal;

            return;

        }

        this.arreterFonduAmbiance();

        this.ambiance.pause();

        this.ambiance.src =
            this.construireChemin(
                this.chemins.ambiance,
                nomNettoye
            );

        try {

            this.ambiance.currentTime =
                0;

        }
        catch (erreur) {

            /*
                Certains navigateurs peuvent empêcher
                la modification de currentTime avant
                le chargement du média.
            */

        }

        this.ambiance.volume =
            volumeFinal;

        this.ambiance.loop =
            true;

        this.ambianceActuelle =
            nomNettoye;

        this.ambianceEnPause =
            false;

        this.lancerLecture(
            this.ambiance,
            nomNettoye
        );

    },

    /*=====================================================
        FONDU D'ENTRÉE DE L'AMBIANCE
    =====================================================*/

    fadeInAmbiance(
        nom,
        duree = 800,
        volumeMix = 1
    ) {

        if (
            typeof nom !== "string" ||
            nom.trim() === ""
        ) {

            return;

        }

        const nomNettoye =
            nom.trim();

        const dureeFinale =
            Math.max(
                0,
                Number(duree) || 0
            );

        this.annulerChangementAmbiance();

        this.arreterFonduAmbiance();

        /*
            Niveau artistique demandé par
            le chapitre ou la scène.
        */

        this.volumeMixAmbiance =
            this.normaliserVolumeMix(
                volumeMix,
                1
            );

        /*
            Charge le nouveau fichier uniquement
            si l'ambiance change.
        */

        if (
            this.ambianceActuelle !==
            nomNettoye
        ) {

            this.ambiance.pause();

            this.ambiance.src =
                this.construireChemin(
                    this.chemins.ambiance,
                    nomNettoye
                );

            try {

                this.ambiance.currentTime =
                    0;

            }
            catch (erreur) {

                /*
                    Rien à faire.
                */

            }

            this.ambianceActuelle =
                nomNettoye;

        }

        this.ambiance.loop =
            true;

        /*
            Le fade-in commence silencieusement.
        */

        this.ambiance.volume =
            0;

        this.ambianceEnPause =
            false;

        this.lancerLecture(
            this.ambiance,
            nomNettoye
        );

        if (
            dureeFinale === 0
        ) {

            this.ambiance.volume =
                this.obtenirVolumeFinalAmbiance();

            return;

        }

        const intervalle =
            40;

        const nombreEtapes =
            Math.max(
                1,
                Math.ceil(
                    dureeFinale /
                    intervalle
                )
            );

        let etape =
            0;

        this.typeFonduAmbiance =
            "in";

        this.intervalleAmbiance =
            setInterval(
                () => {

                    etape += 1;

                    const progression =
                        Math.min(
                            1,
                            etape /
                            nombreEtapes
                        );

                    /*
                        Comme pour la musique,
                        le volume utilisateur est
                        recalculé pendant le fondu.

                        Si le joueur change son volume
                        pendant le fade-in, celui-ci
                        reste cohérent.
                    */

                    this.ambiance.volume =
                        this.limiterVolume(
                            this.obtenirVolumeFinalAmbiance() *
                            progression
                        );

                    if (
                        progression >= 1
                    ) {

                        this.arreterFonduAmbiance();

                        this.ambiance.volume =
                            this.obtenirVolumeFinalAmbiance();

                    }

                },
                intervalle
            );

    },

    /*=====================================================
        FONDU DE SORTIE DE L'AMBIANCE
    =====================================================*/

    fadeOutAmbiance(
        duree = 800,
        arreterCompletement = true
    ) {

        this.annulerChangementAmbiance();

        this.arreterFonduAmbiance();

        const dureeFinale =
            Math.max(
                0,
                Number(duree) || 0
            );

        if (
            this.ambiance.paused
        ) {

            if (
                arreterCompletement
            ) {

                this.arreterAmbiance();

            }

            return;

        }

        const volumeDepart =
            this.ambiance.volume;

        if (
            dureeFinale === 0 ||
            volumeDepart <= 0
        ) {

            this.ambiance.volume =
                0;

            this.ambiance.pause();

            if (
                arreterCompletement
            ) {

                try {

                    this.ambiance.currentTime =
                        0;

                }
                catch (erreur) {

                    /*
                        Rien à faire.
                    */

                }

                this.ambianceActuelle =
                    "";

            }

            return;

        }

        const intervalle =
            40;

        const nombreEtapes =
            Math.max(
                1,
                Math.ceil(
                    dureeFinale /
                    intervalle
                )
            );

        let etape =
            0;

        this.typeFonduAmbiance =
            "out";

        this.intervalleAmbiance =
            setInterval(
                () => {

                    etape += 1;

                    const progression =
                        Math.min(
                            1,
                            etape /
                            nombreEtapes
                        );

                    this.ambiance.volume =
                        this.limiterVolume(
                            volumeDepart *
                            (
                                1 -
                                progression
                            )
                        );

                    if (
                        progression >= 1
                    ) {

                        this.ambiance.volume =
                            0;

                        this.ambiance.pause();

                        this.arreterFonduAmbiance();

                        if (
                            arreterCompletement
                        ) {

                            try {

                                this.ambiance.currentTime =
                                    0;

                            }
                            catch (erreur) {

                                /*
                                    Rien à faire.
                                */

                            }

                            this.ambianceActuelle =
                                "";

                        }

                    }

                },
                intervalle
            );

    },

    /*=====================================================
        CHANGER D'AMBIANCE AVEC TRANSITION
    =====================================================*/

    changerAmbiance(
        nom,
        duree = 600,
        volumeMix = 1
    ) {

        /*
            Une ambiance absente ou "aucune"
            provoque un fade-out.
        */

        if (
            nom === null ||
            nom === undefined ||
            nom === "" ||
            String(nom).toLowerCase() === "aucune" ||
            String(nom).toLowerCase() === "aucun"
        ) {

            this.fadeOutAmbiance(
                duree
            );

            return;

        }

        const nomNettoye =
            String(
                nom
            ).trim();

        const volumeMixFinal =
            this.normaliserVolumeMix(
                volumeMix,
                1
            );

        const dureeFinale =
            Math.max(
                0,
                Number(duree) || 0
            );

        this.annulerChangementAmbiance();

        /*
            Même ambiance :

            pas de redémarrage.
            On change seulement le niveau artistique.
        */

        if (
            this.ambianceActuelle ===
            nomNettoye
        ) {

            this.setVolumeMixAmbiance(
                volumeMixFinal
            );

            return;

        }

        /*
            Aucune ambiance active :
            simple fade-in.
        */

        if (
            !this.ambianceActuelle ||
            this.ambiance.paused
        ) {

            this.fadeInAmbiance(
                nomNettoye,
                dureeFinale,
                volumeMixFinal
            );

            return;

        }

        /*
            Une ambiance joue déjà :

            1. fade-out ;
            2. attente ;
            3. fade-in de la nouvelle ambiance.
        */

        this.fadeOutAmbiance(
            dureeFinale,
            false
        );

        this.timerChangementAmbiance =
            setTimeout(
                () => {

                    this.timerChangementAmbiance =
                        null;

                    this.fadeInAmbiance(
                        nomNettoye,
                        dureeFinale,
                        volumeMixFinal
                    );

                },
                dureeFinale
            );

    },

    /*=====================================================
        ARRÊTER L'AMBIANCE
    =====================================================*/

    arreterAmbiance() {

        this.annulerChangementAmbiance();

        this.arreterFonduAmbiance();

        this.ambiance.pause();

        try {

            this.ambiance.currentTime =
                0;

        }
        catch (erreur) {

            console.warn(
                "audioManager : impossible de réinitialiser l'ambiance.",
                erreur
            );

        }

        this.ambiance.removeAttribute(
            "src"
        );

        this.ambiance.load();

        this.ambianceActuelle =
            "";

        this.ambianceEnPause =
            false;

        /*
            La prochaine ambiance sans volume précisé
            utilisera un mix artistique de 1.
        */

        this.volumeMixAmbiance =
            1;

    },

    /*=====================================================
        EFFETS SONORES

        volumeMix représente le niveau artistique
        propre à CE son.

        Le niveau final devient :

        volume utilisateur effets
        ×
        volume artistique global des effets
        ×
        volume artistique propre au son
    =====================================================*/

    jouerSon(
        nom,
        volumeMix = 1
    ) {

        if (
            typeof nom !== "string" ||
            nom.trim() === "" ||
            nom.toLowerCase() === "aucun" ||
            nom.toLowerCase() === "aucune" ||
            nom.toLowerCase() === "none" ||
            nom.toLowerCase() === "false"
        ) {

            return null;

        }

        const nomNettoye =
            nom.trim();

        const volumeMixSon =
            this.normaliserVolumeMix(
                volumeMix,
                1
            );

        const son =
            new Audio(
                this.construireChemin(
                    this.chemins.sons,
                    nomNettoye
                )
            );

        son.preload =
            "auto";

        son.volume =
            this.obtenirVolumeFinalEffets(
                volumeMixSon
            );

        /*
            On conserve le son dans sonsActifs.

            Cela permet de recalculer son volume
            si le joueur change ses paramètres
            pendant que le son est encore joué.
        */

        const entree = {

            audio:
                son,

            volumeMix:
                volumeMixSon

        };

        this.sonsActifs.add(
            entree
        );

        /*
            Nettoyage de la référence une fois
            le son terminé ou en erreur.
        */

        const nettoyer = () => {

            this.sonsActifs.delete(
                entree
            );

            try {

                son.removeAttribute(
                    "src"
                );

                son.load();

            }
            catch (erreur) {

                /*
                    Rien à faire.
                */

            }

        };

        son.addEventListener(
            "ended",
            nettoyer,
            {
                once: true
            }
        );

        son.addEventListener(
            "error",
            nettoyer,
            {
                once: true
            }
        );

        this.lancerLecture(
            son,
            nomNettoye
        );

        return son;

    },

    /*=====================================================
        ARRÊTER TOUS LES EFFETS SONORES EN COURS
    =====================================================*/

    arreterEffets() {

        this.sonsActifs.forEach(
            entree => {

                if (
                    !entree ||
                    !entree.audio
                ) {

                    return;

                }

                try {

                    entree.audio.pause();

                    entree.audio.currentTime =
                        0;

                    entree.audio.removeAttribute(
                        "src"
                    );

                    entree.audio.load();

                }
                catch (erreur) {

                    /*
                        Rien à faire.
                    */

                }

            }
        );

        this.sonsActifs.clear();

    },

    /*=====================================================
        EFFETS SONORES PRÉDÉFINIS
    =====================================================*/

    jouerSucces(
        volumeMix = 1
    ) {

        return this.jouerSon(
            "succes",
            volumeMix
        );

    },

    jouerChoixImportant(
        volumeMix = 1
    ) {

        return this.jouerSon(
            "choix-important",
            volumeMix
        );

    },

    jouerNotification(
        volumeMix = 1
    ) {

        return this.jouerSon(
            "notification",
            volumeMix
        );

    },

    jouerInformationPersonnage(
        volumeMix = 1
    ) {

        return this.jouerSon(
            "systeme",
            volumeMix
        );

    },
        /*=====================================================
        PAUSE GÉNÉRALE
    =====================================================*/

    pause() {

        if (
            !this.musique.paused
        ) {

            this.musiqueEnPause =
                true;

            this.musique.pause();

        }
        else {

            this.musiqueEnPause =
                false;

        }

        if (
            !this.ambiance.paused
        ) {

            this.ambianceEnPause =
                true;

            this.ambiance.pause();

        }
        else {

            this.ambianceEnPause =
                false;

        }

    },

    /*=====================================================
        REPRISE GÉNÉRALE
    =====================================================*/

    reprendre() {

        if (
            this.musiqueEnPause &&
            this.musiqueActuelle
        ) {

            this.lancerLecture(
                this.musique,
                this.musiqueActuelle
            );

            this.musiqueEnPause =
                false;

        }

        if (
            this.ambianceEnPause &&
            this.ambianceActuelle
        ) {

            this.lancerLecture(
                this.ambiance,
                this.ambianceActuelle
            );

            this.ambianceEnPause =
                false;

        }

    },

    /*=====================================================
        ARRÊTER TOUS LES SONS
    =====================================================*/

    toutArreter() {

        this.arreterMusique();
        this.arreterAmbiance();
        this.arreterEffets();

    },

    /*=====================================================
        MODIFIER LE VOLUME UTILISATEUR DE LA MUSIQUE

        Fonction conservée pour parametres.js.
    =====================================================*/

    setVolumeMusique(
        volume
    ) {

        this.volumeMusique =
            this.limiterVolume(
                volume
            );

        this.actualiserVolumeMusique();

        this.sauvegarderVolumes();

        return this.volumeMusique;

    },

    /*=====================================================
        MODIFIER LE VOLUME UTILISATEUR DE L'AMBIANCE
    =====================================================*/

    setVolumeAmbiance(
        volume
    ) {

        this.volumeAmbiance =
            this.limiterVolume(
                volume
            );

        this.actualiserVolumeAmbiance();

        this.sauvegarderVolumes();

        return this.volumeAmbiance;

    },

    /*=====================================================
        MODIFIER LE VOLUME UTILISATEUR DES EFFETS
    =====================================================*/

    setVolumeEffets(
        volume
    ) {

        this.volumeEffets =
            this.limiterVolume(
                volume
            );

        this.actualiserVolumeEffetsActifs();

        this.sauvegarderVolumes();

        return this.volumeEffets;

    },

    /*=====================================================
        SAUVEGARDER LES VOLUMES UTILISATEUR

        Les volumes artistiques ne sont volontairement pas
        sauvegardés ici : ils appartiennent aux chapitres.
    =====================================================*/

    sauvegarderVolumes() {

        try {

            localStorage.setItem(
                "friendzoneRebornVolumes",
                JSON.stringify({

                    musique:
                        this.volumeMusique,

                    ambiance:
                        this.volumeAmbiance,

                    effets:
                        this.volumeEffets

                })
            );

        }
        catch (erreur) {

            console.warn(
                "audioManager : impossible de sauvegarder les volumes.",
                erreur
            );

        }

    },

    /*=====================================================
        CHARGER LES VOLUMES UTILISATEUR
    =====================================================*/

    chargerVolumes() {

        try {

            const sauvegarde =
                localStorage.getItem(
                    "friendzoneRebornVolumes"
                );

            if (!sauvegarde) {
                return;
            }

            const volumes =
                JSON.parse(
                    sauvegarde
                );

            if (
                volumes.musique !==
                undefined
            ) {

                this.volumeMusique =
                    this.limiterVolume(
                        volumes.musique
                    );

            }

            if (
                volumes.ambiance !==
                undefined
            ) {

                this.volumeAmbiance =
                    this.limiterVolume(
                        volumes.ambiance
                    );

            }

            if (
                volumes.effets !==
                undefined
            ) {

                this.volumeEffets =
                    this.limiterVolume(
                        volumes.effets
                    );

            }

            this.actualiserVolumeMusique();
            this.actualiserVolumeAmbiance();
            this.actualiserVolumeEffetsActifs();

        }
        catch (erreur) {

            console.warn(
                "audioManager : impossible de charger les volumes.",
                erreur
            );

        }

    },

    /*=====================================================
        INFORMATIONS DE MIXAGE

        Utile pour le débogage dans la console.
    =====================================================*/

    obtenirEtatMixage() {

        return {

            utilisateur: {

                musique:
                    this.volumeMusique,

                ambiance:
                    this.volumeAmbiance,

                effets:
                    this.volumeEffets

            },

            artistique: {

                musique:
                    this.volumeMixMusique,

                ambiance:
                    this.volumeMixAmbiance,

                effets:
                    this.volumeMixEffets

            },

            final: {

                musique:
                    this.obtenirVolumeFinalMusique(),

                ambiance:
                    this.obtenirVolumeFinalAmbiance(),

                effets:
                    this.obtenirVolumeFinalEffets()

            },

            pistes: {

                musique:
                    this.musiqueActuelle,

                ambiance:
                    this.ambianceActuelle,

                effetsActifs:
                    this.sonsActifs.size

            }

        };

    }

};


/*=========================================================
    INITIALISATION
=========================================================*/

audioManager.chargerVolumes();
audioManager.initialiser();