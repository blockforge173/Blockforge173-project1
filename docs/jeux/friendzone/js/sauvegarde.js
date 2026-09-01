"use strict";

/*=========================================================
 FRIENDZONÉ REBORN
 sauvegarde.js

 Gestion :
 - sauvegarde multi-slot ;
 - slot actif ;
 - sauvegarde automatique ;
 - chargement ;
 - suppression ;
 - migration de l'ancienne sauvegarde "save" ;
 - recherche de la sauvegarde la plus récente.
=========================================================*/

const sauvegardeManager = {

    /*=====================================================
     CONFIGURATION
    =====================================================*/

    prefixeSlots: "friendzoneRebornSave_slot_",

    cleSlotActif: "friendzoneRebornSave_slot_actif",

    ancienneCle: "save",

    nombreSlots: 3,


    /*=====================================================
     CRÉER LE JOUEUR PAR DÉFAUT
    =====================================================*/

    creerJoueurParDefaut() {

        return {

            nom: "",

            // Relations et confiance
            relationEva: 0,
            confianceEva: 0,
            relationZoe: 0,
            confianceZoe: 0,
            relationEmelyne: 0,
            confianceEmelyne: 0,
            relationBryan: 0,
            confianceBryan: 0,
            relationChristophe: 0,
            confianceChristophe: 0,
            relationLena: 0,
            confianceLena: 0,

            // Traits / statistiques
            gentillesse: 0,
            courage: 0,
            humour: 0,
            audace: 0,
            prudence: 0,
            intuition: 0,
            empathie: 0,
            jalousieEva: 0,

            // Ancienne faute conservée uniquement pour compatibilité.
            jalousiEva: 0,

            insuietudePolice: 0,
            culpabiliteDisparitionEva: 0,
            culpabiliteDeposition: 0,
            culpabiliteReve: 0,
            culpabiliteChapitre12: 0,
            espoirRetourEva: 0,

            // Rencontres et informations de base
            rencontreEva: false,
            rencontreZoe: false,
            rencontreEmelyne: false,
            rencontreBryan: false,

            numeroEva: false,
            rendezVousEva: false,
            baladeEmelyne: false,
            aideZoeCafeteria: false,
            disputeBryan: false,
            repasSeulEva: false,

            infoEvaZoeAnciennesAmies: false,

            // Chapitres 5 à 7
            refusRepasEva: false,
            repasEvaTresProche: false,
            repasGroupe: false,
            repasEvaRate: false,
            repasEvaReussi: false,
            repasGroupeReussi: false,

            evaAParleDeSesPeurs: false,
            evaAParleDeSonAvenir: false,

            soireeHorreurAcceptee: false,
            emelynePresenteSoiree: false,
            procheEmelyneSoiree: false,
            procheEvaSoiree: false,

            filmChoisi: "",

            ideeSortieVacances: false,

            baiserEvaAccepte: false,
            baiserEvaHesitation: false,
            baiserEvaRefuse: false,

            demandeMessageRetourEva: false,
            evaMessageRetourNonRecu: false,

            // Chapitres 8 à 10
            messageEvaMatinEnvoye: false,

            zoeContacteePourEva: false,
            zoeVacontacterParentsEva: false,

            christopheInformePromesseEva: false,

            convocationPoliceAcceptee: false,

            bryanApercuEva: false,
            bryanEtaiPresEva: false,
            bryanSuspectAuxYeuxJoueur: false,

            directionEvaSelonBryan: "",

            temoignageBryanNote: false,

            emelyneAParleDeSonPasse: false,

            telephoneMontrePolice: false,
            dernierMessageEvaConfirmePolice: false,

            temoignageEvaSemblaitNormale: false,
            temoignageJoueurIncertain: false,

            temoignageBryanTransmis: false,
            temoignageBryanTransmisPrecis: false,

            soupconsBryanTransmisPolice: false,

            joueurReconnaitAttachementEva: false,
            joueurMinimiseAttachementEva: false,

            // Chapitre 11
            brancheReveEva: "",

            joueurAccepteReve: false,
            joueurResisteReve: false,
            joueurTenteRetenirEvaReve: false,

            reveEvaNote: false,
            revePromesseRegardEva: false,

            joueurReconnaitMeconnaitreEva: false,

            joueurAvoueCulpabiliteZoe: false,
            joueurAvoueReveZoe: false,
            joueurCacheReveZoe: false,

            joueurDissimuleOrigineInformation: false,

            zoeConnaitContenuReve: false,

            // Chapitre 12
            joueurAccepteReunion: false,

            conversationZoeChapitre12: false,
            conversationEmelyneChapitre12: false,
            conversationBryanChapitre12: false,

            joueurEspereAvanceeEnquete: false,
            joueurRestePrudent: false,

            // Chapitre 13
            infoEvaCarnet: false,
            infoEvaSentimentsJoueur: false

        };

    },


    /*=====================================================
     VÉRIFIER UN NUMÉRO DE SLOT
    =====================================================*/

    slotValide(slot) {

        const numero =
            Number(
                slot
            );

        return (
            Number.isInteger(numero) &&
            numero >= 1 &&
            numero <= this.nombreSlots
        );

    },


    /*=====================================================
     OBTENIR LA CLÉ D'UN SLOT
    =====================================================*/

    obtenirCleSlot(slot) {

        if (
            !this.slotValide(slot)
        ) {
            return null;
        }

        return (
            this.prefixeSlots +
            Number(slot)
        );

    },


    /*=====================================================
     DÉFINIR LE SLOT ACTIF
    =====================================================*/

    definirSlotActif(slot) {

        if (
            !this.slotValide(slot)
        ) {

            console.warn(
                "sauvegardeManager : slot invalide :",
                slot
            );

            return false;

        }

        try {

            localStorage.setItem(
                this.cleSlotActif,
                String(
                    Number(slot)
                )
            );

            return true;

        }
        catch (erreur) {

            console.error(
                "Impossible de définir le slot actif :",
                erreur
            );

            return false;

        }

    },


    /*=====================================================
     OBTENIR LE SLOT ACTIF
    =====================================================*/

    obtenirSlotActif() {

        const valeur =
            localStorage.getItem(
                this.cleSlotActif
            );

        if (
            valeur === null
        ) {
            return null;
        }

        const slot =
            Number(
                valeur
            );

        if (
            !this.slotValide(slot)
        ) {

            localStorage.removeItem(
                this.cleSlotActif
            );

            return null;

        }

        return slot;

    },


    /*=====================================================
     SUPPRIMER LE SLOT ACTIF
    =====================================================*/

    supprimerSlotActif() {

        localStorage.removeItem(
            this.cleSlotActif
        );

    },


    /*=====================================================
     CRÉER L'OBJET DE SAUVEGARDE
    =====================================================*/

    creerSauvegarde(
        donnees,
        slot
    ) {

        return {

            version: "0.2",

            slot:
                Number(slot),

            date:
                new Date()
                    .toISOString(),

            chapitre:
                Number.isInteger(
                    donnees?.chapitre
                )
                    ? donnees.chapitre
                    : 0,

            scene:
                donnees?.scene ||
                "intro",

            joueur: {

                ...this
                    .creerJoueurParDefaut(),

                ...(
                    donnees?.joueur ||
                    {}
                )

            },

            fond:
                donnees?.fond ||
                "",

            musique:
                donnees?.musique ||
                "",

            ambiance:
                donnees?.ambiance ||
                ""

        };

    },


    /*=====================================================
     SAUVEGARDER

     Si aucun slot n'est donné,
     utilise automatiquement le slot actif.
    =====================================================*/

    sauvegarder(
        donnees,
        slot = null
    ) {

        if (!donnees) {

            console.warn(
                "sauvegardeManager : aucune donnée à sauvegarder."
            );

            return false;

        }

        const slotCible =
            slot !== null
                ? Number(slot)
                : this.obtenirSlotActif();

        if (
            !this.slotValide(
                slotCible
            )
        ) {

            console.warn(
                "sauvegardeManager : aucun slot actif valide."
            );

            return false;

        }

        const cle =
            this.obtenirCleSlot(
                slotCible
            );

        if (!cle) {
            return false;
        }

        const sauvegarde =
            this.creerSauvegarde(
                donnees,
                slotCible
            );

        try {

            localStorage.setItem(
                cle,
                JSON.stringify(
                    sauvegarde
                )
            );

            /*
             Le slot utilisé devient automatiquement
             le slot actif.
            */

            this.definirSlotActif(
                slotCible
            );

            return true;

        }
        catch (erreur) {

            console.error(
                "Erreur de sauvegarde :",
                erreur
            );

            return false;

        }

    },


    /*=====================================================
     NORMALISER UNE SAUVEGARDE

     Permet aussi de garder une compatibilité avec
     les anciennes sauvegardes.
    =====================================================*/

    normaliserSauvegarde(
        sauvegarde,
        slot
    ) {

        if (
            !sauvegarde ||
            typeof sauvegarde !==
                "object"
        ) {
            return null;
        }

        return {

            version:
                sauvegarde.version ||
                "0.1",

            slot:
                this.slotValide(
                    sauvegarde.slot
                )
                    ? sauvegarde.slot
                    : Number(slot),

            date:
                sauvegarde.date ||
                null,

            chapitre:
                Number.isInteger(
                    sauvegarde.chapitre
                )
                    ? sauvegarde.chapitre
                    : 0,

            scene:
                sauvegarde.scene ||
                "intro",

            joueur: {

                ...this
                    .creerJoueurParDefaut(),

                ...(
                    sauvegarde.joueur ||
                    {}
                )

            },

            fond:
                sauvegarde.fond ||
                "",

            musique:
                sauvegarde.musique ||
                "",

            ambiance:
                sauvegarde.ambiance ||
                ""

        };

    },
        /*=====================================================
     CHARGER

     Si aucun slot n'est donné,
     utilise le slot actif.
    =====================================================*/

    charger(
        slot = null
    ) {

        const slotCible =
            slot !== null
                ? Number(slot)
                : this.obtenirSlotActif();

        if (
            !this.slotValide(
                slotCible
            )
        ) {
            return null;
        }

        const cle =
            this.obtenirCleSlot(
                slotCible
            );

        const contenu =
            localStorage.getItem(
                cle
            );

        if (!contenu) {
            return null;
        }

        try {

            const sauvegarde =
                JSON.parse(
                    contenu
                );

            const sauvegardeNormalisee =
                this.normaliserSauvegarde(
                    sauvegarde,
                    slotCible
                );

            if (
                !sauvegardeNormalisee
            ) {
                return null;
            }

            /*
             Le slot chargé devient le slot actif.
            */

            this.definirSlotActif(
                slotCible
            );

            return sauvegardeNormalisee;

        }
        catch (erreur) {

            console.error(
                "Sauvegarde invalide dans le slot " +
                slotCible +
                " :",
                erreur
            );

            return null;

        }

    },


    /*=====================================================
     VÉRIFIER SI UN SLOT EXISTE
    =====================================================*/

    existe(
        slot = null
    ) {

        /*
         Sans argument :
         vérifie le slot actif.
        */

        if (
            slot === null
        ) {

            const actif =
                this.obtenirSlotActif();

            if (
                !this.slotValide(
                    actif
                )
            ) {
                return false;
            }

            return this.existe(
                actif
            );

        }

        if (
            !this.slotValide(slot)
        ) {
            return false;
        }

        const cle =
            this.obtenirCleSlot(
                slot
            );

        return (
            localStorage.getItem(
                cle
            ) !== null
        );

    },


    /*=====================================================
     VÉRIFIER SI AU MOINS UNE SAUVEGARDE EXISTE
    =====================================================*/

    existeAuMoinsUne() {

        for (
            let slot = 1;
            slot <= this.nombreSlots;
            slot++
        ) {

            if (
                this.existe(slot)
            ) {
                return true;
            }

        }

        return false;

    },


    /*=====================================================
     SUPPRIMER UN SLOT
    =====================================================*/

    supprimer(
        slot = null
    ) {

        const slotCible =
            slot !== null
                ? Number(slot)
                : this.obtenirSlotActif();

        if (
            !this.slotValide(
                slotCible
            )
        ) {
            return false;
        }

        const cle =
            this.obtenirCleSlot(
                slotCible
            );

        try {

            localStorage.removeItem(
                cle
            );

            if (
                this.obtenirSlotActif() ===
                slotCible
            ) {

                this.supprimerSlotActif();

            }

            return true;

        }
        catch (erreur) {

            console.error(
                "Impossible de supprimer le slot " +
                slotCible +
                " :",
                erreur
            );

            return false;

        }

    },


    /*=====================================================
     SUPPRIMER TOUTES LES SAUVEGARDES

     Ne touche PAS aux succès ni aux paramètres.
    =====================================================*/

    supprimerToutes() {

        for (
            let slot = 1;
            slot <= this.nombreSlots;
            slot++
        ) {

            const cle =
                this.obtenirCleSlot(
                    slot
                );

            if (cle) {

                localStorage.removeItem(
                    cle
                );

            }

        }

        this.supprimerSlotActif();

    },


    /*=====================================================
     RÉCUPÉRER LES INFORMATIONS D'UN SLOT
    =====================================================*/

    obtenirInfosSlot(
        slot
    ) {

        if (
            !this.slotValide(slot)
        ) {
            return null;
        }

        const sauvegarde =
            this.chargerSansChangerSlotActif(
                slot
            );

        if (!sauvegarde) {
            return null;
        }

        return {

            slot:
                Number(slot),

            date:
                sauvegarde.date ||
                null,

            chapitre:
                sauvegarde.chapitre,

            scene:
                sauvegarde.scene,

            nom:
                sauvegarde.joueur?.nom ||
                "Joueur"

        };

    },


    /*=====================================================
     CHARGER SANS MODIFIER LE SLOT ACTIF

     Utilisé notamment par le menu pour afficher
     les informations de chaque sauvegarde.
    =====================================================*/

    chargerSansChangerSlotActif(
        slot
    ) {

        if (
            !this.slotValide(slot)
        ) {
            return null;
        }

        const cle =
            this.obtenirCleSlot(
                slot
            );

        if (!cle) {
            return null;
        }

        const contenu =
            localStorage.getItem(
                cle
            );

        if (!contenu) {
            return null;
        }

        try {

            const sauvegarde =
                JSON.parse(
                    contenu
                );

            return this.normaliserSauvegarde(
                sauvegarde,
                slot
            );

        }
        catch (erreur) {

            console.error(
                "Impossible de lire le slot " +
                slot +
                " :",
                erreur
            );

            return null;

        }

    },


    /*=====================================================
     LISTER LES SAUVEGARDES
    =====================================================*/

    lister() {

        const sauvegardes =
            [];

        for (
            let slot = 1;
            slot <= this.nombreSlots;
            slot++
        ) {

            const sauvegarde =
                this.chargerSansChangerSlotActif(
                    slot
                );

            sauvegardes.push({

                slot,

                existe:
                    sauvegarde !== null,

                sauvegarde

            });

        }

        return sauvegardes;

    },
        /*=====================================================
     OBTENIR LES INFORMATIONS D'UN SLOT

     Utilisé plus tard par le menu.
    =====================================================*/

    obtenirInformationsSlot(
        slot
    ) {

        if (
            !this.slotValide(slot)
        ) {
            return null;
        }

        if (
            !this.existe(slot)
        ) {

            return {

                slot:
                    Number(slot),

                vide:
                    true,

                nom:
                    "",

                chapitre:
                    null,

                scene:
                    "",

                date:
                    null

            };

        }

        const sauvegarde =
            this.chargerSansActiver(
                slot
            );

        if (!sauvegarde) {

            return {

                slot:
                    Number(slot),

                vide:
                    true,

                invalide:
                    true,

                nom:
                    "",

                chapitre:
                    null,

                scene:
                    "",

                date:
                    null

            };

        }

        return {

            slot:
                Number(slot),

            vide:
                false,

            nom:
                sauvegarde
                    .joueur
                    ?.nom ||
                "Joueur",

            chapitre:
                sauvegarde
                    .chapitre,

            scene:
                sauvegarde
                    .scene,

            date:
                sauvegarde
                    .date,

            version:
                sauvegarde
                    .version

        };

    },


    /*=====================================================
     CHARGER SANS MODIFIER LE SLOT ACTIF

     Très utile pour afficher les slots
     dans le menu.
    =====================================================*/

    chargerSansActiver(
        slot
    ) {

        if (
            !this.slotValide(slot)
        ) {
            return null;
        }

        const cle =
            this.obtenirCleSlot(
                slot
            );

        const contenu =
            localStorage.getItem(
                cle
            );

        if (!contenu) {
            return null;
        }

        try {

            const sauvegarde =
                JSON.parse(
                    contenu
                );

            return this
                .normaliserSauvegarde(
                    sauvegarde,
                    slot
                );

        }
        catch (erreur) {

            console.error(
                "Sauvegarde invalide dans le slot " +
                slot +
                " :",
                erreur
            );

            return null;

        }

    },


    /*=====================================================
     OBTENIR TOUS LES SLOTS

     Retourne toujours 3 éléments.
    =====================================================*/

    obtenirTousLesSlots() {

        const slots =
            [];

        for (
            let slot = 1;
            slot <= this.nombreSlots;
            slot++
        ) {

            slots.push(
                this.obtenirInformationsSlot(
                    slot
                )
            );

        }

        return slots;

    },


    /*=====================================================
     TROUVER LA SAUVEGARDE LA PLUS RÉCENTE
    =====================================================*/

    obtenirSlotLePlusRecent() {

        let slotRecent =
            null;

        let dateRecente =
            0;

        for (
            let slot = 1;
            slot <= this.nombreSlots;
            slot++
        ) {

            const sauvegarde =
                this.chargerSansActiver(
                    slot
                );

            if (!sauvegarde) {
                continue;
            }

            const timestamp =
                sauvegarde.date
                    ? new Date(
                        sauvegarde.date
                    ).getTime()
                    : 0;

            if (
                slotRecent === null ||
                timestamp > dateRecente
            ) {

                slotRecent =
                    slot;

                dateRecente =
                    timestamp;

            }

        }

        return slotRecent;

    },


    /*=====================================================
     CHARGER LA SAUVEGARDE LA PLUS RÉCENTE
    =====================================================*/

    chargerPlusRecente() {

        const slot =
            this.obtenirSlotLePlusRecent();

        if (!slot) {
            return null;
        }

        return this.charger(
            slot
        );

    },


    /*=====================================================
     TROUVER LE PREMIER SLOT VIDE
    =====================================================*/

    obtenirPremierSlotVide() {

        for (
            let slot = 1;
            slot <= this.nombreSlots;
            slot++
        ) {

            if (
                !this.existe(slot)
            ) {
                return slot;
            }

        }

        return null;

    },


    /*=====================================================
     MIGRATION DE L'ANCIENNE SAUVEGARDE

     Ancien système :
     localStorage["save"]

     Nouveau système :
     friendzoneRebornSave_slot_1
    =====================================================*/

    migrerAncienneSauvegarde() {

        const ancienne =
            localStorage.getItem(
                this.ancienneCle
            );

        if (!ancienne) {
            return false;
        }

        /*
         Si le slot 1 existe déjà,
         on ne l'écrase surtout pas.
        */

        if (
            this.existe(1)
        ) {

            console.warn(
                "Une ancienne sauvegarde existe, mais le slot 1 est déjà utilisé."
            );

            return false;

        }

        try {

            const donnees =
                JSON.parse(
                    ancienne
                );

            const sauvegarde =
                this.normaliserSauvegarde(
                    donnees,
                    1
                );

            if (!sauvegarde) {
                return false;
            }

            sauvegarde.version =
                "0.2";

            sauvegarde.slot =
                1;

            /*
             On conserve l'ancienne date
             lorsqu'elle existe.
            */

            if (!sauvegarde.date) {

                sauvegarde.date =
                    new Date()
                        .toISOString();

            }

            localStorage.setItem(
                this.obtenirCleSlot(1),
                JSON.stringify(
                    sauvegarde
                )
            );
                        this.definirSlotActif(
                1
            );

            /*
             L'ancienne clé n'est supprimée
             qu'une fois la migration réussie.
            */

            localStorage.removeItem(
                this.ancienneCle
            );

            console.log(
                "Ancienne sauvegarde migrée vers le slot 1."
            );

            return true;

        }
        catch (erreur) {

            console.error(
                "Impossible de migrer l'ancienne sauvegarde :",
                erreur
            );

            return false;

        }

    },


    /*=====================================================
     INITIALISER LE SYSTÈME DE SAUVEGARDE
    =====================================================*/

    initialiser() {

        /*
         Tente de récupérer automatiquement
         l'ancienne sauvegarde.
        */

        this.migrerAncienneSauvegarde();

        /*
         Si aucun slot actif n'est défini,
         mais qu'une sauvegarde existe,
         on active la plus récente.
        */

        const slotActif =
            this.obtenirSlotActif();

        if (
            !this.slotValide(
                slotActif
            )
        ) {

            const slotRecent =
                this.obtenirSlotLePlusRecent();

            if (
                this.slotValide(
                    slotRecent
                )
            ) {

                this.definirSlotActif(
                    slotRecent
                );

            }

        }

        console.log(
            "sauvegardeManager initialisé."
        );

    },


    /*=====================================================
     CRÉER UNE NOUVELLE PARTIE DANS UN SLOT

     Cette fonction prépare le slot.
     Le moteur créera ensuite réellement
     les données de la nouvelle partie.
    =====================================================*/

    preparerNouvellePartie(
        slot
    ) {

        if (
            !this.slotValide(slot)
        ) {

            console.warn(
                "Impossible de préparer la nouvelle partie : slot invalide."
            );

            return false;

        }

        /*
         Le slot devient immédiatement actif.
        */

        this.definirSlotActif(
            slot
        );

        /*
         Si une sauvegarde existait déjà dans ce slot,
         elle est supprimée.
        */

        const cle =
            this.obtenirCleSlot(
                slot
            );

        if (cle) {

            localStorage.removeItem(
                cle
            );

        }

        return true;

    },


    /*=====================================================
     DUPLIQUER UNE SAUVEGARDE

     Permet de copier un slot vers un autre
     sans modifier le slot source.
    =====================================================*/

    dupliquer(
        slotSource,
        slotDestination
    ) {

        if (
            !this.slotValide(
                slotSource
            ) ||
            !this.slotValide(
                slotDestination
            )
        ) {

            console.warn(
                "Impossible de dupliquer la sauvegarde : slot invalide."
            );

            return false;

        }

        if (
            Number(slotSource) ===
            Number(slotDestination)
        ) {

            console.warn(
                "Le slot source et le slot destination sont identiques."
            );

            return false;

        }

        const sauvegarde =
            this.chargerSansActiver(
                slotSource
            );

        if (!sauvegarde) {

            console.warn(
                "Aucune sauvegarde à copier dans le slot " +
                slotSource +
                "."
            );

            return false;

        }

        const copie = {

            ...sauvegarde,

            slot:
                Number(
                    slotDestination
                ),

            date:
                new Date()
                    .toISOString(),

            joueur: {

                ...this
                    .creerJoueurParDefaut(),

                ...(
                    sauvegarde.joueur ||
                    {}
                )

            }

        };

        try {

            localStorage.setItem(
                this.obtenirCleSlot(
                    slotDestination
                ),
                JSON.stringify(
                    copie
                )
            );

            return true;

        }
        catch (erreur) {

            console.error(
                "Impossible de dupliquer la sauvegarde :",
                erreur
            );

            return false;

        }

    },


    /*=====================================================
     RENOMMER LE JOUEUR D'UN SLOT
    =====================================================*/

    renommerJoueur(
        slot,
        nouveauNom
    ) {

        if (
            !this.slotValide(slot)
        ) {
            return false;
        }

        const nom =
            String(
                nouveauNom ||
                ""
            )
                .trim();

        if (
            nom.length < 2
        ) {

            console.warn(
                "Le nouveau nom du joueur est invalide."
            );

            return false;

        }

        const sauvegarde =
            this.chargerSansActiver(
                slot
            );

        if (!sauvegarde) {
            return false;
        }

        sauvegarde.joueur = {

            ...this
                .creerJoueurParDefaut(),

            ...(
                sauvegarde.joueur ||
                {}
            ),

            nom:
                nom.substring(
                    0,
                    20
                )

        };

        sauvegarde.date =
            new Date()
                .toISOString();

        try {

            localStorage.setItem(
                this.obtenirCleSlot(
                    slot
                ),
                JSON.stringify(
                    sauvegarde
                )
            );

            return true;

        }
        catch (erreur) {

            console.error(
                "Impossible de renommer le joueur :",
                erreur
            );

            return false;

        }

    },


    /*=====================================================
     VÉRIFIER L'INTÉGRITÉ D'UNE SAUVEGARDE
    =====================================================*/

    verifierIntegrite(
        sauvegarde
    ) {

        if (
            !sauvegarde ||
            typeof sauvegarde !==
                "object"
        ) {
            return false;
        }

        if (
            !Number.isInteger(
                sauvegarde.chapitre
            )
        ) {
            return false;
        }

        if (
            typeof sauvegarde.scene !==
                "string"
        ) {
            return false;
        }

        if (
            !sauvegarde.joueur ||
            typeof sauvegarde.joueur !==
                "object"
        ) {
            return false;
        }

        return true;

    },
        /*=====================================================
     MIGRATION DE L'ANCIENNE SAUVEGARDE

     Ancien système :
     localStorage["save"]

     Nouveau système :
     friendzoneRebornSave_slot_1
    =====================================================*/

    migrerAncienneSauvegarde() {

        const ancienne =
            localStorage.getItem(
                this.ancienneCle
            );

        if (!ancienne) {
            return false;
        }

        /*
         Si le slot 1 existe déjà,
         on ne l'écrase surtout pas.
        */

        if (
            this.existe(1)
        ) {

            console.warn(
                "Une ancienne sauvegarde existe, mais le slot 1 est déjà utilisé."
            );

            return false;

        }

        try {

            const donnees =
                JSON.parse(
                    ancienne
                );

            const sauvegarde =
                this.normaliserSauvegarde(
                    donnees,
                    1
                );

            if (!sauvegarde) {
                return false;
            }

            sauvegarde.version =
                "0.2";

            sauvegarde.slot =
                1;

            /*
             On conserve l'ancienne date
             lorsqu'elle existe.
            */

            if (!sauvegarde.date) {

                sauvegarde.date =
                    new Date()
                        .toISOString();

            }

            localStorage.setItem(
                this.obtenirCleSlot(1),
                JSON.stringify(
                    sauvegarde
                )
            );

            this.definirSlotActif(
                1
            );

            /*
             On supprime l'ancienne clé
             uniquement après une migration réussie.
            */

            localStorage.removeItem(
                this.ancienneCle
            );

            console.log(
                "Ancienne sauvegarde migrée vers le slot 1."
            );

            return true;

        }
        catch (erreur) {

            console.error(
                "Impossible de migrer l'ancienne sauvegarde :",
                erreur
            );

            return false;

        }

    },


    /*=====================================================
     INITIALISATION DU SYSTÈME DE SAUVEGARDE
    =====================================================*/

    initialiser() {

        /*
         Essaie de récupérer automatiquement
         une ancienne sauvegarde.
        */

        this.migrerAncienneSauvegarde();

        /*
         Si aucun slot actif n'est défini mais
         qu'une sauvegarde existe, on utilise
         la plus récente.
        */

        if (
            !this.obtenirSlotActif()
        ) {

            const slotRecent =
                this.obtenirSlotLePlusRecent();

            if (slotRecent) {

                this.definirSlotActif(
                    slotRecent
                );

            }

        }

        console.log(
            "sauvegardeManager initialisé.",
            "Slot actif :",
            this.obtenirSlotActif()
        );

    }

};


/*=========================================================
 INITIALISATION AUTOMATIQUE
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        sauvegardeManager
            .initialiser();

    }
);