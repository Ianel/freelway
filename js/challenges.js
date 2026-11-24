/* ==========================================================================
   CHALLENGES — les 15 mini-jeux. Chaque méthode remplit ui.challengeBody et
   s'achève par this.finish(score) qui enregistre la réussite.
   Convention : score en pourcentage (0-100).
   ========================================================================== */
class Challenges {
    constructor(ui, progression) {
        this.ui = ui;
        this.progression = progression;
        this.currentChallenge = null;
        this.onComplete = null;
        this.steps = [];
    }

    setSteps(steps) { this.steps = steps; }
    update() { /* rien à animer */ }

    run(step, onComplete) {
        this.cancel();
        this.onComplete = onComplete;
        this.currentChallenge = step;

        // Ouvre le panneau et laisse le challenge remplir le corps
        this.ui.showChallenge(step, onComplete);
        this.ui.challengeSubmit.textContent = 'Valider';
        this.ui.challengeSubmit.style.display = '';
        this.ui.challengeSubmit.disabled = false;

        const map = {
            typing: 'typing', shortcuts: 'shortcuts', sheets: 'sheets',
            datainput: 'datainput', graphism: 'graphism', video: 'video',
            clientqa: 'clientqa', fbpage: 'fbpage', portfolio: 'portfolio',
            social: 'social', platform: 'platform', email: 'email',
            groups: 'groups', quiz: 'quiz', final: 'final'
        };
        const fn = map[step.challenge];
        if (fn && typeof this[fn] === 'function') this[fn](step);
        else this.simple(step);
    }

    /* ---------- helpers ---------- */
    body() { return this.ui.challengeBody; }

    setValidate(fn) { this.ui.validateCallback = fn; }

    fail(msg) { this.ui.setChallengeMessage(msg, true); }

    cancel() {
        clearTimeout(this.finishTimer);
        clearTimeout(this.focusTimer);
        this.finishing = false;
        this.onComplete = null;
        this.currentChallenge = null;
    }

    finish(score, message) {
        if (this.finishing || !this.currentChallenge || !this.ui.isInChallenge) return;
        if (score < 70) return this.fail(message || 'Presque ! Recommence pour valider.');
        this.finishing = true;
        this.ui.setChallengeMessage('Bravo ! Étape validée.', false);
        this.progression.completeStep(this.currentChallenge.id, score);
        this.ui.updateHud();
        this.ui.challengeSubmit.disabled = true;
        this.ui.challengeBody.querySelectorAll('button, input, select, textarea').forEach(el => el.disabled = true);
        const complete = this.onComplete;
        this.finishTimer = setTimeout(() => {
            this.ui.closeChallenge();
            if (complete) complete('success');
        }, 650);
    }

    runQuiz(questions, passScore, context = '') {
        let qIndex = 0;
        let correct = 0;
        this.ui.challengeSubmit.style.display = 'none';
        const render = () => {
            if (qIndex >= questions.length) {
                const pct = Math.round(correct / questions.length * 100);
                this.ui.challengeSubmit.style.display = '';
                this.ui.challengeBody.innerHTML = `<p class="challenge-result">Résultat : ${pct}%</p><p>${pct >= passScore ? 'Objectif atteint !' : `Il faut au moins ${passScore}%. Réessaie !`}</p>`;
                this.ui.challengeSubmit.textContent = pct >= passScore ? 'Valider' : 'Réessayer';
                this.setValidate(() => {
                    if (pct >= passScore) this.finish(pct);
                    else { qIndex = 0; correct = 0; this.ui.challengeMsg.textContent = ''; this.ui.challengeSubmit.textContent = 'Valider'; this.ui.challengeSubmit.style.display = 'none'; render(); }
                });
                return;
            }
            const q = questions[qIndex];
            this.ui.challengeBody.innerHTML = `${context}<p class="q-count">Question ${qIndex + 1}/${questions.length}</p><p class="q-text">${q.q}</p><div class="q-options"></div>`;
            const box = this.ui.challengeBody.querySelector('.q-options');
            q.options.forEach((label, i) => {
                const button = document.createElement('button');
                button.className = 'option-btn'; button.textContent = label;
                button.addEventListener('click', () => { if (i === q.correct) correct++; qIndex++; render(); });
                box.appendChild(button);
            });
        };
        render();
    }

    /* ---------- Étape 1 : dactylographie ---------- */
    typing(step) {
        const target = step.text;
        this.ui.challengeBody.innerHTML = `
            <p>Tape le texte suivant. Objectif : <b>85 % de précision</b>.</p>
            <div class="typing-target" id="tgt"></div>
            <textarea id="tin" class="typing-input" rows="2" spellcheck="false" placeholder="Tape ici…"></textarea>
            <p class="typing-stats">Précision : <b id="tacc">0 %</b></p>
        `;
        const tgt = this.ui.challengeBody.querySelector('#tgt');
        const input = this.ui.challengeBody.querySelector('#tin');
        const acc = this.ui.challengeBody.querySelector('#tacc');

        const paint = () => {
            let html = '';
            const typed = input.value;
            for (let i = 0; i < target.length; i++) {
                if (i < typed.length) {
                    html += typed[i] === target[i]
                        ? `<span class="ok">${target[i]}</span>`
                        : `<span class="ko">${target[i]}</span>`;
                } else {
                    html += target[i];
                }
            }
            tgt.innerHTML = html;
            let good = 0;
            for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) good++;
            const p = typed.length ? Math.round((good / Math.max(target.length, typed.length)) * 100) : 0;
            acc.textContent = p + ' %';
        };
        input.addEventListener('input', paint);
        paint();
        this.focusTimer = setTimeout(() => input.focus(), 50);

        this.setValidate(() => {
            const typed = input.value;
            if (!typed.length) return this.fail('Écris le texte d’abord.');
            let good = 0;
            for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) good++;
            const p = Math.round((good / Math.max(target.length, typed.length)) * 100);
            if (p >= 85) this.finish(100);
            else this.fail(`Précision : ${p} % (85 % requis).`);
        });
    }

    /* ---------- Étape 2 : raccourcis ---------- */
    shortcuts() {
        this.runQuiz([
            { q: 'Raccourci pour COPIER ?', options: ['Ctrl+C', 'Ctrl+V', 'Ctrl+X'], correct: 0 },
            { q: 'Raccourci pour COLLER ?', options: ['Ctrl+X', 'Ctrl+V', 'Ctrl+Z'], correct: 1 },
            { q: 'Raccourci pour COUPER ?', options: ['Ctrl+C', 'Ctrl+A', 'Ctrl+X'], correct: 2 },
            { q: 'Raccourci pour ANNULER ?', options: ['Ctrl+Z', 'Ctrl+S', 'Ctrl+A'], correct: 0 },
            { q: 'Raccourci pour TOUT SÉLECTIONNER ?', options: ['Ctrl+S', 'Ctrl+A', 'Ctrl+C'], correct: 1 }
        ], 80);
    }

    /* ---------- Étape 3 : tableur ---------- */
    sheets() {
        const table = `
            <p>Observe le tableau puis réponds.</p>
            <table class="sheet">
                <tr><th></th><th>A</th><th>B</th><th>C</th></tr>
                <tr><th>1</th><td>10</td><td>20</td><td>30</td></tr>
                <tr><th>2</th><td>15</td><td>25</td><td>35</td></tr>
                <tr><th>3</th><td>12</td><td>40</td><td>50</td></tr>
            </table>
        `;
        this.runQuiz([
            { q: 'Valeur de la cellule B3 ?', options: ['25', '40', '50'], correct: 1 },
            { q: 'Somme de la colonne A (A1+A2+A3) ?', options: ['37', '40', '45'], correct: 0 },
            { q: 'Quelle cellule contient la plus grande valeur ?', options: ['B3', 'C3', 'C2'], correct: 1 }
        ], 80, table);
    }

    /* ---------- Étape 4 : saisie de données ---------- */
    datainput() {
        const rows = [
            { label: 'Nom', value: 'Jean Dupont' },
            { label: 'Ville', value: 'Paris' },
            { label: 'Email', value: 'jdupont@email.com' }
        ];
        this.ui.challengeBody.innerHTML =
            '<p>Recopie fidèlement les informations (au moins 90 % de précision).</p>' +
            rows.map((r, i) => `
                <label class="field">${r.label} — à recopier : <b>${r.value}</b>
                    <input class="challenge-input" data-i="${i}" placeholder="${r.label}">
                </label>`).join('');

        this.setValidate(() => {
            const inputs = this.ui.challengeBody.querySelectorAll('input');
            let ok = 0;
            inputs.forEach((inp, i) => {
                if (inp.value.trim() === rows[i].value) ok++;
            });
            const p = Math.round((ok / rows.length) * 100);
            if (p >= 90) this.finish(100);
            else this.fail(`Précision : ${p} % (90 % requis). Corrige les champs.`);
        });
    }

    /* ---------- Étape 5 : graphisme ---------- */
    graphism() {
        const options = [
            { name: 'Bleu profond + blanc', colors: ['#1b2a4a', '#ffffff'], good: true },
            { name: 'Rouge vif + jaune fluo', colors: ['#e74c3c', '#f1c40f'], good: false },
            { name: 'Marron + bordeaux', colors: ['#6d4c41', '#7b1e2b'], good: false }
        ];
        this.ui.challengeBody.innerHTML =
            '<p>Choisis la composition la plus lisible pour une affiche professionnelle.</p>' +
            options.map((o, i) => `
                <button class="color-option" data-i="${i}" style="background:${o.colors[0]};color:${o.colors[1]}">
                    ${o.name}
                </button>`).join('');

        this.ui.challengeSubmit.style.display = 'none';
        this.ui.challengeBody.querySelectorAll('.color-option').forEach(el => {
            el.addEventListener('click', () => {
                const i = +el.dataset.i;
                if (options[i].good) this.finish(100);
                else this.fail('Ce contraste est trop faible ou trop agressif.');
            });
        });
    }

    /* ---------- Étape 6 : montage vidéo ---------- */
    video() {
        const order = ['Intro', 'Interview', 'Conclusion'];
        let picked = [];
        this.ui.challengeSubmit.style.display = 'none';

        const render = () => {
            this.ui.challengeBody.innerHTML =
                '<p>Clique les clips dans le bon ordre.</p>' +
                order.map(c => `<button class="clip-item" data-c="${c}">🎬 ${c}</button>`).join('') +
                `<p class="picked">Ordre : ${picked.join(' → ') || '—'}</p>`;
            this.ui.challengeBody.querySelectorAll('.clip-item').forEach(b => {
                b.addEventListener('click', () => {
                    picked.push(b.dataset.c);
                    if (picked.length === order.length) {
                        const ok = picked.every((c, i) => c === order[i]);
                        if (ok) this.finish(100);
                        else { this.fail('Ordre incorrect.'); picked = []; render(); }
                    } else render();
                });
            });
        };
        render();
    }

    /* ---------- Étape 7 : question-réponse client ---------- */
    clientqa() {
        this.runQuiz([
            { q: 'Le client dit : « je veux un site ». Que demandes-tu d’abord ?', options: ['Son budget', 'Sa couleur préférée', 'Rien, on commence'], correct: 0 },
            { q: 'Information indispensable au brief ?', options: ['Le délai souhaité', 'Le nom de son chat', 'La météo'], correct: 0 },
            { q: 'Qu’est-ce qu’un « livrable » ?', options: ['Ce qui est livré au client', 'Le prix', 'La facture'], correct: 0 },
            { q: 'Pour bien cerner les attentes du client, on demande :', options: ['Des exemples qu’il aime', 'S’il travaille le week-end', 'Sa date de naissance'], correct: 0 }
        ], 75);
    }

    /* ---------- Étape 8 : page Facebook ---------- */
    fbpage() {
        this.ui.challengeBody.innerHTML = `
            <p>Crée la page pro de ton activité.</p>
            <label class="field">Nom de la page
                <input id="fbname" class="challenge-input" placeholder="Ex : AinaDesign">
            </label>
            <label class="field">Description (20 caractères min.)
                <textarea id="fbdesc" class="challenge-input" rows="2" placeholder="Graphiste freelance à Antananarivo…"></textarea>
            </label>
            <label class="field">Catégorie
                <select id="fbcat" class="challenge-input">
                    <option value="">— choisir —</option>
                    <option>Graphisme</option><option>Rédaction</option><option>Développement</option>
                </select>
            </label>`;
        this.setValidate(() => {
            const name = this.ui.challengeBody.querySelector('#fbname').value.trim();
            const desc = this.ui.challengeBody.querySelector('#fbdesc').value.trim();
            const cat = this.ui.challengeBody.querySelector('#fbcat').value;
            if (!name) return this.fail('Choisis un nom de page.');
            if (desc.length < 20) return this.fail('La description doit faire au moins 20 caractères.');
            if (!cat) return this.fail('Choisis une catégorie.');
            this.finish(100);
        });
    }

    /* ---------- Étape 9 : portfolio ---------- */
    portfolio() {
        const projects = [
            { name: 'Logo du café Tsiky', skill: 'Graphisme' },
            { name: 'Site vitrine pour une ONG', skill: 'Développement web' },
            { name: 'Affiche concert Mahajanga', skill: 'Design' }
        ];
        this.ui.challengeBody.innerHTML = '<p>Sélectionne les 3 projets à présenter dans ton portfolio.</p>' +
            projects.map((p, i) => `
                <label class="check-item"><input type="checkbox" data-i="${i}">
                    <span><b>${p.name}</b> — ${p.skill}</span></label>`).join('');

        this.setValidate(() => {
            const boxes = this.ui.challengeBody.querySelectorAll('input[type=checkbox]');
            let n = 0;
            boxes.forEach(b => { if (b.checked) n++; });
            if (n === 3) this.finish(100);
            else this.fail(`Sélectionne exactement 3 projets (tu en as choisi ${n}).`);
        });
    }

    /* ---------- Étape 10 : réseaux sociaux ---------- */
    social() {
        this.runQuiz([
            { q: 'Un prospect commente « je cherche un graphiste ». Tu :', options: ['Réponds en présentant ton offre et demandes ses besoins', 'Spam ton lien partout', 'Ignore'], correct: 0 },
            { q: 'Réponse professionnelle à un compliment ?', options: ['Remercie et propose d’en discuter', 'Envoie 10 messages privés', 'Laisse un avis négatif'], correct: 0 },
            { q: 'Comportement à ÉVITER sur les réseaux ?', options: ['Publier du spam répétitif', 'Partager son portfolio', 'Répondre poliment'], correct: 0 }
        ], 75);
    }

    /* ---------- Étape 11 : plateforme freelance ---------- */
    platform() {
        this.ui.challengeBody.innerHTML = `
            <p>Crée un profil crédible.</p>
            <label class="field">Titre du profil
                <input id="ptitle" class="challenge-input" placeholder="Ex : Graphiste freelance">
            </label>
            <label class="field">Catégorie
                <select id="pcat" class="challenge-input">
                    <option value="">— choisir —</option>
                    <option>Design</option><option>Développement</option><option>Rédaction</option>
                </select>
            </label>
            <label class="field">Tarif horaire (Ar ou €)
                <input id="pprice" type="number" class="challenge-input" placeholder="Ex : 25">
            </label>`;
        this.setValidate(() => {
            const t = this.ui.challengeBody.querySelector('#ptitle').value.trim();
            const c = this.ui.challengeBody.querySelector('#pcat').value;
            const p = parseFloat(this.ui.challengeBody.querySelector('#pprice').value);
            if (t.length < 8) return this.fail('Le titre du profil est trop court.');
            if (!c) return this.fail('Choisis une catégorie.');
            if (!(p > 0)) return this.fail('Indique un tarif positif.');
            this.finish(100);
        });
    }

    /* ---------- Étape 12 : email de prospection ---------- */
    email() {
        this.ui.challengeBody.innerHTML = `
            <p>Rédige un email de prospection pour un restaurant qui veut un site.</p>
            <label class="field">Objet
                <input id="esubj" class="challenge-input" placeholder="Objet de l’email">
            </label>
            <label class="field">Message
                <textarea id="ebody" class="challenge-input" rows="4" placeholder="Bonjour…"></textarea>
            </label>`;
        this.setValidate(() => {
            const subj = this.ui.challengeBody.querySelector('#esubj').value.trim();
            const body = this.ui.challengeBody.querySelector('#ebody').value.trim();
            if (subj.length < 6) return this.fail('L’objet doit être clair (6 caractères min.).');
            if (body.length < 40) return this.fail('Le message est trop court (40 caractères min.).');
            this.finish(100);
        });
    }

    /* ---------- Étape 13 : groupes ---------- */
    groups() {
        this.ui.challengeBody.innerHTML = '<p>Dans quel groupe as-tu le plus de chances de trouver un client ?</p>';
        this.ui.challengeSubmit.style.display = 'none';
        [
            { name: 'Entrepreneurs de Mahajanga (5000 membres)', good: true },
            { name: 'Amateurs de foot', good: false },
            { name: 'Recettes de cuisine malgache', good: false }
        ].forEach((g, i) => {
            const b = document.createElement('button');
            b.className = 'group-item';
            b.textContent = g.name;
            b.addEventListener('click', () => {
                if (g.good) this.finish(100);
                else this.fail('Ce groupe n’est pas en lien avec ton service.');
            });
            this.ui.challengeBody.appendChild(b);
        });
    }

    /* ---------- Étape 14 : dernier cours (quiz) ---------- */
    quiz() {
        this.runQuiz([
            { q: 'Délai de livraison : tu annonces un retard. Que fais-tu ?', options: ['Tu préviens le client dès que possible', 'Tu ne dis rien', 'Tu livres en retard sans explication'], correct: 0 },
            { q: 'Fixer son tarif, c’est :', options: ['Calculer coût + valeur + marge', 'Copier le moins cher', 'Le plus bas possible'], correct: 0 },
            { q: 'Satisfaction client :', options: ['On vérifie que le livrable répond au brief', 'On ignore les retours', 'On ajoute du travail gratuit à l’infini'], correct: 0 },
            { q: 'Organisation du travail :', options: ['Découper le projet en tâches et planifier', 'Tout faire la veille', 'Attendre l’inspiration'], correct: 0 },
            { q: 'Relation client de qualité :', options: ['Communiquer clairement et régulièrement', 'Disparaître', 'Tout promettre sans vérifier'], correct: 0 }
        ], 80);
    }

    /* ---------- Étape 15 : challenge final ---------- */
    final() {
        this.ui.challengeBody.innerHTML = `
            <p>Client : <b>Voahangy</b> — restaurant qui veut un site web.</p>
            <label class="field">1. Analyse du besoin : quelle proposition ?
                <select id="fprop" class="challenge-input">
                    <option value="">— choisir —</option>
                    <option value="good">Site vitrine + menu en ligne</option>
                    <option value="bad">Application mobile sur mesure</option>
                </select>
            </label>
            <label class="field">2. Tarif proposé (€)
                <input id="fprice" type="number" class="challenge-input" placeholder="Ex : 350">
            </label>
            <label class="field">3. Délai de livraison (jours)
                <input id="fdelay" type="number" class="challenge-input" placeholder="Ex : 14">
            </label>
            <label class="field">4. Message au client
                <textarea id="fmsg" class="challenge-input" rows="3" placeholder="Présente ta proposition…"></textarea>
            </label>`;
        this.setValidate(() => {
            const prop = this.ui.challengeBody.querySelector('#fprop').value;
            const price = parseFloat(this.ui.challengeBody.querySelector('#fprice').value);
            const delay = parseFloat(this.ui.challengeBody.querySelector('#fdelay').value);
            const msg = this.ui.challengeBody.querySelector('#fmsg').value.trim();
            if (!prop) return this.fail('Analyse le besoin.');
            if (!(price > 0)) return this.fail('Indique un tarif cohérent.');
            if (!(delay > 0)) return this.fail('Indique un délai.');
            if (msg.length < 30) return this.fail('Rédige un message de proposition (30 caractères min.).');
            if (prop !== 'good') return this.fail('La demande est un site web simple, pas une application.');
            if (price < 200 || price > 1500) return this.fail('Tarif trop bas ou trop haut : reste cohérent.');
            this.finish(100);
        });
    }

    /* ---------- fallback ---------- */
    simple(step) {
        this.ui.challengeBody.innerHTML = `<p>${step.intro}</p>`;
        this.setValidate(() => this.finish(100));
    }
}