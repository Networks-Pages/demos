(function(exports) {

  const DEFAULT_LANGUAGE = 'nl';
  const i18n = {
    en: {
      // interface elements
      'about': `This game introduces percolation theory in a light-mannered way.
        It was designed and built originally for the <a
        href="https://nvvw.nl/jaarvergadering/jaarvergadering-studiedag-2020/">
        NVvW study day 2020</a> and has since been improved and extended to
        support concurrent "play sessions" in so-called rooms. Development was
        done by Thom Castermans and Martijn Gösgens. Special thanks to Nicos
        Starreveld for the idea and coordination. You can find the code on <a
        href="https://github.com/Networks-Pages/demos/tree/master/percolation-game">
        GitHub</a>; try to run it locally if you are interested, improvements
        and additions are welcome.`,
      'add-node': 'Add node',
      'hide': 'Hide instructions',
      'index-title': 'Network Game',
      'index-title-about': 'About the Game',
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
      'nodes': 'nodes',
      'page-title': 'Network Game',
      'percolation-do': 'Do percolation',
      'percolation-speed': 'Percolation speed',
      'reset': 'Reset network',
      'restrict-multiple-nodes': 'At most one node per IP address',
      'room-feedback-empty': 'Cannot be empty or only whitespace.',
      'room-feedback-taken': 'That name is already taken.',
      'room-name': 'Room name',
      'secret': 'secret',
      'room-created': 'Your classroom has been created!',
      'secret-is': `The password for your room is <b>%s</b>. Do not forget this password! Without it, you won't be able to manage this room.`,
      'show': 'Show instructions',
      'title': 'Instructions',
      'welcome-1': `This is the overview page of the network game. Select your
        room to start. Looking for instructions? Please read <a
        href="/percolation-game-is-online/">this article</a>.`,
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
      'about': `Dit spel introduceert percolatie theorie en bovenal netwerken,
        op een speelse manier. Het is oorspronkelijk bedacht en gebouwd voor de
        <a href="https://nvvw.nl/jaarvergadering/jaarvergadering-studiedag-2020/">
        NVvW studiedag 2020</a> en is daarna verbeterd en uitgebreid met
        functionaliteit om parallelle speelsessies in zogenaamde klaslokalen te
        ondersteunen. Thom Castermans en Martijn Gösgens hebben het spel
        ontwikkeld, met dank aan Nicos Starreveld voor het idee en de
        coördinatie. Je kunt de broncode terugvinden op <a
        href="https://github.com/Networks-Pages/demos/tree/master/percolation-game">
        GitHub</a>; probeer het eens lokaal uit te voeren als je geïnteresseerd
        bent, verbeteringen en aanvullingen zijn welkom.`,
      'add-node': 'Voeg knoop toe',
      'hide': 'Verberg instructies',
      'index-title': 'Netwerkspel',
      'index-title-about': 'Over het spel',
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
      'nodes': 'knopen',
      'page-title': 'Netwerkspel',
      'percolation-do': 'Voer percolatie uit',
      'percolation-speed': 'Percolatie snelheid',
      'reset': 'Reset netwerk',
      'restrict-multiple-nodes': 'Maximaal een knoop per IP-adres',
      'room-feedback-empty': 'Mag niet leeg zijn of alleen witruimte.',
      'room-feedback-taken': 'Die naam is al bezet.',
      'room-name': 'Naam klaslokaal',
      'secret': 'wachtwoord',
      'room-created': 'Je klaslokaal is aangemaakt!',
      'secret-is': `Het wachtwoord voor dit lokaal is <b>%s</b>. Noteer of kopieer dit wachtwoord zodat je het niet vergeet! Zonder dit wachtwoord kun je het lokaal niet beheren.`,
      'show': 'Toon instructies',
      'title': 'Instructies',
      'welcome-1': `Dit is de overzichtspagina van het netwerkspel. Selecteer je
        klaslokaal om te beginnen. Lees <a href="/percolation-game-is-online/">
        dit artikel</a> (EN) als je wat meer toelichting/hulp nodig hebt.`,
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

  var langSelect = document.getElementById(`lang-${lang}`);
  if (langSelect !== null) {
    langSelect.disabled = true;
    langSelect.classList.add('lang-selected');
    langSelect.addEventListener('click', (e) => e.preventDefault());
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
