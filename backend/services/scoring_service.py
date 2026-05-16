def compute_score(test):

    score = 0

    if test.get("priorite") == "Haute":
        score += 3

    elif test.get("priorite") == "Moyenne":
        score += 2

    elif test.get("priorite") == "Basse":
        score += 1

    if test.get("severite") == "Critique":
        score += 3

    elif test.get("severite") == "Élevée":
        score += 2

    elif test.get("severite") == "Moyenne":
        score += 1

    if test.get("type") == "Erreur":
        score += 2

    elif test.get("type") == "Limite":
        score += 1

    return score