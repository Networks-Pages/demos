(function(exports) {

  const DEFAULT_LANGUAGE = 'nl';
  const i18n = {
    en: {
      // interface elements
      'add-node': 'Add node',
      'hide': 'Hide instructions',
      'instructions-1': `In this game, each participant adds a single node to
        the network and chooses two neighbors that this node connects to. You
        can only connect to nodes that have <b>less than 5 neighbors</b>. `,
      'instructions-2': `At the
        end of the game, we will percolate the graph: half of the links will be
        removed at random.
        The game is won by the players whose nodes end up in
        the <i>largest</i> connected component after percolation. When multiple
        components have equal size, all win.`,
      'instructions-3': `You can <b>add your node</b> by clicking the two
        neighbors that you want to connect to, typing your name in the textfield
        and clicking the button "Add node".`,
      'instructions-perc': `<b>Percolation theory</b> is a branch of mathematics
        on the interface between graph theory and probability theory. The term
        'percolation' originates from material sciences. Within mathematics,
        percolation is considered to be the process of removing network-links at random.
        The easiest way to do this, is by a (possibly biased) coinflip for each link,
        deleting the link when heads is thrown and deleting the link otherwise.
        The question then, is what the network looks like after this process.
        In this game, we will experience this process in practice!`,
      'page-title': 'Network Game',
      'refresh': 'Refresh',
      'show': 'Show instructions',
      'title': 'Instructions',
      'your-name': 'Your name',

      // alerts and other interactive elements
      'error': 'Error',
      'node-added': 'You added a node, thank you!',
      'node-added-title': 'Hooray!',
      'node-name': 'Please specify a name for your node.',
      'select-nodes': 'Please select two nodes you want to connect to first.',
    },
    nl: {
      // interface elements
      'add-node': 'Voeg knoop toe',
      'hide': 'Verberg instructies',
      'instructions-1': `In dit netwerkspel mag elke deelnemer een knoop met
        hun naam aan het netwerk toevoegen, die verbonden moet zijn met precies
        twee andere knopen. Je kunt alleen verbinding maken met knopen die
        <b>minder dan vijf buren</b> hebben.`,
      'instructions-2': `Aan het eind van het spel wordt
        een willekeurige helft van de verbindingen verwijderd. Hierdoor zullen
        gedeelten van het netwerk losgekoppeld worden van de rest.
        De spelers die vervolgens in het grootste overgebleven
        verbonden deelnetwerk zitten, winnen het spel. Als er meerdere
        deelnetwerken met evenveel knopen overblijven, winnen spelers in al deze
        deelnetwerken.`,
      'instructions-3': `Je kunt <b>jouw knoop toevoegen</b> aan het netwerk
        door op de twee knopen te klikken waarmee je verbinding wilt leggen, je
        naam in te vullen en op "Voeg knoop toe" te klikken.`,
      'instructions-perc': `<b>Percolatietheorie</b> is een vertakking van de wiskunde op het snijvlak
        tussen kansrekening en grafentheorie. De term 'percolatie' komt
        oorspronkelijk uit de materiaalkunde. Binnen de wiskunde wordt percolatie beschouwd als
        het proces van het willekeurig verwijderen van verbindingen in een netwerk.
        De eenvoudigste manier om percolatie te doen is door voor iedere verbinding
        een (mogelijk oneerlijke) munt op te gooien en de verbinding bij kop te verwijderen.
        Men is vervolgens geïnteresseerd in hoe het resulterende netwerk eruit ziet.
        In dit spel gaan we dit samen live ontdekken!`,
      'page-title': 'Netwerkspel',
      'refresh': 'Verversen',
      'show': 'Toon instructies',
      'title': 'Instructies',
      'your-name': 'Jouw naam',

      // alerts and other interactive elements
      'error': 'Fout',
      'node-added': 'Je hebt een knoop toegevoegd, bedankt!',
      'node-added-title': 'Hoera!',
      'node-name': 'Geef een naam op voor je knoop.',
      'select-nodes': 'Selecteer eerst twee knopen om mee te verbinden.',
    }
  };
  var lang = navigator.language.substring(0, 2),
      data = new URLSearchParams(window.location.search);
  if (data.has('lang') && i18n.hasOwnProperty(data.get('lang'))) {
    lang = data.get('lang');
  } else if (!i18n.hasOwnProperty(lang)) {
    lang = DEFAULT_LANGUAGE;
  }

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

  exports.i18n = {
    t: function(key) {
      if (!i18n[lang].hasOwnProperty(key)) {
        return `?${key}?`;
      }
      return i18n[lang][key];
    }
  };

}(window));
