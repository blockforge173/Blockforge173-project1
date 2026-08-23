"use strict";

/*=========================================================
 FRIENDZONÉ REBORN
 galerie.js

 Gestion :
 - images ;
 - audios ;
 - vidéos ;
 - contenus secrets ;
 - déblocages permanents ;
 - variantes d'un même événement ;
 - filtres ;
 - progression ;
 - visionneuse multimédia ;
 - stockage indépendant des sauvegardes ;
 - réinitialisation volontaire de la galerie.
=========================================================*/

const galerieManager = {

    /*=====================================================
     CONFIGURATION
    =====================================================*/

    cle:
        "friendzoneRebornGalerie",

    version:
        "1.0",

    conteneur:
        null,

    conteneurFiltres:
        null,

    compteur:
        null,

    visionneuse:
        null,

    visionneuseContenu:
        null,

    visionneuseTitre:
        null,

    visionneuseDescription:
        null,

    boutonFermerVisionneuse:
        null,

    filtreActuel:
        "tout",


    /*=====================================================
     LISTE DES MÉDIAS
    =====================================================*/

    liste: {

        /*=================================================
         CHAPITRE 1
        =================================================*/

        cafeteriaAccident: {

            id:
                "cafeteriaAccident",

            type:
                "image",

            titre:
                "L'accident de la cafétéria",

            chapitre:
                1,

            fichier:
                "images/fonds/cafeteria_accident.jpg",

            miniature:
                "images/fonds/cafeteria_accident.jpg",

            description:
                "Le moment où l'incident de la cafétéria attire ton attention.",

            secret:
                false,

            groupe:
                null,

            ordre:
                1001

        },


        rencontreEmelyneCafeteria: {

            id:
                "rencontreEmelyneCafeteria",

            type:
                "image",

            titre:
                "Une rencontre inattendue",

            chapitre:
                1,

            fichier:
                "images/fonds/cafeteria_réaction_emelyne.jpg",

            miniature:
                "images/fonds/cafeteria_réaction_emelyne.jpg",

            description:
                "Le moment où tu remarques Émelyne après l'accident.",

            secret:
                false,

            groupe:
                null,

            ordre:
                1002

        },


        /*=================================================
         CHAPITRE 5
        =================================================*/

        appelInconnuPremierContact: {

            id:
                "appelInconnuPremierContact",

            type:
                "audio",

            titre:
                "Numéro inconnu",

            chapitre:
                5,

            fichier:
                "audio/galerie/appel_inconnu_premier_contact.mp3",

            miniature:
                "",

            description:
                "Le premier appel reçu du mystérieux numéro inconnu.",

            secret:
                true,

            groupe:
                "appel_inconnu",

            ordre:
                5001

        },


        appelInconnuApresRefus: {

            id:
                "appelInconnuApresRefus",

            type:
                "audio",

            titre:
                "Il rappelle",

            chapitre:
                5,

            fichier:
                "audio/galerie/appel_inconnu_apres_refus.mp3",

            miniature:
                "",

            description:
                "Une variante de l'appel obtenue après avoir ignoré le premier contact.",

            secret:
                true,

            groupe:
                "appel_inconnu",

            ordre:
                5002

        },


        /*=================================================
         CHAPITRE 11
        =================================================*/

        chap11BaiserFrontAccepte: {

            id:
                "chap11BaiserFrontAccepte",

            type:
                "video",

            titre:
                "Un geste tendre",

            chapitre:
                11,

            fichier:
                "videos/galerie/chapitre11/baiser_front_accepte.mp4",

            miniature:
                "images/galerie/chapitre11/baiser_front_accepte.jpg",

            description:
                "Eva accepte que tu l'embrasses sur le front.",

            secret:
                true,

            groupe:
                "chap11_baiser_front",

            ordre:
                11001

        },


        chap11BaiserFrontRefuse: {

            id:
                "chap11BaiserFrontRefuse",

            type:
                "video",

            titre:
                "Une limite",

            chapitre:
                11,

            fichier:
                "videos/galerie/chapitre11/baiser_front_refuse.mp4",

            miniature:
                "images/galerie/chapitre11/baiser_front_refuse.jpg",

            description:
                "Eva te repousse doucement et pose une limite.",

            secret:
                true,

            groupe:
                "chap11_baiser_front",

            ordre:
                11002

        },


        /*=================================================
         CHAPITRE 13
        =================================================*/

        finChapitre13: {

            id:
                "finChapitre13",

            type:
                "video",

            titre:
                "Fin du chapitre 13",

            chapitre:
                13,

            fichier:
                "videos/galerie/chapitre13/fin_chapitre13.mp4",

            miniature:
                "images/galerie/chapitre13/fin_chapitre13.jpg",

            description:
                "La cinématique de fin du chapitre 13.",

            secret:
                true,

            groupe:
                null,

            ordre:
                13001

        }

    },


    /*=====================================================
     INITIALISATION
    =====================================================*/

    initialiser() {

        this.recupererElements();

        this.installerEvenements();

        this.afficher();

        console.log(
            "galerieManager initialisé."
        );

    },


    /*=====================================================
     RÉCUPÉRER LES ÉLÉMENTS HTML
    =====================================================*/

    recupererElements() {

        this.conteneur =
            document.getElementById(
                "listeGalerie"
            );


        this.conteneurFiltres =
            document.getElementById(
                "filtresGalerie"
            );


        this.compteur =
            document.getElementById(
                "progressionGalerie"
            );


        this.visionneuse =
            document.getElementById(
                "visionneuseGalerie"
            );


        this.visionneuseContenu =
            document.getElementById(
                "visionneuseGalerieContenu"
            );


        this.visionneuseTitre =
            document.getElementById(
                "visionneuseGalerieTitre"
            );


        this.visionneuseDescription =
            document.getElementById(
                "visionneuseGalerieDescription"
            );


        this.boutonFermerVisionneuse =
            document.getElementById(
                "fermerVisionneuseGalerie"
            );

    },


    /*=====================================================
     DONNÉES PAR DÉFAUT
    =====================================================*/

    creerDonneesParDefaut() {

        return {

            version:
                this.version,

            debloques: {}

        };

    },


    /*=====================================================
     CHARGER
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
                "galerieManager : impossible d'accéder au localStorage.",
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
                "galerieManager : galerie sauvegardée invalide.",
                erreur
            );


            return this
                .creerDonneesParDefaut();

        }

    },


    /*=====================================================
     SAUVEGARDER
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
                "galerieManager : impossible de sauvegarder la galerie.",
                erreur
            );


            return false;

        }

    },


    /*=====================================================
     VÉRIFIER QU'UN MÉDIA EXISTE
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
     OBTENIR UN MÉDIA
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
     VÉRIFIER SI UN MÉDIA EST DÉBLOQUÉ
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
     DATE DE DÉBLOCAGE
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


        return (

            donnees
                .debloques?.[
                    id
                ]?.date ||

            null

        );

    },


    /*=====================================================
     DÉBLOQUER UN MÉDIA
    =====================================================*/

    debloquer(
        id
    ) {

        if (
            !this.existe(
                id
            )
        ) {

            console.warn(
                "galerieManager : média inconnu :",
                id
            );


            return false;

        }


        if (
            this.estDebloque(
                id
            )
        ) {

            return false;

        }


        const donnees =
            this.charger();


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


        const media =
            this.obtenir(
                id
            );


        console.log(
            "Média galerie débloqué :",
            media?.titre ||
                id
        );


        /*---------------------------------------------
         ÉVÉNEMENT
        ---------------------------------------------*/

        try {

            document.dispatchEvent(

                new CustomEvent(
                    "galerieDebloquee",
                    {

                        detail: {

                            id:
                                id,

                            type:
                                media?.type ||
                                "",

                            titre:
                                media?.titre ||
                                ""

                        }

                    }
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


        /*---------------------------------------------
         ACTUALISER LA GALERIE
        ---------------------------------------------*/

        this.afficher();


        return true;

    },


    /*=====================================================
     DÉBLOQUER PLUSIEURS MÉDIAS
    =====================================================*/

    debloquerPlusieurs(
        ids
    ) {

        if (
            !Array.isArray(
                ids
            )
        ) {

            return false;

        }


        let auMoinsUnDeblocage =
            false;


        ids.forEach(
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
     NOMBRE TOTAL
    =====================================================*/

    nombreTotal() {

        return Object
            .keys(
                this.liste
            )
            .length;

    },


    /*=====================================================
     NOMBRE DÉBLOQUÉ
    =====================================================*/

    nombreDebloques() {

        const donnees =
            this.charger();


        return Object
            .keys(
                donnees
                    .debloques ||
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
     PROGRESSION
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
            ) *
            100

        );

    },


    /*=====================================================
     TYPE VALIDE
    =====================================================*/

    typeValide(
        type
    ) {

        return (

            type ===
                "image" ||

            type ===
                "audio" ||

            type ===
                "video"

        );

    },


    /*=====================================================
     ICÔNE SELON LE TYPE
    =====================================================*/

    obtenirIconeType(
        type
    ) {

        switch (
            type
        ) {

            case "image":

                return "🖼";


            case "audio":

                return "☎";


            case "video":

                return "🎬";


            default:

                return "◆";

        }

    },


    /*=====================================================
     NOM DU TYPE
    =====================================================*/

    obtenirNomType(
        type
    ) {

        switch (
            type
        ) {

            case "image":

                return "Image";


            case "audio":

                return "Audio";


            case "video":

                return "Vidéo";


            default:

                return "Média";

        }

    },


    /*=====================================================
     FILTRER
    =====================================================*/

    definirFiltre(
        filtre
    ) {

        const filtresValides = [

            "tout",

            "image",

            "audio",

            "video"

        ];


        if (
            !filtresValides
                .includes(
                    filtre
                )
        ) {

            filtre =
                "tout";

        }


        this.filtreActuel =
            filtre;


        this.afficher();

    },


    /*=====================================================
     OBTENIR LA LISTE TRIÉE
    =====================================================*/

    obtenirListeTriee() {

        return Object
            .values(
                this.liste
            )
            .filter(
                media => {

                    if (
                        !media ||
                        !this.typeValide(
                            media.type
                        )
                    ) {

                        return false;

                    }


                    if (
                        this.filtreActuel ===
                        "tout"
                    ) {

                        return true;

                    }


                    return (
                        media.type ===
                        this.filtreActuel
                    );

                }
            )
            .sort(
                (
                    a,
                    b
                ) => {

                    const ordreA =
                        Number(
                            a.ordre
                        ) ||
                        0;


                    const ordreB =
                        Number(
                            b.ordre
                        ) ||
                        0;


                    if (
                        ordreA !==
                        ordreB
                    ) {

                        return (
                            ordreA -
                            ordreB
                        );

                    }


                    return String(
                        a.titre ||
                        ""
                    )
                        .localeCompare(
                            String(
                                b.titre ||
                                ""
                            ),
                            "fr"
                        );

                }
            );

    },


    /*=====================================================
     CRÉER LES FILTRES
    =====================================================*/

    afficherFiltres() {

        if (
            !this.conteneurFiltres
        ) {

            return;

        }


        this.conteneurFiltres
            .innerHTML =
            "";


        const filtres = [

            {
                id:
                    "tout",

                texte:
                    "Tout"
            },

            {
                id:
                    "image",

                texte:
                    "Images"
            },

            {
                id:
                    "audio",

                texte:
                    "Audios"
            },

            {
                id:
                    "video",

                texte:
                    "Vidéos"
            }

        ];


        filtres.forEach(
            filtre => {

                const bouton =
                    document.createElement(
                        "button"
                    );


                bouton.type =
                    "button";


                bouton.textContent =
                    filtre.texte;


                bouton.className =
                    "galerie-filtre";


                bouton.dataset.filtre =
                    filtre.id;


                if (
                    this.filtreActuel ===
                    filtre.id
                ) {

                    bouton
                        .classList
                        .add(
                            "actif"
                        );

                }


                bouton.addEventListener(
                    "click",
                    () => {

                        this.definirFiltre(
                            filtre.id
                        );

                    }
                );


                this.conteneurFiltres
                    .appendChild(
                        bouton
                    );

            }
        );

    },


    /*=====================================================
     CRÉER UNE CARTE
    =====================================================*/

    creerCarte(
        media
    ) {

        const debloque =
            this.estDebloque(
                media.id
            );


        const carte =
            document.createElement(
                "button"
            );


        carte.type =
            "button";


        carte.className =
            "galerie-carte";


        carte.dataset.id =
            media.id;


        carte.dataset.type =
            media.type;


        carte.classList.add(

            debloque
                ? "debloquee"
                : "verrouillee"

        );


        /*---------------------------------------------
         APERÇU
        ---------------------------------------------*/

        const apercu =
            document.createElement(
                "div"
            );


        apercu.className =
            "galerie-apercu";


        if (
            debloque
        ) {

            this.remplirApercu(
                apercu,
                media
            );

        }
        else {

            const cadenas =
                document.createElement(
                    "div"
                );


            cadenas.className =
                "galerie-cadenas";


            cadenas.textContent =
                "🔒";


            apercu.appendChild(
                cadenas
            );

        }


        /*---------------------------------------------
         INFORMATIONS
        ---------------------------------------------*/

        const informations =
            document.createElement(
                "div"
            );


        informations.className =
            "galerie-informations";


        const type =
            document.createElement(
                "div"
            );


        type.className =
            "galerie-type";


        type.textContent =
            `${this.obtenirIconeType(media.type)} ${this.obtenirNomType(media.type)}`;


        const titre =
            document.createElement(
                "div"
            );


        titre.className =
            "galerie-titre";


        if (
            !debloque &&
            media.secret
        ) {

            titre.textContent =
                "???";

        }
        else {

            titre.textContent =
                media.titre ||
                "Sans titre";

        }


        const chapitre =
            document.createElement(
                "div"
            );


        chapitre.className =
            "galerie-chapitre";


        chapitre.textContent =
            media.chapitre
                ? `Chapitre ${media.chapitre}`
                : "";


        const description =
            document.createElement(
                "div"
            );


        description.className =
            "galerie-description";


        if (
            !debloque &&
            media.secret
        ) {

            description.textContent =
                "Contenu non découvert.";

        }
        else if (
            !debloque
        ) {

            description.textContent =
                media.description ||
                "Contenu non découvert.";

        }
        else {

            description.textContent =
                media.description ||
                "";

        }


        informations.appendChild(
            type
        );


        informations.appendChild(
            titre
        );


        if (
            media.chapitre
        ) {

            informations.appendChild(
                chapitre
            );

        }


        informations.appendChild(
            description
        );


        carte.appendChild(
            apercu
        );


        carte.appendChild(
            informations
        );


        if (
            debloque
        ) {

            carte.addEventListener(
                "click",
                () => {

                    this.ouvrirMedia(
                        media.id
                    );

                }
            );

        }
        else {

            carte.disabled =
                true;

        }


        return carte;

    },


    /*=====================================================
     REMPLIR L'APERÇU
    =====================================================*/

    remplirApercu(
        conteneur,
        media
    ) {

        if (
            !conteneur ||
            !media
        ) {

            return;

        }


        /*---------------------------------------------
         IMAGE
        ---------------------------------------------*/

        if (
            media.type ===
            "image"
        ) {

            const image =
                document.createElement(
                    "img"
                );


            image.src =
                media.miniature ||
                media.fichier;


            image.alt =
                media.titre ||
                "";


            image.loading =
                "lazy";


            conteneur.appendChild(
                image
            );


            return;

        }


        /*---------------------------------------------
         VIDÉO
        ---------------------------------------------*/

        if (
            media.type ===
            "video"
        ) {

            if (
                media.miniature
            ) {

                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    media.miniature;


                image.alt =
                    media.titre ||
                    "";


                image.loading =
                    "lazy";


                conteneur.appendChild(
                    image
                );

            }


            const icone =
                document.createElement(
                    "div"
                );


            icone.className =
                "galerie-icone-media";


            icone.textContent =
                "▶";


            conteneur.appendChild(
                icone
            );


            return;

        }


        /*---------------------------------------------
         AUDIO
        ---------------------------------------------*/

        if (
            media.type ===
            "audio"
        ) {

            if (
                media.miniature
            ) {

                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    media.miniature;


                image.alt =
                    media.titre ||
                    "";


                image.loading =
                    "lazy";


                conteneur.appendChild(
                    image
                );

            }


            const icone =
                document.createElement(
                    "div"
                );


            icone.className =
                "galerie-icone-media galerie-icone-audio";


            icone.textContent =
                "♫";


            conteneur.appendChild(
                icone
            );

        }

    },


    /*=====================================================
     AFFICHER LA GALERIE
    =====================================================*/

    afficher() {

        this.recupererElements();


        this.afficherFiltres();


        /*---------------------------------------------
         PROGRESSION
        ---------------------------------------------*/

        if (
            this.compteur
        ) {

            this.compteur.textContent =
                `${this.nombreDebloques()} / ${this.nombreTotal()} médias — ${this.obtenirProgression()} %`;

        }


        if (
            !this.conteneur
        ) {

            return;

        }


        this.conteneur
            .innerHTML =
            "";


        const liste =
            this.obtenirListeTriee();


        if (
            liste.length ===
                0
        ) {

            const message =
                document.createElement(
                    "p"
                );


            message.className =
                "galerie-vide";


            message.textContent =
                "Aucun média dans cette catégorie.";


            this.conteneur
                .appendChild(
                    message
                );


            return;

        }


        liste.forEach(
            media => {

                const carte =
                    this.creerCarte(
                        media
                    );


                this.conteneur
                    .appendChild(
                        carte
                    );

            }
        );

    },


    /*=====================================================
     OUVRIR UN MÉDIA
    =====================================================*/

    ouvrirMedia(
        id
    ) {

        if (
            !this.existe(
                id
            )
        ) {

            return false;

        }


        if (
            !this.estDebloque(
                id
            )
        ) {

            return false;

        }


        const media =
            this.obtenir(
                id
            );


        if (
            !media
        ) {

            return false;

        }


        this.recupererElements();


        if (
            !this.visionneuse ||
            !this.visionneuseContenu
        ) {

            console.warn(
                "galerieManager : visionneuse HTML introuvable."
            );


            return false;

        }


        this.viderVisionneuse();


        if (
            this.visionneuseTitre
        ) {

            this.visionneuseTitre
                .textContent =
                media.titre ||
                "";

        }


        if (
            this.visionneuseDescription
        ) {

            this.visionneuseDescription
                .textContent =
                media.description ||
                "";

        }


        /*---------------------------------------------
         IMAGE
        ---------------------------------------------*/

        if (
            media.type ===
            "image"
        ) {

            const image =
                document.createElement(
                    "img"
                );


            image.src =
                media.fichier;


            image.alt =
                media.titre ||
                "";


            image.className =
                "galerie-media-ouvert";


            this.visionneuseContenu
                .appendChild(
                    image
                );

        }


        /*---------------------------------------------
         AUDIO
        ---------------------------------------------*/

        else if (
            media.type ===
            "audio"
        ) {

            const audio =
                document.createElement(
                    "audio"
                );


            audio.src =
                media.fichier;


            audio.controls =
                true;


            audio.preload =
                "metadata";


            audio.className =
                "galerie-media-ouvert galerie-audio-ouvert";


            this.visionneuseContenu
                .appendChild(
                    audio
                );

        }


        /*---------------------------------------------
         VIDÉO
        ---------------------------------------------*/

        else if (
            media.type ===
            "video"
        ) {

            const video =
                document.createElement(
                    "video"
                );


            video.src =
                media.fichier;


            video.controls =
                true;


            video.preload =
                "metadata";


            video.playsInline =
                true;


            video.className =
                "galerie-media-ouvert galerie-video-ouverte";


            if (
                media.miniature
            ) {

                video.poster =
                    media.miniature;

            }


            this.visionneuseContenu
                .appendChild(
                    video
                );

        }


        this.visionneuse
            .style
            .display =
            "flex";


        this.visionneuse
            .classList
            .add(
                "ouverte"
            );


        this.visionneuse
            .setAttribute(
                "aria-hidden",
                "false"
            );


        return true;

    },


    /*=====================================================
     VIDER LA VISIONNEUSE
    =====================================================*/

    viderVisionneuse() {

        if (
            !this.visionneuseContenu
        ) {

            return;

        }


        this.visionneuseContenu
            .querySelectorAll(
                "audio"
            )
            .forEach(
                audio => {

                    try {

                        audio.pause();

                        audio.currentTime =
                            0;

                    }
                    catch (
                        erreur
                    ) {

                        /* Rien */

                    }

                }
            );


        this.visionneuseContenu
            .querySelectorAll(
                "video"
            )
            .forEach(
                video => {

                    try {

                        video.pause();

                        video.currentTime =
                            0;

                    }
                    catch (
                        erreur
                    ) {

                        /* Rien */

                    }

                }
            );


        this.visionneuseContenu
            .innerHTML =
            "";

    },


    /*=====================================================
     FERMER LA VISIONNEUSE
    =====================================================*/

    fermerVisionneuse() {

        this.recupererElements();


        if (
            !this.visionneuse
        ) {

            return;

        }


        this.viderVisionneuse();


        this.visionneuse
            .classList
            .remove(
                "ouverte"
            );


        this.visionneuse
            .setAttribute(
                "aria-hidden",
                "true"
            );


        setTimeout(
            () => {

                if (
                    !this.visionneuse
                        .classList
                        .contains(
                            "ouverte"
                        )
                ) {

                    this.visionneuse
                        .style
                        .display =
                        "none";

                }

            },
            200
        );

    },


    /*=====================================================
     INSTALLER LES ÉVÉNEMENTS
    =====================================================*/

    installerEvenements() {

        this.recupererElements();


        if (
            this.boutonFermerVisionneuse
        ) {

            this.boutonFermerVisionneuse
                .addEventListener(
                    "click",
                    () => {

                        this.fermerVisionneuse();

                    }
                );

        }


        if (
            this.visionneuse
        ) {

            this.visionneuse
                .addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            this.visionneuse
                        ) {

                            this.fermerVisionneuse();

                        }

                    }
                );

        }


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key !==
                        "Escape"
                ) {

                    return;

                }


                if (
                    this.visionneuse &&
                    this.visionneuse
                        .classList
                        .contains(
                            "ouverte"
                        )
                ) {

                    this.fermerVisionneuse();

                }

            }
        );

    },


    /*=====================================================
     OBTENIR LES VARIANTES D'UN GROUPE
    =====================================================*/

    obtenirGroupe(
        groupe
    ) {

        if (
            !groupe
        ) {

            return [];

        }


        return Object
            .values(
                this.liste
            )
            .filter(
                media =>
                    media.groupe ===
                    groupe
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    (
                        Number(
                            a.ordre
                        ) ||
                        0
                    ) -
                    (
                        Number(
                            b.ordre
                        ) ||
                        0
                    )
            );

    },


    /*=====================================================
     NOMBRE DE VARIANTES DÉBLOQUÉES
    =====================================================*/

    nombreVariantesDebloquees(
        groupe
    ) {

        return this
            .obtenirGroupe(
                groupe
            )
            .filter(
                media =>
                    this.estDebloque(
                        media.id
                    )
            )
            .length;

    },


    /*=====================================================
     INFORMATIONS D'UN GROUPE
    =====================================================*/

    obtenirInformationsGroupe(
        groupe
    ) {

        const medias =
            this.obtenirGroupe(
                groupe
            );


        return {

            groupe:
                groupe,

            total:
                medias.length,

            debloques:
                medias
                    .filter(
                        media =>
                            this.estDebloque(
                                media.id
                            )
                    )
                    .length,

            medias:
                medias

        };

    },


    /*=====================================================
     RÉINITIALISER LA GALERIE

     Supprime uniquement :
     friendzoneRebornGalerie

     Ne touche PAS :
     - aux sauvegardes ;
     - aux succès ;
     - aux paramètres ;
     - à la partie active.
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
                "galerieManager : impossible de réinitialiser la galerie.",
                erreur
            );


            return false;

        }


        /*---------------------------------------------
         FERMER UN MÉDIA ÉVENTUELLEMENT OUVERT
        ---------------------------------------------*/

        this.fermerVisionneuse();


        /*---------------------------------------------
         REVENIR AU FILTRE "TOUT"
        ---------------------------------------------*/

        this.filtreActuel =
            "tout";


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
                    "galerieReinitialisee"
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
            "galerieManager : galerie réinitialisée."
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

            galerieManager
                .initialiser();

        }
        catch (
            erreur
        ) {

            console.error(
                "galerie.js : erreur pendant l'initialisation :",
                erreur
            );

        }

    }
);