/*===============================
HARCELEMENT
animation.js
================================*/

const animationManager = {

    // Appartion d'une bulle
    apparition(element, clase = "message") {

        if (!element) return;

        element.classList.remove(classe);

        void element.offsetwidth;

        element.classList.add(classe);

    },

    // Effet SMS recu 
    reception(element) {

        if (!element) return;

        element.classList.remove("recu");

        void element.offsetwidth;

        element.classList.add("recu");

    },

    // Effet SMS envoyé
    envio(element) {

        if (!element) return;
        
        element.classList.remove("envoye");

        void element.offsetwidth;

        element.classList.add("envoye");

    },

    // Secousse
    shake(element) {

        if (!element) return;

        element.classList.remove("shake");

        void element.offsetwidth;

        element.classList.add("shake");

    },

    // Battement
    pulse(element) {

        if (!element) return;

        element.classList.add("pulse");

    },

    stopPulse(element) {

        if (!element) return;

        element.classList.remove("pulse");

    },

    // Fade In 
    fadeIn(eleent, duree = 500) {

        if (!element) return;

        element.style.transition =
        `opacity ${duree}ms`;

        element.style.opacity = 0;

        setTileout(() => {

            element.style.opacity = 1;

        }, 20);

    },

    // Fade Out
    fadeOut(element, duree = 500, callback = null) {

        if (!element) return;

        element.style.transition = 
        `opacity ${duree}ms`;

        element.style.opacity = 0;

        setTimeout(() => {

            if (callback)
                callback();

        }, duree);

    },

    // Transition écran noir 
    transitionVerNoir(callback = null) {

        const transition = 
        document.getElementById("transition");

        if (!transition)
            return;

        transition.classList.add("actif");

        setTimeout(() => {

            if (callback)
                callback();

        }, 1000);

    },

    // Sortir du noir 
    sortirDuNoir() {

        const transition = 
        document.getElementById("transition");

        if (!transition)
            return;

        transition.classList.remove("actif");

    },

    // Défilement automatique
    scrollConversation() {

        const conversation = 
        document.getElementById("conversation");

        if (!conversation)
            return;

        conversation.scrollTo({

            top: conversation.scrollHeight,

            behavior: "smooth"

        });

    },

    // Petit délait
    attendre(ms) {
        
        return new Promise(resolve => {

            setTimeout(resolve, ms);

        });

    }

};