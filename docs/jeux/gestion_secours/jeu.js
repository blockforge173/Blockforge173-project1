"use strict";

/*
 * Gestion Secours - moteur commun du jeu
 * À charger avec : <script src="jeu.js" defer></script>
 */

(function () {
  const STORAGE_KEY = "gestionSecours.sauvegarde.v1";

  const ETAPES = [
    "Appel reçu et qualifié",
    "Moyens sélectionnés",
    "Départ des secours",
    "Arrivée sur les lieux",
    "Traitement de l'intervention",
    "Transport ou renforts si nécessaire",
    "Retour disponible"
  ];

  const APPELS_INITIAUX = [
    {
      id: "appel-1",
      type: "Feu d'appartement",
      categorie: "INCENDIE",
      adresse: "12 rue des Lilas",
      priorite: "Urgence absolue",
      couleur: "red",
      details:
        "Fumée importante. Une personne serait bloquée au deuxième étage.",
      creeLe: Date.now()
    },
    {
      id: "appel-2",
      type: "Accident de circulation",
      categorie: "ACCIDENT_ROUTE",
      adresse: "D47 — PK 18",
      priorite: "Urgent",
      couleur: "orange",
      details:
        "Deux véhicules impliqués. Une victime blessée et une circulation partiellement bloquée.",
      creeLe: Date.now()
    },
    {
      id: "appel-3",
      type: "Malaise à domicile",
      categorie: "SECOURS_PERSONNE",
      adresse: "8 avenue Victor-Hugo",
      priorite: "Secours à personne",
      couleur: "blue",
      details:
        "Homme de 67 ans conscient avec une douleur thoracique.",
      creeLe: Date.now()
    }
  ];

  const VEHICULES_INITIAUX = [
    {
      id: "FPT-01",
      nom: "FPT 01",
      role: "Incendie",
      categorie: "INCENDIE",
      statut: "Disponible"
    },
    {
      id: "VSAV-01",
      nom: "VSAV 01",
      role: "Secours à personne",
      categorie: "SECOURS_PERSONNE",
      statut: "Disponible"
    },
    {
      id: "EPA-01",
      nom: "EPA 01",
      role: "Moyen aérien",
      categorie: "MOYEN_AERIEN",
      statut: "Disponible"
    },
    {
      id: "VSR-01",
      nom: "VSR 01",
      role: "Secours routier",
      categorie: "SECOURS_ROUTIER",
      statut: "Disponible"
    },
    {
      id: "VSAV-02",
      nom: "VSAV 02",
      role: "Secours à personne",
      categorie: "SECOURS_PERSONNE",
      statut: "Disponible"
    },
    {
      id: "CCF-01",
      nom: "CCF 01",
      role: "Feux de végétation",
      categorie: "FEU_VEGETATION",
      statut: "Disponible"
    },
    {
      id: "VLCDG-01",
      nom: "VLCDG 01",
      role: "Commandement",
      categorie: "COMMANDEMENT",
      statut: "Disponible"
    },
    {
      id: "SMUR-01",
      nom: "SMUR partenaire",
      role: "Médical",
      categorie: "MEDICAL",
      statut: "Disponible"
    }
  ];

  const APPELS_SIMULES = [
    [
      "Départ de feu",
      "INCENDIE",
      "Zone industrielle — bâtiment B",
      "Urgence absolue",
      "red",
      "Flammes visibles sur une toiture."
    ],
    [
      "Chute de personne",
      "SECOURS_PERSONNE",
      "Place de la République",
      "Secours à personne",
      "blue",
      "Victime consciente, douleur au membre inférieur."
    ],
    [
      "Fuite de gaz",
      "DIVERS",
      "41 rue Nationale",
      "Urgent",
      "orange",
      "Odeur de gaz dans un immeuble collectif."
    ],
    [
      "Feu de végétation",
      "FEU_VEGETATION",
      "Chemin des Étangs",
      "Urgence absolue",
      "red",
      "Propagation rapide vers une zone boisée."
    ],
    [
      "Accident de circulation",
      "ACCIDENT_ROUTE",
      "Avenue de la Gare",
      "Urgent",
      "orange",
      "Deux véhicules impliqués, une personne incarcérée."
    ]
  ];

  function nouvelEtat() {
    const debutPartie = Date.now();

    return {
      version: 1,

      appels: structuredClone(APPELS_INITIAUX).map((appel) => ({
        ...appel,
        creeLe: debutPartie
      })),

      vehicules: structuredClone(VEHICULES_INITIAUX),

      interventions: [],

      journal: [],

      budget: 1240000,

      statistiques: {
        appelsTraites: 0,
        interventionsTerminees: 0,
        erreursEngagement: 0,
        tempsReponseTotalMs: 0,
        dernierTempsReponseMs: 0
      },

      appelSelectionneId: APPELS_INITIAUX[0].id
    };
  }

  function chargerEtat() {
    try {
      const sauvegarde = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      );

      if (sauvegarde && sauvegarde.version === 1) {
        return sauvegarde;
      }
    } catch (erreur) {
      console.warn(
        "Sauvegarde illisible : une nouvelle partie est chargée.",
        erreur
      );
    }

    return nouvelEtat();
  }

  let etat = chargerEtat();

  /*
   * Compatibilité avec les anciennes sauvegardes qui ne possèdent
   * pas encore les statistiques du temps de réponse.
   */
  etat.statistiques.tempsReponseTotalMs ??= 0;
  etat.statistiques.dernierTempsReponseMs ??= 0;

  const $ = (id) => document.getElementById(id);

  const echapper = (valeur) =>
    String(valeur ?? "").replace(
      /[&<>"]/g,
      (caractere) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;"
        })[caractere]
    );

  function sauvegarder() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(etat)
    );

    document.dispatchEvent(
      new CustomEvent("gestion-secours:sauvegarde", {
        detail: etat
      })
    );
  }

  function ajouterJournal(message) {
    etat.journal.unshift({
      date: Date.now(),
      message: message
    });

    etat.journal = etat.journal.slice(0, 100);

    sauvegarder();
    afficherJournal();
  }

  function classeStatut(statut) {
    if (statut === "Disponible") {
      return "available";
    }

    if (statut === "En intervention") {
      return "busy";
    }

    return "offline";
  }

  function compatible(appel, vehicule) {
    const choix = {
      INCENDIE: [
        "INCENDIE",
        "MOYEN_AERIEN",
        "COMMANDEMENT"
      ],

      ACCIDENT_ROUTE: [
        "SECOURS_ROUTIER",
        "SECOURS_PERSONNE",
        "COMMANDEMENT"
      ],

      SECOURS_PERSONNE: [
        "SECOURS_PERSONNE",
        "MEDICAL",
        "COMMANDEMENT"
      ],

      FEU_VEGETATION: [
        "FEU_VEGETATION",
        "INCENDIE",
        "COMMANDEMENT"
      ],

      DIVERS: [
        "COMMANDEMENT",
        "SECOURS_PERSONNE",
        "INCENDIE"
      ]
    };

    return (
      choix[appel.categorie] || []
    ).includes(vehicule.categorie);
  }

  function afficherAppels() {
    const listes = [
      $("callList"),
      $("fullCallList")
    ].filter(Boolean);

    listes.forEach((liste) => {
      liste.innerHTML = "";

      if (!etat.appels.length) {
        liste.innerHTML =
          '<p class="small">Aucun appel en attente.</p>';

        return;
      }

      etat.appels.forEach((appel) => {
        const carte = document.createElement("button");

        carte.type = "button";

        carte.className =
          `call${
            appel.id === etat.appelSelectionneId
              ? " selected"
              : ""
          }`;

        carte.dataset.callId = appel.id;

        carte.innerHTML = `
          <div class="call-head">
            <strong>${echapper(appel.type)}</strong>

            <span class="badge ${echapper(appel.couleur)}">
              ${echapper(appel.priorite)}
            </span>
          </div>

          <div>${echapper(appel.adresse)}</div>

          <div class="small" style="margin-top:6px">
            ${echapper(appel.details)}
          </div>
        `;

        carte.addEventListener("click", () => {
          selectionnerAppel(appel.id);
        });

        liste.appendChild(carte);
      });
    });

    const select = $("incidentSelect");

    if (select) {
      select.innerHTML = etat.appels
        .map(
          (appel) =>
            `<option value="${echapper(appel.id)}">
              ${echapper(appel.type)} — ${echapper(appel.adresse)}
            </option>`
        )
        .join("");

      select.value =
        etat.appelSelectionneId || "";

      select.disabled =
        !etat.appels.length;
    }

    if ($("waitingCalls")) {
      $("waitingCalls").textContent =
        etat.appels.length;
    }
  }

  function afficherVehicules() {
    const listes = [
      $("quickUnits"),
      $("fullUnitList")
    ].filter(Boolean);

    listes.forEach((liste, index) => {
      liste.innerHTML = "";

      const vehicules =
        index === 0
          ? etat.vehicules.slice(0, 5)
          : etat.vehicules;

      vehicules.forEach((vehicule) => {
        const ligne =
          document.createElement("div");

        ligne.className = "unit";

        ligne.innerHTML = `
          <div>
            <strong>${echapper(vehicule.nom)}</strong>

            <div class="small">
              ${echapper(vehicule.role)}
            </div>
          </div>

          <span class="small">
            <span class="status ${classeStatut(vehicule.statut)}"></span>
            ${echapper(vehicule.statut)}
          </span>
        `;

        liste.appendChild(ligne);
      });
    });

    const disponibles =
      etat.vehicules.filter(
        (vehicule) =>
          vehicule.statut === "Disponible"
      );

    if ($("availableUnits")) {
      $("availableUnits").textContent =
        disponibles.length;
    }

    if ($("unitSelect")) {
      $("unitSelect").innerHTML =
        disponibles
          .map(
            (vehicule) =>
              `<option value="${echapper(vehicule.id)}">
                ${echapper(vehicule.nom)} — ${echapper(vehicule.role)}
              </option>`
          )
          .join("");

      $("unitSelect").disabled =
        !disponibles.length;
    }
  }

  function afficherInterventions() {
    const actives =
      etat.interventions.filter(
        (intervention) =>
          !intervention.terminee
      );

    if ($("activeOps")) {
      $("activeOps").textContent =
        actives.length;
    }

    const liste =
      $("interventionList") ||
      $("activeInterventions");

    if (!liste) {
      return;
    }

    liste.innerHTML = actives.length
      ? ""
      : '<p class="small">Aucune intervention active.</p>';

    actives.forEach((intervention) => {
      const carte =
        document.createElement("article");

      carte.className = "call";

      carte.innerHTML = `
        <div class="call-head">
          <strong>
            ${echapper(intervention.type)}
          </strong>

          <span class="badge orange">
            ${echapper(ETAPES[intervention.etape])}
          </span>
        </div>

        <div>
          ${echapper(intervention.adresse)}
        </div>

        <div class="small">
          Moyen engagé :
          ${echapper(intervention.vehiculeId)}
        </div>
      `;

      liste.appendChild(carte);
    });
  }

  function afficherMission(intervention) {
    const mission =
      intervention ||
      etat.interventions.find(
        (element) => !element.terminee
      );

    if (!mission) {
      return;
    }

    if ($("missionTitle")) {
      $("missionTitle").textContent =
        `${mission.type} — ${mission.adresse}`;
    }

    if ($("missionStep")) {
      $("missionStep").textContent =
        ETAPES[mission.etape];
    }

    if ($("missionBadge")) {
      $("missionBadge").textContent =
        mission.terminee
          ? "Terminée"
          : "En cours";

      $("missionBadge").className =
        `badge ${
          mission.terminee
            ? "green"
            : "orange"
        }`;
    }

    const timeline =
      document.querySelector(".timeline");

    if (timeline) {
      [
        ...timeline.querySelectorAll(".step")
      ].forEach((element, index) => {
        element.classList.toggle(
          "done",
          index < mission.etape ||
            mission.terminee
        );

        element.classList.toggle(
          "current",
          index === mission.etape &&
            !mission.terminee
        );
      });
    }
  }

  function afficherJournal() {
    const journal = $("log");

    if (!journal) {
      return;
    }

    journal.innerHTML =
      etat.journal.length
        ? etat.journal
            .map(
              (ligne) =>
                `[${new Date(
                  ligne.date
                ).toLocaleTimeString("fr-FR")}] ${echapper(
                  ligne.message
                )}`
            )
            .join("<br>")
        : "Aucun événement enregistré.";
  }

  function formaterDuree(dureeMs) {
    const secondesTotales =
      Math.max(
        0,
        Math.floor(dureeMs / 1000)
      );

    const minutes =
      Math.floor(secondesTotales / 60);

    const secondes =
      secondesTotales % 60;

    return (
      `${String(minutes).padStart(2, "0")}:` +
      `${String(secondes).padStart(2, "0")}`
    );
  }

  function tempsReponseActuel() {
    const appel =
      etat.appels.find(
        (element) =>
          element.id ===
          etat.appelSelectionneId
      );

    /*
     * Tant qu'un appel est sélectionné, le compteur continue
     * d'augmenter en temps réel.
     */
    if (appel) {
      return Date.now() - appel.creeLe;
    }

    /*
     * S'il n'y a plus d'appel, on affiche le temps obtenu
     * pour le dernier appel traité.
     */
    return (
      etat.statistiques
        .dernierTempsReponseMs
    );
  }

  function afficherTempsReponse() {
    const valeur =
      formaterDuree(
        tempsReponseActuel()
      );

    /*
     * Le compteur fonctionne avec ces trois identifiants HTML.
     * Tu peux donc utiliser celui que tu veux dans tes pages.
     */
    [
      "responseTime",
      "tempsReponse",
      "callResponseTime"
    ].forEach((id) => {
      const compteur =
        document.getElementById(id);

      if (compteur) {
        compteur.textContent =
          valeur;
      }
    });

    /*
     * Calcul du temps de réponse moyen.
     */
    const moyenne =
      etat.statistiques.appelsTraites
        ? etat.statistiques
            .tempsReponseTotalMs /
          etat.statistiques
            .appelsTraites
        : 0;

    if ($("averageResponseTime")) {
      $("averageResponseTime").textContent =
        formaterDuree(moyenne);
    }
  }

  function afficherCompteurs() {
    if ($("budget")) {
      $("budget").textContent =
        new Intl.NumberFormat(
          "fr-FR",
          {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0
          }
        ).format(etat.budget);
    }

    if ($("callsHandled")) {
      $("callsHandled").textContent =
        etat.statistiques.appelsTraites;
    }

    if ($("completedOps")) {
      $("completedOps").textContent =
        etat.statistiques
          .interventionsTerminees;
    }

    afficherTempsReponse();
  }

  function selectionnerAppel(id) {
    const appel =
      etat.appels.find(
        (element) =>
          element.id === id
      );

    if (!appel) {
      return;
    }

    etat.appelSelectionneId = id;

    sauvegarder();
    afficherAppels();
    afficherTempsReponse();

    if ($("missionTitle")) {
      $("missionTitle").textContent =
        `${appel.type} — ${appel.adresse}`;
    }

    ajouterJournal(
      `Appel sélectionné : ${appel.type}, ${appel.adresse}.`
    );
  }

  function engagerMoyen(
    appelId,
    vehiculeId
  ) {
    const appel =
      etat.appels.find(
        (element) =>
          element.id === appelId
      );

    const vehicule =
      etat.vehicules.find(
        (element) =>
          element.id === vehiculeId &&
          element.statut === "Disponible"
      );

    if (!appel || !vehicule) {
      return false;
    }

    if (!compatible(appel, vehicule)) {
      etat.statistiques
        .erreursEngagement += 1;

      const confirmer =
        window.confirm(
          `${vehicule.nom} ne semble pas être le moyen principal ` +
          `le mieux adapté à « ${appel.type} ». Confirmer quand même ?`
        );

      if (!confirmer) {
        return false;
      }
    }

    /*
     * Le temps de réponse s'arrête au moment où le joueur
     * engage le véhicule.
     */
    const tempsReponseMs =
      Math.max(
        0,
        Date.now() - appel.creeLe
      );

    vehicule.statut =
      "En intervention";

    const intervention = {
      id: `intervention-${Date.now()}`,
      appelId: appel.id,
      type: appel.type,
      categorie: appel.categorie,
      adresse: appel.adresse,
      vehiculeId: vehicule.id,
      etape: 2,
      terminee: false,
      debut: Date.now(),
      tempsReponseMs: tempsReponseMs
    };

    etat.interventions.unshift(
      intervention
    );

    etat.appels =
      etat.appels.filter(
        (element) =>
          element.id !== appel.id
      );

    etat.appelSelectionneId =
      etat.appels[0]?.id || null;

    etat.statistiques
      .appelsTraites += 1;

    etat.statistiques
      .tempsReponseTotalMs +=
      tempsReponseMs;

    etat.statistiques
      .dernierTempsReponseMs =
      tempsReponseMs;

    etat.budget =
      Math.max(
        0,
        etat.budget - 350
      );

    sauvegarder();

    ajouterJournal(
      `${vehicule.nom} engagé sur ${appel.type} (${appel.adresse}). ` +
      `Temps de réponse : ${formaterDuree(tempsReponseMs)}.`
    );

    toutAfficher();
    afficherMission(intervention);

    return true;
  }

  function avancerIntervention(id) {
    const intervention = id
      ? etat.interventions.find(
          (element) =>
            element.id === id
        )
      : etat.interventions.find(
          (element) =>
            !element.terminee
        );

    if (
      !intervention ||
      intervention.terminee
    ) {
      return false;
    }

    if (
      intervention.etape <
      ETAPES.length - 1
    ) {
      intervention.etape += 1;

      ajouterJournal(
        `${intervention.type} : ` +
        `${ETAPES[intervention.etape]}.`
      );
    } else {
      intervention.terminee = true;
      intervention.fin = Date.now();

      const vehicule =
        etat.vehicules.find(
          (element) =>
            element.id ===
            intervention.vehiculeId
        );

      if (vehicule) {
        vehicule.statut =
          "Disponible";
      }

      etat.statistiques
        .interventionsTerminees += 1;

      ajouterJournal(
        `Intervention « ${intervention.type} » terminée. ` +
        `${intervention.vehiculeId} est de nouveau disponible.`
      );
    }

    sauvegarder();
    toutAfficher();
    afficherMission(intervention);

    return true;
  }

  function genererAppel() {
    const modele =
      APPELS_SIMULES[
        Math.floor(
          Math.random() *
          APPELS_SIMULES.length
        )
      ];

    const appel = {
      id: `appel-${Date.now()}`,
      type: modele[0],
      categorie: modele[1],
      adresse: modele[2],
      priorite: modele[3],
      couleur: modele[4],
      details: modele[5],
      creeLe: Date.now()
    };

    etat.appels.push(appel);

    etat.appelSelectionneId =
      appel.id;

    sauvegarder();
    afficherAppels();
    afficherTempsReponse();

    ajouterJournal(
      `Nouvel appel CTA : ${appel.type} — ${appel.adresse}.`
    );

    return appel;
  }

  function nouvellePartie() {
    const confirmer =
      window.confirm(
        "Recommencer la partie ? La sauvegarde actuelle sera remplacée."
      );

    if (!confirmer) {
      return;
    }

    /*
     * La création d'un nouvel état replace immédiatement
     * le temps de réponse à zéro.
     */
    etat = nouvelEtat();

    ajouterJournal(
      "Nouvelle garde démarrée."
    );

    toutAfficher();
    afficherTempsReponse();
  }

  function toutAfficher() {
    afficherAppels();
    afficherVehicules();
    afficherInterventions();
    afficherJournal();
    afficherCompteurs();

    const mission =
      etat.interventions.find(
        (element) =>
          !element.terminee
      ) ||
      etat.interventions[0];

    if (mission) {
      afficherMission(mission);
    }

    const bouton =
      $("dispatchBtn");

    if (bouton) {
      bouton.disabled =
        !etat.appels.length ||
        !etat.vehicules.some(
          (vehicule) =>
            vehicule.statut ===
            "Disponible"
        );
    }
  }

  function mettreAJourHorloge() {
    const maintenant =
      new Date();

    if ($("clock")) {
      $("clock").textContent =
        maintenant.toLocaleTimeString(
          "fr-FR"
        );
    }

    if ($("date")) {
      $("date").textContent =
        maintenant.toLocaleDateString(
          "fr-FR",
          {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
          }
        );
    }
  }

  function initialiserNavigation() {
    const titres = {
      operations: [
        "Salle opérationnelle",
        "Traitez les appels, engagez les moyens et suivez les interventions."
      ],

      calls: [
        "Centre de traitement des appels",
        "Réception, qualification et priorisation des demandes de secours."
      ],

      units: [
        "Gestion des moyens",
        "Disponibilité, spécialité et engagement des véhicules."
      ],

      buildings: [
        "Infrastructures",
        "Construisez et améliorez vos centres de secours et bâtiments techniques."
      ],

      staff: [
        "Personnel",
        "Gérez les gardes, équipes et spécialités."
      ],

      reports: [
        "Rapports et historique",
        "Consultez les événements et décisions opérationnelles."
      ]
    };

    document
      .querySelectorAll(
        ".nav-btn[data-page]"
      )
      .forEach((bouton) => {
        bouton.addEventListener(
          "click",
          () => {
            const page =
              bouton.dataset.page;

            document
              .querySelectorAll(
                ".nav-btn"
              )
              .forEach((element) => {
                element.classList.remove(
                  "active"
                );
              });

            document
              .querySelectorAll(".page")
              .forEach((element) => {
                element.classList.remove(
                  "active"
                );
              });

            bouton.classList.add(
              "active"
            );

            $(page)?.classList.add(
              "active"
            );

            if (
              titres[page] &&
              $("pageTitle")
            ) {
              $("pageTitle").textContent =
                titres[page][0];
            }

            if (
              titres[page] &&
              $("pageSubtitle")
            ) {
              $("pageSubtitle").textContent =
                titres[page][1];
            }
          }
        );
      });
  }

  function connecterInterface() {
    $("incidentSelect")
      ?.addEventListener(
        "change",
        (event) => {
          selectionnerAppel(
            event.target.value
          );
        }
      );

    $("dispatchBtn")
      ?.addEventListener(
        "click",
        () => {
          engagerMoyen(
            $("incidentSelect")?.value,
            $("unitSelect")?.value
          );
        }
      );

    $("advanceMission")
      ?.addEventListener(
        "click",
        () => {
          avancerIntervention();
        }
      );

    $("newCallBtn")
      ?.addEventListener(
        "click",
        genererAppel
      );

    $("newGameBtn")
      ?.addEventListener(
        "click",
        nouvellePartie
      );

    $("resetGameBtn")
      ?.addEventListener(
        "click",
        nouvellePartie
      );

    document
      .querySelectorAll(
        "[data-action='new-call']"
      )
      .forEach((bouton) => {
        bouton.addEventListener(
          "click",
          genererAppel
        );
      });

    document
      .querySelectorAll(
        "[data-action='new-game']"
      )
      .forEach((bouton) => {
        bouton.addEventListener(
          "click",
          nouvellePartie
        );
      });

    initialiserNavigation();
  }

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      connecterInterface();
      toutAfficher();
      mettreAJourHorloge();

      /*
       * Actualisation de l'horloge générale.
       */
      setInterval(
        mettreAJourHorloge,
        1000
      );

      /*
       * Actualisation du temps de réponse toutes les secondes.
       */
      setInterval(
        afficherTempsReponse,
        1000
      );

      if (!etat.journal.length) {
        ajouterJournal(
          "Système opérationnel démarré. CTA prêt à recevoir les appels."
        );
      }
    }
  );

  window.GestionSecours = {
    get etat() {
      return structuredClone(etat);
    },

    sauvegarder:
      sauvegarder,

    selectionnerAppel:
      selectionnerAppel,

    engagerMoyen:
      engagerMoyen,

    avancerIntervention:
      avancerIntervention,

    genererAppel:
      genererAppel,

    nouvellePartie:
      nouvellePartie,

    compatible:
      compatible,

    rafraichir:
      toutAfficher
  };
})();