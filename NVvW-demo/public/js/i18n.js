(function() {

  const i18n = {
    nl: {
      'add-node': 'Voeg knoop toe',
      'title': 'Instructies',
      'instructions-1': `In dit netwerkspel mag elke deelnemer een knoop met
      hun naam aan het netwerk toevoegen, die verbonden moet zijn met precies
      twee andere knopen. Je kunt alleen verbinding maken met knopen die
      <b>minder dan vijf buren</b> hebben. Op het eind van het spel worden alle
      kanten (verbindingen) met een onafhankelijke kans van 50% verwijderd uit
      het netwerk.`,
      'instructions-2': `De spelers die in het grootste deelnetwerk zitten,
      winnen het spel. Wanneer er meerdere deelnetwerken met evenveel knopen
      overblijven, winnen spelers in al die netwerken.`,
      'instructions-3': `Je kunt <b>jouw knoop toevoegen</b> aan het netwerk
      door op de twee knopen te klikken waarmee je verbinding wilt leggen, je
      naam in te vullen en op "Voeg knoop toe" te klikken.`,
      'page-title': 'Netwerkspel',
      'refresh': 'Verversen',
      'your-name': 'Jouw naam'
    }
  };
  const lang = 'nl';//navigator.language.substring(0, 2);

  if (i18n.hasOwnProperty(lang)) {
    for (let node of document.querySelectorAll('[data-i18n-key]')) {
      if (i18n[lang].hasOwnProperty(node.dataset.i18nKey)) {
        if ('i18nAttr' in node.dataset) {
          node.setAttribute(node.dataset.i18nAttr,
              i18n[lang][node.dataset.i18nKey]);
        } else {
          node.innerHTML = i18n[lang][node.dataset.i18nKey];
        }
      }
    }
  }

}());
