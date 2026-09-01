"use strict";

const conditionsManager = {

    verifierCondition(
        condition,
        joueur
    ) {

        if (!condition) {
            return true;
        }

        const valeurActuelle =
            joueur[condition.variable];

        const valeurAttendue =
            condition.valeur;

        switch (
            condition.operateur || "=="
        ) {

            case ">":
                return valeurActuelle > valeurAttendue;

            case ">=":
                return valeurActuelle >= valeurAttendue;

            case "<":
                return valeurActuelle < valeurAttendue;

            case "<=":
                return valeurActuelle <= valeurAttendue;

            case "===":
                return valeurActuelle === valeurAttendue;

            case "!==":
                return valeurActuelle !== valeurAttendue;

            case "!=":
                return valeurActuelle != valeurAttendue;

            default:
                return valeurActuelle == valeurAttendue;

        }

    },


    /*=====================================================
     VÉRIFIER PLUSIEURS CONDITIONS
    =====================================================*/

    verifierConditions(
        conditions,
        joueur
    ) {

        if (!conditions) {
            return true;
        }

        /*
         Une condition unique peut être fournie
         directement sous forme d'objet.
        */

        if (!Array.isArray(conditions)) {

            return this.verifierCondition(
                conditions,
                joueur
            );

        }

        /*
         Si plusieurs conditions sont présentes,
         elles doivent toutes être vraies.
        */

        return conditions.every(
            condition =>
                this.verifierCondition(
                    condition,
                    joueur
                )
        );

    },


    /*=====================================================
     VÉRIFIER L'ACCÈS À UNE SCÈNE
    =====================================================*/

    verifierAccesScene(
        scene,
        joueur
    ) {

        return this.verifierConditions(
            scene.condition,
            joueur
        );

    },


    /*=====================================================
     OBTENIR UNE REDIRECTION DE SCÈNE

     Deux formats sont supportés.

     FORMAT 1 :

     "redirections": [
         {
             "condition": {
                 "variable": "relationEva",
                 "operateur": ">=",
                 "valeur": 5
             },
             "next": "scenePositive"
         },
         {
             "next": "sceneNormale"
         }
     ]


     FORMAT 2 :

     "conditions": [
         {
             "si": {
                 "variable": "confianceEva",
                 "operateur": "<=",
                 "valeur": 2
             },
             "next": "arriveeEvaFroide"
         },
         {
             "sinon": "arriveeEvaPositive"
         }
     ]
    =====================================================*/

    obtenirRedirection(
        scene,
        joueur
    ) {

        /*
         Format moderne utilisant
         scene.redirections.
        */

        if (
            Array.isArray(
                scene.redirections
            )
        ) {

            for (
                const redirection
                of scene.redirections
            ) {

                if (
                    !redirection.condition ||
                    this.verifierConditions(
                        redirection.condition,
                        joueur
                    )
                ) {

                    return (
                        redirection.next ||
                        null
                    );

                }

            }

        }


        /*
         Compatibilité avec le format déjà utilisé
         dans certains chapitres :

         "conditions": [
             {
                 "si": {...},
                 "next": "sceneA"
             },
             {
                 "sinon": "sceneB"
             }
         ]
        */

        if (
            Array.isArray(
                scene.conditions
            )
        ) {

            let destinationSinon =
                null;

            for (
                const branche
                of scene.conditions
            ) {

                if (
                    !branche ||
                    typeof branche !==
                        "object"
                ) {
                    continue;
                }


                /*
                 On mémorise le "sinon".

                 On ne l'utilise qu'après avoir
                 vérifié toutes les conditions "si".
                */

                if (
                    branche.sinon
                ) {

                    destinationSinon =
                        branche.sinon;

                    continue;

                }


                /*
                 Branche conditionnelle.
                */

                if (
                    branche.si &&
                    this.verifierConditions(
                        branche.si,
                        joueur
                    )
                ) {

                    return (
                        branche.next ||
                        null
                    );

                }

            }


            /*
             Aucune condition "si" n'a été validée.
             On utilise donc la branche "sinon"
             lorsqu'elle existe.
            */

            return destinationSinon;

        }


        return null;

    },


    /*=====================================================
     PRÉPARER LES CHOIX D'UNE SCÈNE
    =====================================================*/

    preparerChoix(
        choix,
        joueur
    ) {

        return choix

            /*
             Première étape :
             retirer les choix dont la condition
             d'apparition n'est pas valide.
            */

            .filter(item => {

                return this.verifierConditions(
                    item.condition,
                    joueur
                );

            })


            /*
             Deuxième étape :
             gérer les choix verrouillés.
            */

            .map(item => {

                const copie = {
                    ...item
                };


                if (
                    item.conditionVerrouillage
                ) {

                    copie.verrouille =
                        !this.verifierConditions(
                            item.conditionVerrouillage,
                            joueur
                        );


                    /*
                     Si le choix est verrouillé et qu'un
                     texte alternatif existe, on l'utilise.
                    */

                    if (
                        copie.verrouille &&
                        item.texteVerrouille
                    ) {

                        copie.texte =
                            item.texteVerrouille;

                    }

                }


                return copie;

            });

    },


    /*=====================================================
     APPLIQUER UN EFFET
    =====================================================*/

    appliquerEffet(
        effet,
        joueur
    ) {

        if (!effet) {
            return;
        }


        for (
            const [variable, valeur]
            of Object.entries(effet)
        ) {

            /*
             Pour une valeur numérique,
             on considère qu'il s'agit
             d'une modification de statistique.

             Exemple :

             "relationEva": 2

             ajoute +2 à relationEva.
            */

            if (
                typeof valeur ===
                "number"
            ) {

                /*
                 Si la variable n'existe pas encore
                 ou n'est pas numérique,
                 elle commence à zéro.
                */

                if (
                    typeof joueur[variable]
                    !== "number"
                ) {

                    joueur[variable] =
                        0;

                }


                joueur[variable] +=
                    valeur;

            }

            else {

                /*
                 Pour les booléens et les chaînes,
                 on remplace directement la valeur.

                 Exemple :

                 "rendezVousEva": true

                 ou

                 "filmChoisi": "horreur"
                */

                joueur[variable] =
                    valeur;

            }

        }

    },


    /*=====================================================
     APPLIQUER PLUSIEURS EFFETS
    =====================================================*/

    appliquerEffets(
        effets,
        joueur
    ) {

        if (
            !Array.isArray(
                effets
            )
        ) {
            return;
        }


        effets.forEach(
            effet => {

                /*
                 Un effet peut lui-même posséder
                 une condition.
                */

                if (
                    !effet.condition ||
                    this.verifierConditions(
                        effet.condition,
                        joueur
                    )
                ) {

                    this.appliquerEffet(
                        effet.effet ||
                        effet.valeurs,
                        joueur
                    );

                }

            }
        );

    },


    /*=====================================================
     RÉSOUDRE LA DESTINATION D'UN CHOIX
    =====================================================*/

    resoudreDestination(
        choix,
        joueur
    ) {

        /*
         Destination simple :

         "next": "sceneSuivante"
        */

        if (
            choix.next
        ) {

            return choix.next;

        }


        /*
         Destination conditionnelle :

         "destinations": [
             {
                 "condition": {...},
                 "next": "sceneA"
             },
             {
                 "next": "sceneB"
             }
         ]
        */

        if (
            Array.isArray(
                choix.destinations
            )
        ) {

            for (
                const destination
                of choix.destinations
            ) {

                if (
                    !destination.condition ||
                    this.verifierConditions(
                        destination.condition,
                        joueur
                    )
                ) {

                    return destination.next;

                }

            }

        }


        return null;

    }

};