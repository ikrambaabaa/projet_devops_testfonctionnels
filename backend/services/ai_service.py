import requests
import os
import time

from fastapi import HTTPException


API_KEY = os.getenv("OPENROUTER_API_KEY")


PROMPT = """
Tu es un expert QA senior spécialisé exclusivement en tests fonctionnels métier.

MISSION :
Analyser le SFD puis générer un très grand nombre de cas de tests métier réalistes.

OBJECTIF PRINCIPAL :
Maximiser la couverture fonctionnelle métier.

INTERDICTIONS STRICTES :
Ne jamais générer :
- tests techniques
- tests unitaires
- tests API
- tests backend
- tests SQL
- tests performance
- tests sécurité technique
- tests code source

INTERDICTION DE VOCABULAIRE TECHNIQUE :
Ne jamais utiliser :
endpoint, request, response, API, SQL,
database, backend, frontend, JSON,
code, méthode, fonction, pytest,
assertion, payload.

FOCUS OBLIGATOIRE :
- règles métier
- comportement utilisateur
- workflow métier
- validations métier
- scénarios réels
- erreurs métier
- cas limites métier
- dépendances métier
- variantes fonctionnelles

OBLIGATION :
Générer un maximum de scénarios métier possibles.

Générer :
- scénarios nominaux
- scénarios erreurs
- scénarios limites
- scénarios alternatifs
- scénarios exceptionnels
- validations métier
- refus métier
- droits utilisateur
- contraintes métier
- cas de bord
- dépendances entre scénarios
- variantes métier
- workflows complexes
- scénarios liés hiérarchiquement

EXEMPLES DE TESTS ATTENDUS :
✅ paiement refusé
✅ solde insuffisant
✅ produit hors stock
✅ utilisateur bloqué
✅ montant maximum
✅ dépassement plafond
✅ panier vide
✅ devise invalide
✅ droits insuffisants
✅ compte inexistant

EXEMPLES INTERDITS :
❌ test API
❌ test endpoint
❌ test SQL
❌ test code Python
❌ test backend
❌ validation HTTP

EXIGENCES :
1. Identifier toutes les règles métier
2. Générer le maximum de cas possibles
3. Générer minimum 20 cas de tests
4. Générer :
   - Nominal
   - Limite
   - Erreur
5. Ajouter :
   - priorité métier
   - sévérité métier
6. Générer :
   - préconditions
   - étapes détaillées
   - données d'entrée
   - résultats attendus
7. Maximiser la couverture métier
8. Générer des scénarios utilisateur réalistes
9. Détecter automatiquement les dépendances logiques entre scénarios métier.

RÈGLES :
- Si un test dépend d’un autre scénario métier, utiliser parent_test_id.
- Le scénario principal doit avoir parent_test_id = null.
- Les scénarios enfants doivent référencer l’identifiant numérique du parent.
- Les scénarios liés doivent former une hiérarchie logique.
- Les variantes d’un même scénario doivent être reliées entre elles.

EXEMPLES :
- Ajout bénéficiaire → parent null
- Validation bénéficiaire → parent = test ajout bénéficiaire
- Virement vers bénéficiaire validé → parent = test validation bénéficiaire

- Création compte → parent null
- Activation compte → parent = création compte
- Connexion utilisateur → parent = activation compte

10. Lorsqu’un scénario possède plusieurs variantes métier :
    - le scénario principal doit avoir version = 1
    - les variantes doivent avoir version = 2, 3, etc.
    - les variantes doivent utiliser parent_test_id
    - les variantes doivent réutiliser le même workflow métier

11. Générer un status QA pour chaque test :
    - draft
    - ready
    - approved

12. Générer des scénarios dépendants les uns des autres

FORMAT JSON STRICT :

[
  {
    "id": "TM001",

    "parent_test_id": null,

    "version": 1,

    "status": "draft",

    "titre": "Description métier",

    "regle_metier": "Description complète de la règle métier liée au test",

    "preconditions": [],

    "etapes": [],

    "donnees_entree": {},

    "resultats_attendus": [],

    "priorite": "Haute | Moyenne | Basse",

    "severite": "Critique | Élevée | Moyenne | Faible",

    "type": "Nominal | Limite | Erreur"
  }
]

CONTRAINTES :
- JSON uniquement
- Aucun texte hors JSON
- Ne jamais expliquer
- Ne jamais commenter
- Ne jamais utiliser markdown
- Tous les champs obligatoires
- Résultats attendus = LISTE
- Étapes = LISTE
- Préconditions = LISTE
- parent_test_id doit être un entier numérique ou null
- version doit être un entier numérique
- regle_metier doit contenir le texte explicite de la règle métier
- Ne jamais utiliser uniquement RG1, RG2, RG3
- Générer des relations logiques entre certains tests
- Générer des variantes métier réalistes
- Ne jamais inventer de logique absente du SFD
- Générer uniquement des tests fonctionnels métier
- Ne jamais générer de tests techniques
- Retourner uniquement le tableau JSON

SFD :
"""


def call_ai(payload, headers, retries=3):

    for _ in range(retries):

        try:

            res = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )

            if res.status_code == 200:
                return res.json()

        except requests.exceptions.RequestException:
            pass

        time.sleep(2)

    raise HTTPException(
        status_code=500,
        detail="Erreur API OpenRouter"
    )