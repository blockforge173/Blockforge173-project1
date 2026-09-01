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
        "1.1",

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

     Les entrées utilisant images/galerie/... correspondent
     à des illustrations/CG à créer pour la galerie.
     Les fonds déjà existants réutilisent images/fonds/...
     =====================================================*/

    liste: {

        /*=================================================
         CHAPITRE 1
        =================================================*/

        cafeteriaAccident: {

            id: "cafeteriaAccident",

            type: "image",

            titre: "L'accident du chocolat",

            chapitre: 1,

            fichier: "images/fonds/cafeteria_accident.jpg",

            miniature: "images/fonds/cafeteria_accident.jpg",

            description: "Zoé renverse un chocolat chaud à la cafétéria.",

            secret: false,

            groupe: null,

            ordre: 1001

        },

        chap1AiderZoe: {

            id: "chap1AiderZoe",

            type: "image",

            titre: "Aider Zoé",

            chapitre: 1,

            fichier: "images/fonds/cafeteria_aide_zoe.jpg",

            miniature: "images/fonds/cafeteria_aide_zoe.jpg",

            description: "Tu choisis d'aider Zoé après l'accident de la cafétéria.",

            secret: true,

            groupe: "chap1_accident",

            ordre: 1002

        },

        chap1PremiereRencontreEva: {

            id: "chap1PremiereRencontreEva",

            type: "image",

            titre: "Première rencontre avec Eva",

            chapitre: 1,

            fichier: "images/fonds/cafeteria_rencontre_eva.jpg",

            miniature: "images/fonds/cafeteria_rencontre_eva.jpg",

            description: "Le premier véritable moment où tu fais connaissance avec Eva.",

            secret: false,

            groupe: null,

            ordre: 1003

        },

        chap1RencontreEmelyne: {

            id: "chap1RencontreEmelyne",

            type: "image",

            titre: "Rencontre avec Émelyne",

            chapitre: 1,

            fichier: "images/fonds/cafeteria_réaction_emelyne.jpg",

            miniature: "images/fonds/cafeteria_réaction_emelyne.jpg",

            description: "Ta première rencontre avec Émelyne après l'accident.",

            secret: true,

            groupe: "chap1_accident",

            ordre: 1004

        },


        /*=================================================
         CHAPITRE 2
        =================================================*/

        chap2RencontreBryan: {

            id: "chap2RencontreBryan",

            type: "image",

            titre: "Rencontre avec Bryan",

            chapitre: 2,

            fichier: "images/fonds/couloir_bryan.jpg",

            miniature: "images/fonds/couloir_bryan.jpg",

            description: "Tu fais la connaissance de Bryan dans les couloirs de l'université.",

            secret: false,

            groupe: null,

            ordre: 2001

        },

        chap2TravailGroupe: {

            id: "chap2TravailGroupe",

            type: "image",

            titre: "Le travail de groupe",

            chapitre: 2,

            fichier: "images/fonds/class_travaille_groupe.jpg",

            miniature: "images/fonds/class_travaille_groupe.jpg",

            description: "Eva, Bryan et toi travaillez ensemble en classe.",

            secret: false,

            groupe: null,

            ordre: 2002

        },

        chap2AccusationBryan: {

            id: "chap2AccusationBryan",

            type: "image",

            titre: "L'accusation de Bryan",

            chapitre: 2,

            fichier: "images/fonds/class_intervention-eleve.jpg",

            miniature: "images/fonds/class_intervention-eleve.jpg",

            description: "Bryan est accusé pendant le travail de groupe.",

            secret: true,

            groupe: "chap2_bryan",

            ordre: 2003

        },

        chap2DiscussionEvaCouloir: {

            id: "chap2DiscussionEvaCouloir",

            type: "image",

            titre: "Discussion avec Eva dans le couloir",

            chapitre: 2,

            fichier: "images/fonds/couloir_discussion_eva.jpg",

            miniature: "images/fonds/couloir_discussion_eva.jpg",

            description: "Eva te rejoint après l'incident en classe.",

            secret: false,

            groupe: null,

            ordre: 2004

        },


        /*=================================================
         CHAPITRE 3
        =================================================*/

        chap3MomentEva: {

            id: "chap3MomentEva",

            type: "image",

            titre: "Un moment avec Eva",

            chapitre: 3,

            fichier: "images/galerie/chapitre3/moment_eva.jpg",

            miniature: "images/galerie/chapitre3/moment_eva.jpg",

            description: "Un moment important de ta première vraie conversation avec Eva.",

            secret: true,

            groupe: "chap3_relation",

            ordre: 3001

        },

        chap3PromenadeEmelyne: {

            id: "chap3PromenadeEmelyne",

            type: "image",

            titre: "La promenade avec Emelyne",

            chapitre: 3,

            fichier: "images/galerie/chapitre3/moment_groupe.jpg",

            miniature: "images/galerie/chapitre3/moment_groupe.jpg",

            description: "Un souvenir important lié aux autres personnes rencontrées à l'université.",

            secret: true,

            groupe: "chap3_relation",

            ordre: 3002

        },


        /*=================================================
         CHAPITRE 4
        =================================================*/

        chap4MomentRelationnel: {

            id: "chap4MomentRelationnel",

            type: "image",

            titre: "La conversation de 22 heures",

            chapitre: 4,

            fichier: "images/galerie/chapitre4/conversation_22h.jpg",

            miniature: "images/galerie/chapitre4/conversation_22h.jpg",

            description: "Un moment relationnel important pendant la conversation tardive.",

            secret: true,

            groupe: null,

            ordre: 4001

        },


        /*=================================================
         CHAPITRE 5
        =================================================*/

        chap5RapprochementEva: {

            id: "chap5RapprochementEva",

            type: "image",

            titre: "Les regards changent",

            chapitre: 5,

            fichier: "images/galerie/chapitre5/rapprochement_eva.jpg",

            miniature: "images/galerie/chapitre5/rapprochement_eva.jpg",

            description: "Un rapprochement important avec Eva.",

            secret: true,

            groupe: null,

            ordre: 5001

        },


        /*=================================================
         CHAPITRE 6
        =================================================*/

        chap6MomentGroupe: {

            id: "chap6MomentGroupe",

            type: "image",

            titre: "Le déjeuner",

            chapitre: 6,

            fichier: "images/fonds/restaurant_groupe.jpg",

            miniature: "images/fonds/restaurant_groupe.jpg",

            description: "Un moment important partagé pendant le déjeuner.",

            secret: true,

            groupe: null,

            ordre: 6001

        },


        /*=================================================
         CHAPITRE 7
        =================================================*/

        chap7SoireeHorreur: {

            id: "chap7SoireeHorreur",

            type: "image",

            titre: "La soirée films d'horreur",

            chapitre: 7,

            fichier: "images/fonds/salon_zoe_trois.jpg",

            miniature: "images/fonds/salon_zoe_trois.jpg",

            description: "La soirée films d'horreur organisée par Zoé.",

            secret: false,

            groupe: "chap7_soiree",

            ordre: 7001

        },

        chap7GroupeReuni: {

            id: "chap7GroupeReuni",

            type: "image",

            titre: "Le groupe réuni",

            chapitre: 7,

            fichier: "images/fonds/salon_zoe_a_quatre.jpg",

            miniature: "images/fonds/salon_zoe_a_quatre.jpg",

            description: "Le groupe est réuni pour profiter de la soirée.",

            secret: true,

            groupe: "chap7_soiree",

            ordre: 7002

        },

        chap7MomentFilm: {

            id: "chap7MomentFilm",

            type: "image",

            titre: "Pendant le film",

            chapitre: 7,

            fichier: "images/galerie/chapitre7/moment_film.jpg",

            miniature: "images/galerie/chapitre7/moment_film.jpg",

            description: "Un moment particulier vécu pendant le film.",

            secret: true,

            groupe: "chap7_soiree",

            ordre: 7003

        },

        chap7EvaAvantDepart: {

            id: "chap7EvaAvantDepart",

            type: "image",

            titre: "Eva avant son départ",

            chapitre: 7,

            fichier: "images/fonds/devant_maison_zoe.jpg",

            miniature: "images/fonds/devant_maison_zoe.jpg",

            description: "Le dernier moment avec Eva avant qu'elle ne reparte.",

            secret: true,

            groupe: "chap7_soiree",

            ordre: 7004

        },


        /*=================================================
         CHAPITRE 8
        =================================================*/

        chap8MessageAbsent: {

            id: "chap8MessageAbsent",

            type: "image",

            titre: "Le message qui n'arrive pas",

            chapitre: 8,

            fichier: "images/fonds/chambre_joueur3.jpg",

            miniature: "images/fonds/chambre_joueur3.jpg",

            description: "Au réveil, aucun message d'Eva n'est arrivé.",

            secret: false,

            groupe: null,

            ordre: 8001

        },

        chap8AppelChristophe: {

            id: "chap8AppelChristophe",

            type: "audio",

            titre: "L'appel de Christophe",

            chapitre: 8,

            fichier: "audio/galerie/appel_christophe_disparition_eva.mp3",

            miniature: "",

            description: "L'appel de Christophe lorsque l'absence d'Eva devient réellement inquiétante.",

            secret: true,

            groupe: "appels_importants",

            ordre: 8002

        },

        chap8PremieresInquietudes: {

            id: "chap8PremieresInquietudes",

            type: "image",

            titre: "Les premières inquiétudes",

            chapitre: 8,

            fichier: "images/galerie/chapitre8/premieres_inquietudes.jpg",

            miniature: "images/galerie/chapitre8/premieres_inquietudes.jpg",

            description: "L'inquiétude grandit alors qu'Eva reste introuvable.",

            secret: true,

            groupe: null,

            ordre: 8003

        },


        /*=================================================
         CHAPITRE 9
        =================================================*/

        chap9RencontreBryanNuit: {

            id: "chap9RencontreBryanNuit",

            type: "image",

            titre: "Rencontre nocturne avec Bryan",

            chapitre: 9,

            fichier: "images/galerie/chapitre9/rencontre_bryan_nuit.jpg",

            miniature: "images/galerie/chapitre9/rencontre_bryan_nuit.jpg",

            description: "Tu croises Bryan dans une rue presque déserte.",

            secret: false,

            groupe: "chap9_bryan",

            ordre: 9001

        },

        chap9ConfianceBryan: {

            id: "chap9ConfianceBryan",

            type: "image",

            titre: "Faire confiance à Bryan",

            chapitre: 9,

            fichier: "images/galerie/chapitre9/confiance_bryan.jpg",

            miniature: "images/galerie/chapitre9/confiance_bryan.jpg",

            description: "Tu choisis d'écouter Bryan et de lui accorder une part de confiance.",

            secret: true,

            groupe: "chap9_bryan",

            ordre: 9002

        },

        chap9MefianceBryan: {

            id: "chap9MefianceBryan",

            type: "image",

            titre: "Se méfier de Bryan",

            chapitre: 9,

            fichier: "images/galerie/chapitre9/mefiance_bryan.jpg",

            miniature: "images/galerie/chapitre9/mefiance_bryan.jpg",

            description: "Tu gardes tes distances et considères Bryan comme potentiellement suspect.",

            secret: true,

            groupe: "chap9_bryan",

            ordre: 9003

        },

        chap9PremiersSoupcons: {

            id: "chap9PremiersSoupcons",

            type: "image",

            titre: "Les premiers soupçons",

            chapitre: 9,

            fichier: "images/galerie/chapitre9/premiers_soupcons.jpg",

            miniature: "images/galerie/chapitre9/premiers_soupcons.jpg",

            description: "Les premières pistes et les premiers doutes commencent à prendre forme.",

            secret: true,

            groupe: null,

            ordre: 9004

        },

        chap9AppelPolice: {

            id: "chap9AppelPolice",

            type: "audio",

            titre: "L'appel de la police",

            chapitre: 9,

            fichier: "audio/galerie/appel_police_deposition.mp3",

            miniature: "",

            description: "Le lieutenant Morel t'appelle et te convoque pour recueillir ta déposition.",

            secret: true,

            groupe: "appels_importants",

            ordre: 9005

        },


        /*=================================================
         CHAPITRE 10
        =================================================*/

        chap10Commissariat: {

            id: "chap10Commissariat",

            type: "image",

            titre: "Le commissariat",

            chapitre: 10,

            fichier: "images/fonds/devant_commissaria.jpg",

            miniature: "images/fonds/devant_commissaria.jpg",

            description: "Tu arrives devant le commissariat pour ta déposition.",

            secret: false,

            groupe: "chap10_deposition",

            ordre: 10001

        },

        chap10SalleAttente: {

            id: "chap10SalleAttente",

            type: "image",

            titre: "La salle d'attente",

            chapitre: 10,

            fichier: "images/fonds/salle_attente.jpg",

            miniature: "images/fonds/salle_attente.jpg",

            description: "Plusieurs proches d'Eva attendent déjà au commissariat.",

            secret: false,

            groupe: "chap10_deposition",

            ordre: 10002

        },

        chap10Deposition: {

            id: "chap10Deposition",

            type: "image",

            titre: "La déposition",

            chapitre: 10,

            fichier: "images/fonds/salle_d'interogatoire.jpg",

            miniature: "images/fonds/salle_d'interogatoire.jpg",

            description: "Tu racontes aux enquêteurs ce dont tu te souviens de la soirée.",

            secret: true,

            groupe: "chap10_deposition",

            ordre: 10003

        },

        chap10SouvenirSoiree: {

            id: "chap10SouvenirSoiree",

            type: "image",

            titre: "Souvenir de la soirée",

            chapitre: 10,

            fichier: "images/galerie/chapitre10/souvenir_soiree.jpg",

            miniature: "images/galerie/chapitre10/souvenir_soiree.jpg",

            description: "Un souvenir important revient pendant la déposition.",

            secret: true,

            groupe: "chap10_deposition",

            ordre: 10004

        },


        /*=================================================
         CHAPITRE 11
        =================================================*/

        chap11CouloirReve: {

            id: "chap11CouloirReve",

            type: "image",

            titre: "Le couloir du rêve",

            chapitre: 11,

            fichier: "images/galerie/chapitre11/couloir_reve.jpg",

            miniature: "images/galerie/chapitre11/couloir_reve.jpg",

            description: "L'université apparaît sous une forme étrange dans ton rêve.",

            secret: true,

            groupe: "chap11_reve",

            ordre: 11001

        },

        chap11EvaReve: {

            id: "chap11EvaReve",

            type: "image",

            titre: "Eva dans le rêve",

            chapitre: 11,

            fichier: "images/galerie/chapitre11/eva_reve.jpg",

            miniature: "images/galerie/chapitre11/eva_reve.jpg",

            description: "Eva apparaît devant toi comme si rien ne s'était passé.",

            secret: true,

            groupe: "chap11_reve",

            ordre: 11002

        },

        chap11SuisMoi: {

            id: "chap11SuisMoi",

            type: "image",

            titre: "Suis-moi...",

            chapitre: 11,

            fichier: "images/galerie/chapitre11/suis_moi.jpg",

            miniature: "images/galerie/chapitre11/suis_moi.jpg",

            description: "Eva te demande de la suivre dans le rêve.",

            secret: true,

            groupe: "chap11_reve",

            ordre: 11003

        },

        chap11BrancheInquietante: {

            id: "chap11BrancheInquietante",

            type: "image",

            titre: "Le rêve se fissure",

            chapitre: 11,

            fichier: "images/galerie/chapitre11/reve_inquietant.jpg",

            miniature: "images/galerie/chapitre11/reve_inquietant.jpg",

            description: "Le rêve prend une tournure de plus en plus inquiétante.",

            secret: true,

            groupe: "chap11_reve",

            ordre: 11004

        },


        /*=================================================
         CHAPITRE 12
        =================================================*/

        chap12GroupeParc: {

            id: "chap12GroupeParc",

            type: "image",

            titre: "Le groupe au parc",

            chapitre: 12,

            fichier: "images/fonds/parc.jpg",

            miniature: "images/fonds/parc.jpg",

            description: "Zoé, Bryan, Émelyne et toi vous retrouvez pour parler d'Eva.",

            secret: false,

            groupe: "chap12_eva",

            ordre: 12001

        },

        chap12SouvenirsEva: {

            id: "chap12SouvenirsEva",

            type: "image",

            titre: "Les souvenirs d'Eva",

            chapitre: 12,

            fichier: "images/galerie/chapitre12/souvenirs_eva.jpg",

            miniature: "images/galerie/chapitre12/souvenirs_eva.jpg",

            description: "Le groupe partage ses souvenirs et ses impressions sur Eva.",

            secret: true,

            groupe: "chap12_eva",

            ordre: 12002

        },

        chap12AutreVisageEva: {

            id: "chap12AutreVisageEva",

            type: "image",

            titre: "Un autre visage d'Eva",

            chapitre: 12,

            fichier: "images/galerie/chapitre12/autre_visage_eva.jpg",

            miniature: "images/galerie/chapitre12/autre_visage_eva.jpg",

            description: "Certaines révélations montrent une facette d'Eva que tu connaissais moins.",

            secret: true,

            groupe: "chap12_eva",

            ordre: 12003

        },


        /*=================================================
         CHAPITRE 13
        =================================================*/

        chap13ChezEva: {

            id: "chap13ChezEva",
                        type: "image",

            titre: "Chez Eva",

            chapitre: 13,

            fichier: "images/fonds/maison_eva_exterieur.jpg",

            miniature: "images/fonds/maison_eva_exterieur.jpg",

            description: "Le groupe arrive chez Eva pour entendre ce que Christophe a découvert.",

            secret: false,

            groupe: "chap13_verite",

            ordre: 13001

        },

        chap13InterieurMaisonEva: {

            id: "chap13InterieurMaisonEva",

            type: "image",

            titre: "Dans la maison d'Eva",

            chapitre: 13,

            fichier: "images/fonds/salon_eva.jpg",

            miniature: "images/fonds/salon_eva.jpg",

            description: "Le groupe se réunit dans la maison d'Eva.",

            secret: false,

            groupe: "chap13_verite",

            ordre: 13002

        },

        chap13NouvellePiste: {

            id: "chap13NouvellePiste",

            type: "image",

            titre: "Une nouvelle piste",

            chapitre: 13,

            fichier: "images/galerie/chapitre13/nouvelle_piste.jpg",

            miniature: "images/galerie/chapitre13/nouvelle_piste.jpg",

            description: "Christophe révèle qu'une nouvelle piste vient d'apparaître.",

            secret: true,

            groupe: "chap13_verite",

            ordre: 13003

        },

        chap13VideoSurveillance: {

            id: "chap13VideoSurveillance",

            type: "video",

            titre: "Vidéo de surveillance",

            chapitre: 13,

            fichier: "videos/video_surveillance.mp4",

            miniature: "images/galerie/chapitre13/video_surveillance.jpg",

            description: "La vidéo de surveillance montrée par Christophe.",

            secret: true,

            groupe: "chap13_verite",

            ordre: 13004

        },

        chap13SilhouetteVideo: {

            id: "chap13SilhouetteVideo",

            type: "image",

            titre: "La silhouette de la vidéo",

            chapitre: 13,

            fichier: "images/galerie/chapitre13/silhouette_video_surveillance.jpg",

            miniature: "images/galerie/chapitre13/silhouette_video_surveillance.jpg",

            description: "Une silhouette aperçue dans les images de surveillance.",

            secret: true,

            groupe: "chap13_verite",

            ordre: 13005

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

        /*
         IMPORTANT :
         Si le média est déjà débloqué, on s'arrête ici.

         Cela empêche le message système de réapparaître
         chaque fois que le joueur revisite la même scène.
        */

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

        /*
         Afficher immédiatement l'information dans
         la conversation du jeu.
        */

        this.afficherMessageSystemeDeblocage(
            media
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
     MESSAGE SYSTÈME DE DÉBLOCAGE
    =====================================================*/

    afficherMessageSystemeDeblocage(
        media
    ) {

        if (
            !media
        ) {

            return false;

        }

        /*
         dialogueManager peut ne pas être présent,
         par exemple si galerie.js est utilisé depuis
         une page de menu indépendante.

         Dans ce cas le déblocage reste valide mais
         aucun message n'est ajouté.
        */

        if (
            typeof dialogueManager ===
                "undefined" ||
            !dialogueManager ||
            typeof dialogueManager
                .ajouterMessageSysteme !==
                "function"
        ) {

            return false;

        }

        let libelleType =
            "Nouveau contenu";

        switch (
            media.type
        ) {

            case "image":

                libelleType =
                    "Nouvelle image";

                break;

            case "audio":

                libelleType =
                    "Nouvel audio";

                break;

            case "video":

                libelleType =
                    "Nouvelle vidéo";

                break;

        }

        const titre =
            media.titre ||
            "Contenu inconnu";

        const texte =
            `${libelleType} débloqué dans la galerie : « ${titre} »`;

        try {

            /*
             CORRECTION :
             dialogue.js expose ajouterMessageSysteme()
             et non systeme().
            */

            dialogueManager
                .ajouterMessageSysteme(
                    texte,
                    {
                        /*
                         Le message de galerie reste
                         volontairement silencieux afin
                         de ne pas perturber les scènes
                         contenant de l'audio.
                        */
                        son:
                            "aucun"
                    }
                );

            return true;

        }
        catch (
            erreur
        ) {

            console.warn(
                "galerieManager : impossible d'afficher le message système de déblocage.",
                erreur
            );

            return false;

        }

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