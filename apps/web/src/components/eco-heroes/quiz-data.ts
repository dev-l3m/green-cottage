export type QuizChoice = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  title: string;
  correct: string;
  choices: QuizChoice[];
  explain: string;
  comment: string;
};

export type QuizPack = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  questions: QuizQuestion[];
};

export const QUIZ_PACKS: QuizPack[] = [
  {
    id: 'ecostar',
    title: 'Quiz Aventurier Ecostar',
    subtitle: 'Observation du ciel et eco-gestes energie en 7 questions.',
    badge: 'Nuit & energie',
    questions: [
      {
        title: 'Quelle est la consequence de la pollution lumineuse ?',
        correct: 'a',
        choices: [
          { id: 'a', label: 'Moins d etoiles visibles' },
          { id: 'b', label: 'Plus de chaleur' },
          { id: 'c', label: 'Plus de moustiques' },
        ],
        explain: 'La lumiere artificielle masque la voute celeste et perturbe la faune nocturne.',
        comment: 'Moins d etoiles : le ciel estompe par les eclairages rend les astres difficiles a voir.',
      },
      {
        title: 'Combien consomme un chargeur branche sans telephone ?',
        correct: 'b',
        choices: [
          { id: 'a', label: 'Rien du tout' },
          { id: 'b', label: 'Un peu d electricite' },
          { id: 'c', label: 'Autant qu un four' },
        ],
        explain: 'Meme sans appareil, un chargeur peut consommer un petit courant de fuite.',
        comment:
          'Un peu : on parle de vampire energetique, de quelques dixiemes de watt a quelques watts selon les modeles.',
      },
      {
        title: 'Quel appareil consomme le plus ?',
        correct: 'b',
        choices: [
          { id: 'a', label: 'Un chargeur de telephone' },
          { id: 'b', label: 'Un four electrique' },
          { id: 'c', label: 'Une lampe LED' },
        ],
        explain:
          'La cuisson chauffe : un four peut tirer 1,5 a 3 kW, bien plus qu un chargeur ou une petite LED.',
        comment: 'Le four : sa puissance est sans commune mesure avec un chargeur ou une lampe LED.',
      },
      {
        title: 'Pourquoi eteindre la lumiere en sortant d une piece ?',
        correct: 'a',
        choices: [
          { id: 'a', label: 'Pour economiser de l energie' },
          { id: 'b', label: 'Pour faire joli' },
          { id: 'c', label: 'Pour embeter les autres' },
        ],
        explain: 'Eteindre evite un gaspillage simple a corriger, surtout dans les pieces peu utilisees.',
        comment: 'Economiser : un geste facile qui reduit facture et impact carbone.',
      },
      {
        title: 'Quel astre est le plus facile a observer a l oeil nu ?',
        correct: 'b',
        choices: [
          { id: 'a', label: 'Mars' },
          { id: 'b', label: 'La Lune' },
          { id: 'c', label: 'Pluton' },
        ],
        explain: 'C est l astre le plus lumineux de la nuit.',
        comment: 'La Lune : immense, brillante et visible meme en ville.',
      },
      {
        title: 'Quelle constellation celebre ressemble a une casserole ?',
        correct: 'b',
        choices: [
          { id: 'a', label: 'Orion' },
          { id: 'b', label: 'La Grande Ourse' },
          { id: 'c', label: 'Cassiopee' },
        ],
        explain: 'L asterisme de la casserole est la partie la plus connue d Ursa Major.',
        comment: 'Grande Ourse : son chariot en forme de casserole est un repere facile.',
      },
      {
        title: 'Pourquoi eteindre les lumieres exterieures la nuit ?',
        correct: 'b',
        choices: [
          { id: 'a', label: 'Pour dormir' },
          { id: 'b', label: 'Pour economiser et voir les etoiles' },
          { id: 'c', label: 'Pour eviter les moustiques' },
        ],
        explain: 'Un eclairage inutile gene la faune nocturne et masque le ciel.',
        comment: 'Economiser et observer : moins de lumiere = moins d energie et un ciel plus visible.',
      },
    ],
  },
  {
    id: 'sentinelle-ecofire',
    title: 'Quiz de la Sentinelle Ecofire',
    subtitle: 'Repondez aux questions pour devenir un vrai gardien de la foret !',
    badge: 'Feux de foret',
    questions: [
      {
        title: 'Quelle est la principale cause des feux de foret en France ?',
        correct: 'c',
        choices: [
          { id: 'a', label: 'La foudre' },
          { id: 'b', label: 'Les megots de cigarette' },
          { id: 'c', label: 'Les barbecues et activites humaines' },
          { id: 'd', label: 'La lave des volcans' },
        ],
        explain:
          'La majorite des incendies en France sont lies aux activites humaines : barbecues, travaux, imprudences.',
        comment: "Bien vu ! Prevenir, c'est avant tout surveiller nos gestes du quotidien.",
      },
      {
        title: 'Combien d hectares de foret partent en fumee chaque annee en France en moyenne ?',
        correct: 'c',
        choices: [
          { id: 'a', label: '100' },
          { id: 'b', label: '1 000' },
          { id: 'c', label: '10 000' },
          { id: 'd', label: '100 000' },
        ],
        explain: 'Chaque annee, environ 10 000 hectares sont detruits par les flammes en France.',
        comment: 'Exact ! Cela equivaut a plus de 14 000 terrains de football.',
      },
      {
        title: 'Combien d animaux sauvages perissent chaque annee dans les incendies en France ?',
        correct: 'c',
        choices: [
          { id: 'a', label: 'Quelques centaines' },
          { id: 'b', label: 'Quelques milliers' },
          { id: 'c', label: 'Plusieurs centaines de milliers' },
          { id: 'd', label: 'Aucun, ils fuient tous' },
        ],
        explain: 'Les incendies detruisent des habitats et piegent de nombreux animaux.',
        comment: 'Tu as raison : la biodiversite est la premiere victime invisible du feu.',
      },
      {
        title: 'Pourquoi les megots jetes dehors sont-ils si dangereux ?',
        correct: 'b',
        choices: [
          { id: 'a', label: 'Ils polluent les sols' },
          { id: 'b', label: 'Ils restent incandescents plusieurs minutes' },
          { id: 'c', label: 'Ils sentent mauvais' },
          { id: 'd', label: 'Ils attirent les fourmis' },
        ],
        explain: 'Un megot peut couver et allumer un feu meme longtemps apres avoir ete jete.',
        comment: 'Exact ! 1 megot peut mettre le feu a tout un massif forestier.',
      },
      {
        title: 'Quelle plante fragile met plus de 20 ans a repousser apres un incendie ?',
        correct: 'c',
        choices: [
          { id: 'a', label: 'La fougere' },
          { id: 'b', label: 'Le pin maritime' },
          { id: 'c', label: 'Le chene-liege' },
          { id: 'd', label: 'Le pissenlit' },
        ],
        explain: 'Le chene-liege met plusieurs decennies a se regenerer apres les flammes.',
        comment: "Bravo ! Le chene-liege protege aussi les sols de l'erosion.",
      },
      {
        title: 'Quelle alternative est autorisee et securisee en ete ?',
        correct: 'c',
        choices: [
          { id: 'a', label: 'Barbecue au charbon' },
          { id: 'b', label: 'Brasero' },
          { id: 'c', label: 'Plancha electrique' },
          { id: 'd', label: 'Feu de camp' },
        ],
        explain: 'En periode estivale, seules les alternatives sans flammes sont autorisees.',
        comment: 'Correct ! La plancha electrique permet de profiter sans danger.',
      },
      {
        title: 'En plus des arbres, quel est l impact majeur des feux de foret ?',
        correct: 'b',
        choices: [
          { id: 'a', label: "Ils reduisent l oxygene" },
          { id: 'b', label: 'Ils detruisent les habitats des especes' },
          { id: 'c', label: 'Ils attirent des moustiques' },
          { id: 'd', label: 'Ils font baisser la temperature' },
        ],
        explain: 'Les incendies menacent directement la faune et detruisent les ecosystemes entiers.',
        comment: 'Exact ! Les animaux perdent refuge et nourriture.',
      },
    ],
  },
  {
    id: 'capitaine-ecoleau',
    title: 'Quiz Capitaine Ecoleau',
    subtitle: '1 question par ecran, repondez puis passez a la suivante.',
    badge: 'Eau',
    questions: [
      {
        title: 'Quelle est la duree ideale d une douche eco-heroique ?',
        correct: 'b',
        choices: [
          { id: 'a', label: '3 min' },
          { id: 'b', label: '5 min' },
          { id: 'c', label: '15 min' },
        ],
        explain: 'Objectif conseille : environ 5 minutes.',
        comment:
          '5 minutes : duree recommandee. Si vous tenez 3 minutes, vous etes un vrai heros de l eau.',
      },
      {
        title: 'Combien de litres consomme en moyenne une douche de 5 minutes ?',
        correct: 'b',
        choices: [
          { id: 'a', label: '40 L' },
          { id: 'b', label: '60 L' },
          { id: 'c', label: '100 L' },
        ],
        explain: 'Environ 12 L/min avec un pommeau standard, soit 60 L en 5 min.',
        comment: '60 L : avec un pommeau econome, on peut descendre encore plus bas.',
      },
      {
        title: 'Combien de litres consomme un bain ?',
        correct: 'c',
        choices: [
          { id: 'a', label: '50 L' },
          { id: 'b', label: '120 L' },
          { id: 'c', label: '200 L' },
        ],
        explain: 'Un bain plein tourne souvent entre 150 et 200 L.',
        comment: '200 L : un bain peut consommer 2 a 3 fois une douche rapide.',
      },
      {
        title: 'Quelle proportion de l eau sur Terre est potable ?',
        correct: 'a',
        choices: [
          { id: 'a', label: '2,5 %' },
          { id: 'b', label: '10 %' },
          { id: 'c', label: '25 %' },
        ],
        explain: 'L eau douce represente environ 2,5 % du total, et la part directement potable est plus faible.',
        comment: '2,5 % : la ressource est limitee, chaque geste compte.',
      },
      {
        title: 'Combien d humains n ont pas acces a l eau potable ?',
        correct: 'c',
        choices: [
          { id: 'a', label: '500 millions' },
          { id: 'b', label: '1 milliard' },
          { id: 'c', label: '2 milliards' },
        ],
        explain: 'Environ 2 milliards n ont pas acces a une eau geree en toute securite.',
        comment: '2 milliards : presque 1 humain sur 4.',
      },
      {
        title: 'Quelle ressource est la plus menacee dans le monde ?',
        correct: 'b',
        choices: [
          { id: 'a', label: 'Le petrole' },
          { id: 'b', label: 'L eau douce' },
          { id: 'c', label: 'L or' },
        ],
        explain: 'L eau douce est au coeur des tensions en quantite, qualite et repartition.',
        comment: 'L eau douce : plus vitale que toutes les autres ressources.',
      },
      {
        title: '7) Comment proteger l eau au quotidien ?',
        correct: 'a',
        choices: [
          { id: 'a', label: 'a) Douches courtes et robinets fermes' },
          { id: 'b', label: 'b) Laisser couler pendant le brossage' },
          { id: 'c', label: 'c) Remplir la baignoire a chaque fois' },
        ],
        explain: 'Les petits gestes repetes ont un impact direct sur la consommation.',
        comment: 'Exact : chaque litre economise preserve une ressource vitale.',
      },
    ],
  },
  {
    id: 'chercheur-ecobee',
    title: 'Quiz Chercheur Ecobee',
    subtitle: '1 question par ecran, repondez puis passez a la suivante.',
    badge: 'Pollinisation',
    questions: [
      {
        title: 'Quel pourcentage des cultures mondiales dependent des insectes pollinisateurs ?',
        correct: 'c',
        choices: [
          { id: 'a', label: '25 %' },
          { id: 'b', label: '50 %' },
          { id: 'c', label: '75 %' },
        ],
        explain: 'De nombreuses cultures dependent des pollinisateurs.',
        comment: '75 % : trois quarts des cultures alimentaires en dependent.',
      },
      {
        title: 'Quelle espece est le principal pollinisateur ?',
        correct: 'b',
        choices: [
          { id: 'a', label: 'La fourmi' },
          { id: 'b', label: 'L abeille' },
          { id: 'c', label: 'Le moustique' },
        ],
        explain: 'Beaucoup d insectes pollinisent, mais les abeilles jouent un role majeur.',
        comment: 'L abeille reste l actrice cle de la pollinisation.',
      },
      {
        title: 'Les chauves-souris sont utiles car elles :',
        correct: 'c',
        choices: [
          { id: 'a', label: 'Boivent le nectar' },
          { id: 'b', label: 'Mangent les insectes nuisibles' },
          { id: 'c', label: 'Pollinisent les fleurs' },
        ],
        explain: 'Certaines especes nectarivores transportent le pollen.',
        comment: 'Pollinisent : elles participent aussi aux equilibres naturels.',
      },
      {
        title: 'Que se passerait-il sans pollinisation ?',
        correct: 'a',
        choices: [
          { id: 'a', label: 'Moins de fruits et legumes' },
          { id: 'b', label: 'Plus de viande' },
          { id: 'c', label: 'Plus d arbres' },
        ],
        explain: 'De nombreuses plantes ne fructifient pas sans pollinisation.',
        comment: 'Moins de fruits et legumes : baisse des rendements et de la diversite.',
      },
      {
        title: 'Quelle espece d oiseau nocturne frequente les forets d Isere ?',
        correct: 'a',
        choices: [
          { id: 'a', label: 'La chouette hulotte' },
          { id: 'b', label: 'Le pigeon' },
          { id: 'c', label: 'Le corbeau' },
        ],
        explain: 'Rapace nocturne tres commun en Europe, present en Isere.',
        comment: 'La chouette hulotte est emblematique des milieux boises.',
      },
      {
        title: 'Que faire si tu croises une araignee dans le gite ?',
        correct: 'b',
        choices: [
          { id: 'a', label: 'La tuer' },
          { id: 'b', label: 'La mettre dehors doucement' },
          { id: 'c', label: 'L ignorer' },
        ],
        explain: 'Les araignees sont utiles pour reguler les insectes.',
        comment: 'La mettre dehors : utile et sans la blesser.',
      },
      {
        title: 'Quelle menace pese sur les abeilles aujourd hui ?',
        correct: 'a',
        choices: [
          { id: 'a', label: 'Les pesticides' },
          { id: 'b', label: 'Les predateurs naturels' },
          { id: 'c', label: 'Le bruit' },
        ],
        explain: 'Plusieurs facteurs existent, mais les pesticides ont un impact majeur.',
        comment: 'Les pesticides fragilisent fortement les colonies.',
      },
    ],
  },
  {
    id: 'gardien-ecoshare',
    title: 'Quiz Gardien Ecoshare',
    subtitle: '1 question par ecran, repondez puis passez a la suivante.',
    badge: 'Partage',
    questions: [
      {
        title: 'La piscine est :',
        correct: 'b',
        choices: [
          { id: 'a', label: 'Privee pour un seul gite' },
          { id: 'b', label: 'Partagee entre les voyageurs' },
          { id: 'c', label: 'Publique pour tout le village' },
        ],
        explain: 'Les equipements communs sont partages par tous les hotes.',
        comment: 'Partagee : on respecte horaires, securite et partage equitable.',
      },
      {
        title: 'Quelle regle d or s applique aux espaces communs ?',
        correct: 'a',
        choices: [
          { id: 'a', label: 'Respect et partage' },
          { id: 'b', label: 'Accaparement' },
          { id: 'c', label: 'Silence absolu' },
        ],
        explain: 'Les espaces communs sont penses pour la convivialite.',
        comment: 'Respect et partage : on laisse la place aux autres.',
      },
      {
        title: 'Que faire si un enfant veut jouer a la balancoire occupee ?',
        correct: 'a',
        choices: [
          { id: 'a', label: 'Lui dire d attendre son tour' },
          { id: 'b', label: 'Le repousser' },
          { id: 'c', label: 'Quitter la zone' },
        ],
        explain: 'Le tour de role favorise la bonne entente.',
        comment: 'Attendre son tour : chacun profite du jeu.',
      },
      {
        title: 'Un bon voisin ideal se definit par :',
        correct: 'a',
        choices: [
          { id: 'a', label: 'L ecoute et la politesse' },
          { id: 'b', label: 'Le fait de rester isole' },
          { id: 'c', label: 'La domination des espaces' },
        ],
        explain: 'Une attitude bienveillante facilite la cohabitation.',
        comment: 'Ecoute et politesse : base du vivre-ensemble.',
      },
      {
        title: 'Pourquoi la communication est essentielle en espaces partages ?',
        correct: 'a',
        choices: [
          { id: 'a', label: 'Pour eviter les malentendus' },
          { id: 'b', label: 'Pour faire du bruit' },
          { id: 'c', label: 'Pour obtenir des privileges' },
        ],
        explain: 'Parler avant d agir evite tensions et incomprehensions.',
        comment: 'Eviter les malentendus : un echange cordial suffit souvent.',
      },
      {
        title: 'Que faire si la salle commune est occupee ?',
        correct: 'b',
        choices: [
          { id: 'a', label: 'Entrer de force' },
          { id: 'b', label: 'Attendre son tour ou convenir d un partage' },
          { id: 'c', label: 'Abandonner' },
        ],
        explain: 'On peut s organiser sur des horaires pour tous.',
        comment: 'Attendre ou partager : on respecte ceux qui utilisent deja.',
      },
      {
        title: 'L attitude la plus eco-responsable dans un lieu partage est :',
        correct: 'a',
        choices: [
          { id: 'a', label: 'Nettoyer et ranger apres usage' },
          { id: 'b', label: 'Tout laisser en plan' },
          { id: 'c', label: 'Reprocher aux autres' },
        ],
        explain: 'De bons reflexes garantissent un espace propre et agreable.',
        comment: 'Nettoyer et ranger : on laisse impeccable pour les suivants.',
      },
    ],
  },
];
