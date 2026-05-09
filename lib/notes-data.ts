export type NoteBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "tags"; items: string[] };

export type Note = {
  id: string;
  emoji: string;
  title: string;
  daysAgo: number; // 0 = today, 1 = yesterday, etc.
  preview: string;
  pinned?: boolean;
  blocks: NoteBlock[];
  // When true, headings act as tap-to-expand sections (default: collapsed).
  collapsibleSections?: boolean;
  // Headings listed here stay open and don't show a toggle.
  alwaysExpandedHeadings?: string[];
};

// Note: Inline links use markdown syntax: [label](url) becomes a styled link.
// Plain placeholders like [your name] stay as plain text.

export const notes: Note[] = [
  {
    id: "about-me",
    emoji: "📌",
    title: "about me",
    daysAgo: 0,
    preview: "devops engineer · building omni and centient",
    pinned: true,
    blocks: [
      { type: "paragraph", text: "i'm kwasi (pronounced qu-ah-see). i'm so cool, what can't i do?" },
      { type: "heading", text: "currently" },
      {
        type: "list",
        items: [
          "building [omni](https://omnilabsghana.tech/) — africa's customer service and commerce layer",
          "building centient — for renewable energy",
          "devops engineer at [inpath technologies](https://www.inpathgroup.africa/)",
          "based in accra",
        ],
      },
      { type: "heading", text: "previously" },
      {
        type: "list",
        items: [
          "devops engineer at axon information systems · 2021–2024",
          "coding teacher · trained 700 primary school kids",
          "studied management information systems at [ashesi university](https://ashesi.edu.gh/) · 2017–2021",
        ],
      },
      { type: "heading", text: "stack" },
      {
        type: "tags",
        items: [
          "python",
          "typescript",
          "java",
          "kubernetes",
          "aws",
          "docker",
          "terraform",
          "azure",
        ],
      },
      { type: "heading", text: "i like" },
      {
        type: "tags",
        items: [
          "sports",
          "music",
          "movies",
          "the arts",
          "puzzles",
          "chess",
          "friends",
          "cooking",
          "baking",
          "laughing",
          "languages",
          "history",
          "perfumes",
        ],
      },
      { type: "heading", text: "i play" },
      {
        type: "tags",
        items: [
          "tennis",
          "swimming",
          "football",
          "basketball",
          "padel",
          "table tennis",
        ],
      },
      { type: "heading", text: "i speak" },
      {
        type: "tags",
        items: ["english", "french", "twi", "fante", "effutu"],
      },
      {
        type: "paragraph",
        text: "and learning spanish — ask me how it's going by end of year.",
      },
      { type: "heading", text: "teams/athletes i back" },
      {
        type: "list",
        items: [
          "lebron raymone james (GOAT)", 
          "chelsea fc",
          "los angeles lakers",
          "mercedes-amg petronas f1 (only here for george russell never broke again)",
          "carlos alcaraz",
          "los angeles dodgers",
          "los angeles rams",
        ],
      },
      { type: "heading", text: "wins" },
      {
        type: "list",
        items: [
          "ashesi basketball association — coach of the year, 2022 (12-0, no defeats)",
          "sunday league football champion",
        ],
      },
    ],
  },
  {
    id: "quick-links",
    emoji: "🔗",
    title: "quick links",
    daysAgo: 0,
    preview: "linkedin · email · substack · daily games",
    pinned: true,
    blocks: [
      { type: "heading", text: "find me" },
      {
        type: "list",
        items: [
          "linkedin — [kwasi-asiedu-mensah](https://www.linkedin.com/in/kwasi-asiedu-mensah) (send me a connection — trying to network ☺️)",
          "email — [kwasiasiedumensah@gmail.com](mailto:kwasiasiedumensah@gmail.com) (inbox zero — i reply every mail)",
          "website — you're here",
          "substack — [coolshugz](https://substack.com/@coolshugz) (i write sometimes — please critique me)",
        ],
      },
      { type: "heading", text: "elsewhere" },
      {
        type: "list",
        items: [
          "chess — [challenge me to a 3-day game](https://link.chess.com/play/2zSflI)",
        ],
      },
      { type: "heading", text: "daily games" },
      {
        type: "list",
        items: [
          "[minute cryptic](https://www.minutecryptic.com/) — try to stay under par",
          "[wordle](https://www.nytimes.com/games/wordle/index.html) — 100% record. best to ever do it",
          "[connections](https://www.nytimes.com/games/connections) — no more than 2 hints",
          "[strands](https://www.nytimes.com/games/strands) — no hints. believe in yourself",
          "[mini crossword](https://www.nytimes.com/crosswords/game/mini) — it's the mini. come onnnn",
          "[sudoku](https://www.nytimes.com/puzzles/sudoku) — finish all 3 levels",
          "[pips](https://www.nytimes.com/games/pips) — finish all 3 levels here too",
        ],
      },
    ],
  },
  {
    id: "principles",
    emoji: "📖",
    title: "principles",
    daysAgo: 0,
    preview: "always find the balance · do it every day",
    blocks: [
      { type: "heading", text: "how i work" },
      {
        type: "list",
        items: [
          "always find the balance",
          "do it every day",
          "close the loop",
          "never take anything for granted",
          "talk on defense",
          "lots of things matter a lot",
          "few things matter a little",
          "slow is smooth, smooth is fast",
          "say what you mean",
          "details matter — sweat the details",
          "hands up, feet set",
          "[80::20](https://en.wikipedia.org/wiki/Pareto_principle) signal::noise",
          "[never attribute to malice first](https://en.wikipedia.org/wiki/Hanlon%27s_razor)",
          "cover the zone",
          "act from love and kindness",
          "kindness is renewable",
          "move without the ball",
          "[make the implicit explicit](https://en.wikipedia.org/wiki/Tacit_knowledge)",
          "[make the unconscious conscious](https://en.wikipedia.org/wiki/Carl_Jung)",
          "eyes on the rim",
          "ship it",
          "[manage your context window](https://en.wikipedia.org/wiki/Large_language_model)",
          "win the 50/50",
          "the most important conversation is the one you don't want to have",
          "always stay curious",
          "finish through contact",
          "stay loyal till it's not deserved",
          "[keep questioning everything](https://en.wikipedia.org/wiki/Socratic_method)",
          "head up always",
          "be grateful always",
          "do it afraid, do it scared",
          "everyday is arm day",
          "[leave it better than you found it](https://en.wikipedia.org/wiki/Scout_Law)",
          "marathon, not sprint",
          "tether yourself lest you get lost",
          "[all works together for your good](https://en.wikipedia.org/wiki/Romans_8)",
          "do something physical every day",
          "when in doubt, be still",
        ],
      },
      { type: "heading", text: "what i value" },
      {
        type: "list",
        items: [
          "kindness",
          "gratitude",
          "love",
          "loyalty",
          "honesty",
          "humility",
          "good critique",
          "curiosity",
          "appreciation for the arts",
          "thoughtfulness",
        ],
      },
    ],
  },
  {
    id: "bookmarks",
    emoji: "🔖",
    title: "bookmarks",
    daysAgo: 0,
    preview: "quotes that live rent-free · jung · kobe · jobs · virgil",
    collapsibleSections: true,
    alwaysExpandedHeadings: ["rent-free"],
    blocks: [
      { type: "heading", text: "rent-free (i'm always saying these things)" },
      {
        type: "list",
        items: [
          "“the cost of avoiding structure is that every day has to be renegotiated from scratch.” — random tweet",
          "“whatever you do, do not take anything for granted my son.” — my dad",
          "“ there are cathedrals everywhere for those with the eyes to see.” — [jordan peterson](https://x.com/jordanbpeterson/status/1633882580746653696)",
          "“stay hungry. stay foolish.” — [steve jobs, stanford 2005](https://news.stanford.edu/2005/06/14/jobs-061505/)",
          "“the map is not the territory, neither is the menu the dinner.” — alan watts",
          "“the marathon continues.” — nipsey hussle",
          "“and i took that personally.” — michael jordan, the last dance",
          "“set your heart ablaze.” — kyojuro rengoku, demon slayer",
          "“throughout heaven and earth, i alone am the honored one.” — sukuna / gojo, jujutsu kaisen",
          "“be water, my friend.” — bruce lee",
          "“the impediment to action advances action. what stands in the way becomes the way.” — marcus aurelius",
          "“effort doesn't betray you.” — coach kamogawa, hajime no ippo",
          "“the cost of community is inconvenience.” — random",
          "“i came, i saw, i conquered.” — julius caesar",
          "“by order of the peaky blinders.” — tommy shelby, peaky blinders",
          "“you either die a hero, or you live long enough to see yourself become the villain.” — harvey dent, the dark knight",
          "“winter is coming.” — house stark, game of thrones",
          "“all in the game.” — omar little, the wire",
          "“there are no accidents.” — master oogway, kung fu panda",
          "“a lion does not concern himself with the opinions of the sheep.” — tywin lannister, game of thrones",
          "“there are known knowns and there are known unknowns, but there are also unknown unknowns; things we don't know that we don't know.” — rummy, the boondocks",





        ],
      },
      { type: "heading", text: "the psyche" },
      {
        type: "list",
        items: [
          "“who looks outside, dreams; who looks inside, awakes.” — carl jung",
          "“until you make the unconscious conscious, it will direct your life and you will call it fate.” — carl jung",
          "“the privilege of a lifetime is to become who you truly are.” — carl jung",
          "“everything that irritates us about others can lead us to an understanding of ourselves.” — carl jung",
          "“reality is what you can get away with.” — robert anton wilson",
          "“convictions create convicts.” — robert anton wilson",
          "“think for yourself; question authority.” — timothy leary",
          "“you're only as young as the last time you changed your mind.” — timothy leary",
          "“he who has a why to live for can bear almost any how.” — friedrich nietzsche",
          "“you must have chaos within you to give birth to a dancing star.” — friedrich nietzsche",
          "“he who fights with monsters should look to it that he himself does not become a monster. and if you gaze long into an abyss, the abyss also gazes into you.” — friedrich nietzsche",
          "“between stimulus and response there is a space. in that space is our power to choose our response.” — viktor frankl",
          "“everything can be taken from a man but one thing: the last of the human freedoms — to choose one's attitude in any given set of circumstances.” — viktor frankl, man's search for meaning",
          "“follow your bliss.” — joseph campbell",
          "“the cave you fear to enter holds the treasure you seek.” — joseph campbell",
          "“we must let go of the life we have planned, so as to accept the one that is waiting for us.” — joseph campbell",
          "“there are things known and there are things unknown, and in between are the doors of perception.” — aldous huxley",
          "“most ignorance is vincible ignorance. we don't know because we don't want to know.” — aldous huxley",
          "“nature loves courage.” — terence mckenna",
          "“the artist's task is to save the soul of mankind.” — terence mckenna",
          "“it is no measure of health to be well adjusted to a profoundly sick society.” — jiddu krishnamurti",
          "“the ability to observe without evaluating is the highest form of intelligence.” — jiddu krishnamurti",
          "“we are all just walking each other home.” — ram dass",
          "“the quieter you become, the more you can hear.” — ram dass",
          "“without struggle, no progress and no result. every breaking of habit produces a change in the machine.” — g.i. gurdjieff",
          "“man cannot do; everything happens to him. until man can become his own master, he is a machine.” — g.i. gurdjieff",
          "“take the understanding of the east and the knowledge of the west — and then seek.” — g.i. gurdjieff",
        ],
      },
      { type: "heading", text: "the sages" },
      {
        type: "list",
        items: [
          "“as above, so below; as within, so without.” — [the kybalion](https://www.sacred-texts.com/eso/kyb/)",
          "“the lips of wisdom are closed, except to the ears of understanding.” — hermes trismegistus",
          "“the mind is everything. what you think, you become.” — buddha",
          "“three things cannot be long hidden: the sun, the moon, and the truth.” — buddha",
          "“holding onto anger is like drinking poison and expecting the other person to die.” — buddha",
          "“i can do everything through him who gives me strength.” — philipians 4:13",
          "“love thy neighbor as thyself.” — jesus christ, matthew 22:39",
          "“the kingdom of God is within you.” — jesus christ, luke 17:21",
        ],
      },
      { type: "heading", text: "the builders" },
      {
        type: "list",
        items: [
          "“your time is limited, so don't waste it living someone else's life.” — steve jobs",
          "“the people who are crazy enough to think they can change the world are the ones who do.” — steve jobs",
          "“design is not just what it looks like. design is how it works.” — steve jobs",
          "“simplicity is the ultimate sophistication.” — leonardo da vinci",
          "“learning never exhausts the mind.” — leonardo da vinci",
          "“obstacles cannot crush me; every obstacle yields to stern resolve.” — leonardo da vinci",
          "“if you can dream it, you can do it.” — walt disney",
          "“all our dreams can come true, if we have the courage to pursue them.” — walt disney",
          "“i knew that if i failed i wouldn't regret that, but i knew the one thing i might regret is not trying.” — jeff bezos",
          "“your brand is what other people say about you when you're not in the room.” — jeff bezos",
          "“whether you think you can, or you think you can't — you're right.” — henry ford",
          "“only the paranoid survive.” — andy grove, intel",
          "“competition is for losers.” — peter thiel, zero to one",
          "“starting a company is like throwing yourself off a cliff and assembling an airplane on the way down.” — reid hoffman",
          "“make something people want.” — paul graham, y combinator",
          "“the most dangerous form of procrastination is the kind disguised as work.” — paul graham",
        ],
      },
      { type: "heading", text: "the artists" },
      {
        type: "list",
        items: [
          "“if you enter this world knowing you are loved and you leave this world knowing the same, then everything that happens in between can be dealt with.” — michael jackson",
          "“lies run sprints, but the truth runs marathons.” — michael jackson",
          "“everything i do is for the seventeen-year-old version of myself.” — virgil abloh",
          "“if you don't have a seat at the table, build your own.” — virgil abloh",
          "“you're in charge of your own narrative.” — virgil abloh",
          "“i don't think about art when i'm working. i try to think about life.” — jean-michel basquiat",
          "“every child is an artist. the problem is how to remain an artist once we grow up.” — pablo picasso",
          "“good artists copy, great artists steal.” — pablo picasso",
          "“don't think about making art, just get it done. let everyone else decide if it's good or bad. while they are deciding, make even more art.” — andy warhol",
          "“the best art divides the audience.” — rick rubin, the creative act",
          "“i don't know where i'm going from here, but i promise it won't be boring.” — david bowie",
          "“compassion is an action word with no boundaries.” — prince",
        ],
      },
      { type: "heading", text: "the conquerors" },
      {
        type: "list",
        items: [
          "“never interrupt your enemy when he is making a mistake.” — napoleon bonaparte",
          "“victory belongs to the most persevering.” — napoleon bonaparte",
          "“glory is fleeting, but obscurity is forever.” — napoleon bonaparte",
          "“he who fears being conquered is sure of defeat.” — napoleon bonaparte",
          "“there is nothing impossible to him who will try.” — alexander the great",
          "“i am not afraid of an army of lions led by a sheep; i am afraid of an army of sheep led by a lion.” — alexander the great",
          "“the supreme art of war is to subdue the enemy without fighting.” — sun tzu, the art of war",
          "“appear weak when you are strong, and strong when you are weak.” — sun tzu, the art of war",
          "“know your enemy and know yourself; in a hundred battles, you will never be defeated.” — sun tzu, the art of war",
          "“conquering the world on horseback is easy; it is dismounting and governing that is hard.” — genghis khan",
          "“an action committed in anger is an action doomed to failure.” — genghis khan",
          "“men in general are quick to believe that which they wish to be true.” — julius caesar",
          "“we will either find a way, or make one.” — hannibal barca",
          "“never leave an enemy behind, or it will rise again to fly at your throat.” — shaka zulu",
          "“mamba mentality is about being the best version of yourself.” — kobe bryant",
          "“great things come from hard work and perseverance. no excuses.” — kobe bryant",
          "“the most important thing is to try and inspire people, so they can be great at whatever they want to do.” — kobe bryant",
          "“nothing is given. everything is earned.” — lebron james",
          "“you have to be able to accept failure to get better.” — lebron james",
        ],
      },
      { type: "heading", text: "podcasts" },
      {
        type: "list",
        items: [
          "“discipline is the bridge between goals and accomplishment.” — david goggins on doac",
          "“happiness is your default state — anything that takes you out of it is a model error.” — mo gawdat on doac",
          "“protect your peace, even if you have to walk away from people.” — trent shelton on doac",
          "“you don't rise to the level of your goals, you fall to the level of your systems.” — james clear on tim ferriss",
          "“the magic you're looking for is in the work you're avoiding.” — chris williamson, modern wisdom",
          "“what we fear doing most is usually what we most need to do.” — tim ferriss",
          "“stay hard.” — david goggins on jre",
          "“founders study founders.” — david senra, founders podcast",
          "“the obstacle is the way.” — ryan holiday, the daily stoic",
          "“your environment is the invisible hand that shapes behavior.” — andrew huberman, huberman lab",
        ],
      },
      { type: "heading", text: "films & shows" },
      {
        type: "list",
        items: [
          "“love is the one thing we're capable of perceiving that transcends dimensions of time and space.” — brand, interstellar",
          "“the only thing that's certain about tomorrow is that it will betray today.” — tommy shelby, peaky blinders",
          "“live now, because tomorrow we may all be dead.” — tommy shelby, peaky blinders",
          "“why do we fall, sir? so that we can learn to pick ourselves up.” — alfred, batman begins",
          "“it's not who i am underneath, but what i do that defines me.” — bruce wayne, batman begins",
          "“the night is darkest just before the dawn.” — harvey dent, the dark knight",
          "“some men just want to watch the world burn.” — alfred, the dark knight",
          "“you come at the king, you best not miss.” — omar little, the wire",
          "“a man got to have a code.” — bunk moreland, the wire",
          "“chaos isn't a pit. chaos is a ladder.” — petyr baelish, game of thrones",
          "“power resides where men believe it resides.” — varys, game of thrones",
          "“yesterday is history, tomorrow is a mystery, but today is a gift. that is why it is called the present.” — master oogway, kung fu panda",
          "“anything is possible when you have inner peace.” — master shifu, kung fu panda",
          "“if you look for the light, you can often find it. but if you look for the dark, that is all you'll ever see.” — uncle iroh, avatar: the last airbender",
          "“destiny is a funny thing. you never know how things are going to work out.” — uncle iroh, avatar: the last airbender",
          "“we are who we choose to be.” — uncle iroh, avatar: the last airbender",
          "“in the words of the great philosophers: banana!” — minions, despicable me",
          "“i am the one who knocks.” — walter white, breaking bad",
          "“what we do in life echoes in eternity.” — maximus, gladiator",
          "“get busy living, or get busy dying.” — andy dufresne, the shawshank redemption",
          "“an idea is like a virus, resilient, highly contagious.” — cobb, inception",
          "“even the smallest person can change the course of the future.” — galadriel, lord of the rings",
          "“there are known knowns and there are known unknowns, but there are also unknown unknowns; things we don't know that we don't know.” — rummy, the boondocks",

        ],
      },
      { type: "heading", text: "anime" },
      {
        type: "list",
        items: [
          "“if you don't share someone's pain, you can never understand them.” — pain (nagato), naruto",
          "“i never go back on my word, that's my nindo, my ninja way.” — naruto uzumaki, naruto",
          "“we fear that which we cannot see.” — ukitake, bleach",
          "“the moment people come to know love, they run the risk of carrying hate.” — sosuke aizen, bleach",
          "“if miracles only happen once, then what's the second one called? a coincidence?” — ichigo, bleach",
          "“throughout heaven and earth, i alone am the honored one.” — gojo / sukuna, jujutsu kaisen",
          "“are you the strongest because you're satoru gojo, or are you satoru gojo because you're the strongest?” — jujutsu kaisen",
          "“the strong should aid and protect the weak. then the weak will become strong, and they too will protect those weaker than them.” — rengoku, demon slayer",
          "“no matter how many times you fall down, just keep getting back up.” — tanjiro, demon slayer",
          "“effort doesn't betray you.” — coach kamogawa, hajime no ippo",
          "“if you have time to think of a beautiful end, then live beautifully until the end.” — takamura, hajime no ippo",
          "“the only one who can beat me, is me.” — aomine, kuroko no basuke",
          "“if you give up, the game is over.” — coach anzai, slam dunk",
          "“inherited will, the destiny of the age, and the dreams of its people — these are things that will not be stopped.” — whitebeard, one piece",
          "“if you want to win, fight. if you want to live, fight.” — eren yeager, attack on titan",
          "“you can't change anything unless you can throw something away. to surpass monsters, you must be willing to abandon your humanity.” — armin arlert, attack on titan",
          "“tatakae! (fight!)” — eren yeager, attack on titan",
        ],
      },
      { type: "heading", text: "kindred spirits" },
      {
        type: "list",
        items: [
          "“all money is not good money.” — nipsey hussle",
          "“the impediment to action advances action. what stands in the way becomes the way.” — [marcus aurelius, meditations](https://www.gutenberg.org/ebooks/2680)",
          "“waste no more time arguing what a good man should be. be one.” — marcus aurelius",
          "“be water, my friend.” — bruce lee",
          "“knowing is not enough; we must apply. willing is not enough; we must do.” — bruce lee",
          "“seek wealth, not money or status.” — [naval ravikant](https://www.navalmanack.com/)",
          "“read what you love until you love to read.” — naval ravikant",
          "“we face neither east nor west; we face forward.” — kwame nkrumah",
        ],
      },
    ],
  },
  {
    id: "on-repeat",
    emoji: "🎧",
    title: "on repeat",
    daysAgo: 1,
    preview: "zion · iplan · ace trumpets · pearls · self control",
    collapsibleSections: true,
    alwaysExpandedHeadings: ["lately"],
    blocks: [
      { type: "heading", text: "lately" },
      {
        type: "list",
        items: [
          "[zion](music:zion) — arathejay",
          "[ara no dey sleep](music:ara-no-dey-sleep) — arathejay",
          "[popstar](music:popstar) — black sherif",
          "[gratitude](music:gratitude) — asake",
          "[iplan](music:iplan-feat-zaba-sykes) — dlala thukzin feat. zaba & sykes",
          "[bengicela](music:bengicela-feat-jazzwrld) — mawhoo, gl_ceejay & thukuthela feat. jazzwrld",
          "[uvalo](music:uvalo-feat-dlala-thukzin) — jazzwrld, thukuthela & babalwa m feat. dlala thukzin",
          "[isaka (6am)](music:isaka-6am) — ciza, jazzwrld & thukuthela",
          "[all my money](music:all-my-money) — kashcoming",
          "[hello hello](music:hello-hello) — kashcoming & mavo",
          "[tumo weto](music:tumo-weto) — mavo",
          "[coping mechanism](music:coping-mechanism) — omah lay & elmah",
          "[hay lupita](music:hay-lupita) — lomiiel",
          "[ama gear](music:ama-gear-feat-mk-productions) — dlala thukzin, funky qla & zee nxumalo",
          "[ace trumpets](music:ace-trumpets) — clipse",
          "[f.i.c.o.](music:f-i-c-o) — clipse, stove god cooks",
          "[so far ahead](music:so-far-ahead) — clipse, pharrell",
        ],
      },
      { type: "heading", text: "all-time" },
      {
        type: "list",
        items: [
          "[pearls](music:pearls) — sade",
          "[iplan](music:iplan-feat-zaba-sykes) — dlala thukzin feat. zaba & sykes",
          "[gone girl](music:gone-girl) — obongjayar & sarz",
          "[welcome home](music:welcome-home) — osibisa",
          "[fun](music:fun) — rema",
          "[the morning (live)](music:the-morning-live) — the weeknd",
          "[obra](music:obra-feat-mac-m) — darkovibes feat. mac m",
          "[tonight](music:tonight) — nonso amadi",
          "[plastic 100°c](music:plastic-100-c) — sampha",
          "[yosemite](music:yosemite) — travis scott",
          "[sunshine](music:sunshine) — joey b",
          "[pch](music:pch) — jaden",
          "[kora sings](music:kora-sings) — sampha",
          "[take care](music:take-care-feat-rihanna) — drake feat. rihanna",
          "[slime you out](music:slime-you-out-feat-sza) — drake feat. sza",
          "[xscape](music:xscape) — don toliver",
          "[better now](music:better-now) — post malone",
          "[adorn](music:adorn) — miguel",
          "[wake me up](music:wake-me-up) — avicii",
          "[let her go (acoustic)](music:let-her-go-acoustic) — passenger feat. ed sheeran",
          "[sky walker](music:sky-walker-feat-travis-scott) — miguel feat. travis scott",
          "[beautiful](music:beautiful) — bazzi",
          "[pretty little fears](music:pretty-little-fears-feat-j-cole) — 6lack feat. j. cole",
          "[butterfly effect](music:butterfly-effect) — travis scott",
          "[when the party's over](music:when-the-party-s-over) — billie eilish",
          "[after hours](music:after-hours) — the weeknd",
          "[john redcorn](music:john-redcorn) — sir",
          "[barefoot in the park](music:barefoot-in-the-park-feat-rosalia) — james blake feat. rosalía",
          "[six paths](music:six-paths) — dave",
          "[niagara falls](music:niagara-falls) — the weeknd",
          "[homecoming](music:homecoming-feat-chris-martin) — kanye west feat. chris martin",
          "[good morning](music:good-morning) — kanye west",
          "[runaway](music:runaway-feat-pusha-t) — kanye west feat. pusha t",
          "[monster](music:monster) — kanye west feat. jay-z, rick ross, nicki minaj & bon iver",
          "[slow dancing in the dark](music:slow-dancing-in-the-dark) — joji",
          "[hand of god (outro)](music:hand-of-god-outro) — jon bellion",
          "[money trees](music:money-trees-feat-jay-rock) — kendrick lamar feat. jay rock",
          "[remember](music:remember) — asake",
          "[self control](music:self-control) — frank ocean",
          "[un verano sin ti](music:un-verano-sin-ti) — bad bunny",
          "[malamente](music:malamente) — rosalía",
        ],
      },
    ],
  },
  {
    id: "reading-list",
    emoji: "📚",
    title: "reading list",
    daysAgo: 1,
    preview: "a regularly updated log of books",
    collapsibleSections: true,
    alwaysExpandedHeadings: ["currently reading"],
    blocks: [
      { type: "heading", text: "currently reading" },
      {
        type: "list",
        items: [
          "[The Frozen River](https://www.goodreads.com/book/show/112975658-the-frozen-river) — ariel lawhon",
        ],
      },
      { type: "heading", text: "recent favorites" },
      {
        type: "list",
        items: [
          "[There Are 3 Women & 4 Men](https://www.goodreads.com/book/show/204967663-there-are-3-women-4-men) — jaden payne",
          "[The Covenant of Water](https://www.goodreads.com/book/show/60784546-the-covenant-of-water) — abraham verghese",
          "[Demon Copperhead](https://www.goodreads.com/book/show/60194162-demon-copperhead) — barbara kingsolver",
          "[The Secret History](https://www.goodreads.com/book/show/29044.The_Secret_History) — donna tartt",
          "[This Is How You Lose the Time War](https://www.goodreads.com/book/show/43352954-this-is-how-you-lose-the-time-war) — amal el-mohtar & max gladstone",
          "[Shuggie Bain](https://www.goodreads.com/book/show/46026126-shuggie-bain) — douglas stuart",
          "[Pachinko](https://www.goodreads.com/book/show/29983711-pachinko) — min jin lee",
          "[Tomorrow, and Tomorrow, and Tomorrow](https://www.goodreads.com/book/show/58784475-tomorrow-and-tomorrow-and-tomorrow) — gabrielle zevin",
        ],
      },
      { type: "heading", text: "all time favs" },
      {
        type: "list",
        items: [
          "[Babel](https://www.goodreads.com/book/show/57945316-babel) — r.f. kuang",
          "[The God of Small Things](https://www.goodreads.com/book/show/9777.The_God_of_Small_Things) — arundhati roy",
          "[Prometheus Rising](https://www.goodreads.com/book/show/28597.Prometheus_Rising) — robert anton wilson",
          "[The Iliad](https://www.goodreads.com/book/show/1371.The_Iliad) — homer (trans. emily wilson)",
          "[The Odyssey](https://www.goodreads.com/book/show/1381.The_Odyssey) — homer (trans. emily wilson)",
          "[Dune](https://www.goodreads.com/book/show/44767458-dune) — frank herbert",
          "[Invisible Man](https://www.goodreads.com/book/show/16340.Invisible_Man) — ralph ellison",
          "[The Left Hand of Darkness](https://www.goodreads.com/book/show/18423.The_Left_Hand_of_Darkness) — ursula k. le guin",
          "[Normal People](https://www.goodreads.com/book/show/41057294-normal-people) — sally rooney",
          "[The Death of Vivek Oji](https://www.goodreads.com/book/show/48595550-the-death-of-vivek-oji) — akwaeke emezi",
          "[One Hundred Years of Solitude](https://www.goodreads.com/book/show/320.One_Hundred_Years_of_Solitude) — gabriel garcía márquez",
          "[Beloved](https://www.goodreads.com/book/show/6149.Beloved) — toni morrison",
          "[The Stranger](https://www.goodreads.com/book/show/49552.The_Stranger) — albert camus",
          "[Anna Karenina](https://www.goodreads.com/book/show/15823480-anna-karenina) — leo tolstoy",
        ],
      },
      { type: "heading", text: "want to read" },
      {
        type: "list",
        items: [
          "[Orbital](https://www.goodreads.com/book/show/168202478-orbital) — samantha harvey",
          "[James](https://www.goodreads.com/book/show/208878285-james) — percival everett",
          "[Intermezzo](https://www.goodreads.com/book/show/204927435-intermezzo) — sally rooney",
          "[The Dispossessed](https://www.goodreads.com/book/show/13651.The_Dispossessed) — ursula k. le guin",
          "[Blood Meridian](https://www.goodreads.com/book/show/394535.Blood_Meridian_or_the_Evening_Redness_in_the_West) — cormac mccarthy",
          "[Middlemarch](https://www.goodreads.com/book/show/19089.Middlemarch) — george eliot",
          "[The Master and Margarita](https://www.goodreads.com/book/show/117833.The_Master_and_Margarita) — mikhail bulgakov",
          "[Lonesome Dove](https://www.goodreads.com/book/show/256008.Lonesome_Dove) — larry mcmurtry",
          "[The Brothers Karamazov](https://www.goodreads.com/book/show/4934.The_Brothers_Karamazov) — fyodor dostoevsky",
          "[Gilead](https://www.goodreads.com/book/show/4965.Gilead) — marilynne robinson",
          "[The Waves](https://www.goodreads.com/book/show/46114.The_Waves) — virginia woolf",
          "[Piranesi](https://www.goodreads.com/book/show/50202953-piranesi) — susanna clarke",
        ],
      },
    ],
  },
  {
    id: "films",
    emoji: "🎬",
    title: "films & shows",
    daysAgo: 0,
    preview: "currently watching · 2026 · all time favs",
    collapsibleSections: true,
    alwaysExpandedHeadings: ["currently watching"],
    blocks: [
      { type: "heading", text: "currently watching" },
      {
        type: "list",
        items: [
          "Nippon Sangoku S1",
          "The Boys S5",
          "Daredevil: Born Again S2",
        ],
      },
      { type: "heading", text: "2026" },
      {
        type: "list",
        items: [
          "Peaky Blinders: The Immortal Man (2026)",
          "The Legend of Aang: The Last Airbender (2026)",
          "Mike and Nick and Nick and Alice (2026)",
          "Crime 101 (2026)",
          "Shelter (2026)",
          "The Rip (2026)",
          "Zootopia 2 (2025)",
          "Good Luck Have Fun Don't Die (2025)",
          "Just Breathe (2025)",
          "Afterburn (2025)",
          "Carjackers (2025)",
          "Marty Supreme (2025)",
          "The Secret Agent (2025)",
          "Kingdom of the Planet of the Apes (2024)",
          "Green Book (2018)",
          "The Town (2010)",
          "Zootopia (2016)",
          "Project Hail Mary (2025)",
          "Indecent Proposal (1993)",
          "The Holy Mountain (1973)",
          "Invincible S4",
          "Fallout S2",
          "A Knight of the Seven Kingdoms S1",
          "The Mighty Nein S1",
          "Young Sherlock S1",
          "His and Hers S1",
          "Pluribus S1",
          "Jujutsu Kaisen S3",
          "Hell's Paradise S2",
          "Sentenced to Be a Hero S1",
          "Fate/Strange Fake",
          "Tomodachi Game S1",
        ],
      },
      { type: "heading", text: "all time favs" },
      {
        type: "list",
        items: [
          "Attack on Titan",
          "Bleach",
          "Naruto",
          "Jujutsu Kaisen",
          "Demon Slayer",
          "Blue Eyed Samurai",
          "Avatar: The Last Airbender",
          "Peaky Blinders",
          "Shogun",
          "Game of Thrones",
          "The Wire",
          "Breaking Bad",
          "Better Call Saul",
          "The Sopranos",
          "Succession",
          "Severance",
          "Ted Lasso",
          "Spider-Man: Into the Spider-Verse",
          "Spider-Man: Across the Spider-Verse",
          "Spider-Man: Beyond the Spider-Verse",
          "The Amazing Spiderman (all)",
          "Despicable Me (all)",
          "Kung Fu Panda (all)",
          "Toy Story (all)",
          "The Emperor's New Groove",
          "Spirited Away",
          "Wallace & Gromit",
          "Parasite",
          "True Detective S1",
          "The Bear",
          "Ozark",
          "The Dark Knight",
          "The Dark Knight Rises",
          "The Simpsons",
          "Family Guy",
          "Prison Break",
          "Two and a Half Men",
          "Puss In Boots, The Last Wish",
          "Shrek (all)",
          "Brooklyn 99",
          "Modern Family",
          "Kung Fu Hustle",
          "Shaolin Soccer",
          "Reno 911",
          "The Godfather",
          "Goodfellas",
          "Pulp Fiction",
          "Kill Bill Vol. 1 & 2",
          "Fight Club",
          "Memento",
          "Heat",
          "Training Day",
          "Gladiator",
          "Inception",
          "Interstellar",
          "Dune Part 1 & 2",
          "Friday",
          "The Lion King",
          "Whiplash",
        ],
      },
    ],
  },
  {
    id: "top-5",
    emoji: "🏆",
    title: "top 5s",
    daysAgo: 0,
    preview: "anime fights · foods · perfumes · movie scenes · chess openings · albums",
    collapsibleSections: true,
    alwaysExpandedHeadings: [],
    blocks: [
      { type: "heading", text: "bible verses" },
      {
        type: "list",
        items: [
          "proverbs 4:23 — above all else, guard your heart, for everything you do flows from it.",
          "philippians 4:13 — i can do everything through Him who gives me strength.",
          "psalm 46:10 — be still, and know that i am God.",
          "john 10:10 — the thief comes only to steal and kill and destroy; i have come that they may have life, and have it to the full.",
          "romans 12:2 — do not conform to the pattern of this world, but be transformed by the renewing of your mind. then you will be able to test and approve what God's will is—his good, pleasing and perfect will.",
        ],
      },
      { type: "heading", text: "anime fights" },
      {
        type: "list",
        items: [
          "levi vs beast titan — attack on titan",
          "sukuna vs mahoraga — jujutsu kaisen",
          "rock lee vs gaara — naruto",
          "shunsui vs lille barro — bleach",
          "tanjiro, zenitsu, tengen & inosuke vs daki & gyutaro — demon slayer",
        ],
      },
      { type: "heading", text: "foods" },
      {
        type: "list",
        items: [
          "fufu and light soup",
          "sweet potatoes and pepper",
          "waakye",
          "kelewele",
          "sushi",
        ],
      },
      { type: "heading", text: "perfumes" },
      {
        type: "list",
        items: [
          "clive christian blonde amber",
          "frederic malle portrait of a lady",
          "maison francis kurkdjian oud satin mood extrait",
          "louis vuitton ombre nomade",
          "maison crivelli hibiscus mahajad",
        ],
      },
      { type: "heading", text: "movie scenes" },
      {
        type: "list",
        items: [
          "the dark knight rises — you think darkness is your ally? scene",
          "kill bill vol.1 — the bride vs crazy 88, gogo & o-ren ishii scene",
          "pulp fiction — ezekiel 25:17 scene",
          "training day — final confrontation",
          "interstellar — no no no no scene",
        ],
      },
      { type: "heading", text: "tv show scenes" },
      {
        type: "list",
        items: [
          "better call saul — chicanery court scene",
          "breaking bad — i am the one who knocks scene",
          "game of thrones — red wedding scene",
          "a knight of the seven kingdoms — get up sir duncan, get up scene",
          "attack on titan — eren's basement reveal scene",
        ],
      },
      { type: "heading", text: "chess openings" },
      {
        type: "list",
        items: [
          "king's indian defense",
          "italian opening",
          "ruy lopez — berlin defense",
          "caro-kann defense",
          "queen's gambit declined",
        ],
      },
      { type: "heading", text: "albums" },
      {
        type: "list",
        items: [
          "process — sampha",
          "my beautiful dark twisted fantasy — kanye west",
          "channel orange — frank ocean",
          "saturation 1 — brockhampton",
          "trilogy — the weeknd",
        ],
      },
      { type: "heading", text: "1-5" },
      {
        type: "list",
        items: [
          "3",
          "1",
          "5",
          "4",
          "2",
        ],
      },
      { type: "heading", text: "characters" },
      {
        type: "list",
        items: [
          "alfie solomons — peaky blinders",
          "grand regent thragg — invincible",
          "gus fring — breaking bad / better call saul",
          "wilson fisk — daredevil",
          "mr. milchick — severance",
        ],
      },
      { type: "heading", text: "weird food combos(i promise they're good!)" },
      {
        type: "list",
        items: [
          "waakye and chocolate spread",
          "fufu and condensed milk",
          "ice cream on hotdogs",
          "sweet potatoes and fried chicken with peanut butter",
          "kenkey with chocolate milk(ice kenkey without the extra steps)",
        ],
      },
      { type: "heading", text: "colors" },
      {
        type: "list",
        items: [
          "royal blue",
          "pink",
          "black",
          "yellow",
          "forest green",
        ],
      },
      { type: "heading", text: "football players(now)" },
      {
        type: "list",
        items: [
          "lamine yamal",
          "estevao",
          "olise",
          "pedri",
          "cole palmer",
        ],
      },
      { type: "heading", text: "football players(all time)" },
      {
        type: "list",
        items: [
          "eden hazard",
          "lionel messi",
          "neymar",
          "ronaldinho",
          "frank lampard",
        ],
      },
      { type: "heading", text: "basketball players(now)" },
      {
        type: "list",
        items: [
          "anthony edwards",
          "luka doncic",
          "victor wembanyama",
          "lebron james",
          "cade cunningham",
        ],
      },
      { type: "heading", text: "basketball players(all time)" },
      {
        type: "list",
        items: [
          "lebron james",
          "kobe bryant",
          "michael jordan",
          "stephen curry",
          "allen iverson",
        ],
      },
      { type: "heading", text: "superheroes" },
      {
        type: "list",
        items: [
          "spiderman",
          "deadpool",
          "batman",
          "daredevil",
          "flash",
        ],
      },
      { type: "heading", text: "bands" },
      {
        type: "list",
        items: [
          "brockhampton",
          "one direction",
          "wu-tang clan",
          "abba",
          "coldplay",
        ],
      },
      { type: "heading", text: "chelsea moments" },
      {
        type: "list",
        items: [
          "munich 2012",
          "porto 2021",
          "enzo signing",
          "cwc final",
          "16/17 season",
        ],
      },
      { type: "heading", text: "cars" },
      {
        type: "list",
        items: [
          "ferrari 488 pista",
          "batmobile (dark knight version)",
          "mustang gt",
          "koenigsegg jesko",
          "g-power m5 hurricane r",
        ],
      },
      { type: "heading", text: "numbers" },
      {
        type: "list",
        items: [
          "11",
          "77",
          "45",
          "99",
          "17",
        ],
      },
      { type: "heading", text: "hodor" },
      {
        type: "list",
        items: [
          "hold the dorr",
          "hold the door",
          "hold the door",
          "hold the door",
          "hold the door",
        ],
      },
      { type: "heading", text: "firsts" },
      {
        type: "list",
        items: [
          "flying",
          "love",
          "driving a car",
          "love",
          "paycheck",
        ],
      },
      { type: "heading", text: "letters" },
      {
        type: "list",
        items: [
          "s",
          "k",
          "d",
          "y",
          "u",
        ],
      },
      { type: "heading", text: "desserts" },
      {
        type: "list",
        items: [
          "tres leches cake",
          "tiramisu",
          "creme brulee",
          "cheesecake",
          "baklava",
        ],
      },
      { type: "heading", text: "swimming strokes" },
      {
        type: "list",
        items: [
          "freestyle",
          "backstroke",
          "breaststroke",
          "sidestroke",
          "butterfly",
        ],
      },
      { type: "heading", text: "movie scores" },
      {
        type: "list",
        items: [
          "ashes on the fire - kohta yamamoto (from attack on titan)",
          "light of the seven - ramin djawadi (from game of thrones)",
          "the rains of castamere - ramin djawadi (from game of thrones)",
          "interstellar main theme - hans zimmer (from interstellar)",
          "pirates of the caribbean main theme - hans zimmer (from pirates of the caribbean)",
        ],
      },
      { type: "heading", text: "animated movies" },
      {
        type: "list",
        items: [
          "spirited away",
          "grave of the fireflies",
          "shrek",
          "kung-fu panda",
          "spider-man into the spider-verse",
        ],
      },
      { type: "heading", text: "philosophical concepts" },
      {
        type: "list",
        items: [
          "[ship of theseus](https://en.wikipedia.org/wiki/Ship_of_Theseus)",
          "[allegory of the cave](https://en.wikipedia.org/wiki/Allegory_of_the_cave)",
          "[cogito ergo sum](https://en.wikipedia.org/wiki/Cogito,_ergo_sum)",
          "[the trolley problem](https://en.wikipedia.org/wiki/Trolley_problem)",
          "[memento mori](https://en.wikipedia.org/wiki/Memento_mori)",
        ],
      },
      { type: "heading", text: "historical figures" },
      {
        type: "list",
        items: [
          "Jesus Christ of Nazareth",
          "Lebron James",
          "Bruce Lee",
          "Leonardo da Vinci",
          "Hermes Trismegistus",
        ],
      },
      { type: "heading", text: "habits to have" },
      {
        type: "list",
        items: [
          "meditation / stillness practice",
          "actively managing your context window",
          "gratitude",
          "exercising regularly",
          "journaling",
        ],
      },
      { type: "heading", text: "habits to avoid" },
      {
        type: "list",
        items: [
          "seeking external validation",
          "entitlement",
          "outsourcing your memory / opinions",
          "avoidance",
          "laziness (in all forms, physical and mental)",
        ],
      },
      { type: "heading", text: "designers" },
      {
        type: "list",
        items: [
          "virgil abloh",
          "rei kawakubo",
          "yves saint laurent",
          "christian louboutin",
          "hiroshi fujiwara",
        ],
      },
    ],
  },
  {
    id: "people",
    emoji: "👤",
    title: "people",
    daysAgo: 0,
    preview: "people who shaped how i think",
    blocks: [
      {
        type: "paragraph",
        text: "minds and lives that rewired something in me and shaped how i think.",
      },
      {
        type: "list",
        items: [
          "my dad - first hero i knew, and still one of my biggest inspirations",
          "my mom - the most selfless person i know, and a constant source of love and support",
          "[robert anton wilson](https://en.wikipedia.org/wiki/Robert_Anton_Wilson) (author, prometheus rising)",
          "[neville goddard](https://en.wikipedia.org/wiki/Neville_Goddard) (mystic, author)",
          "[manly p. hall](https://en.wikipedia.org/wiki/Manly_Hall) (philosopher, author)",
          "[eric berne](https://en.wikipedia.org/wiki/Eric_Berne) (psychiatrist, games people play)",
          "[carl jung](https://en.wikipedia.org/wiki/Carl_Jung) (psychologist)",
          "[friedrich nietzsche](https://en.wikipedia.org/wiki/Friedrich_Nietzsche) (philosopher)",
          "[marcus aurelius](https://en.wikipedia.org/wiki/Marcus_Aurelius) (emperor, stoic)",
          "[plato](https://en.wikipedia.org/wiki/Plato) (philosopher)",
          "[diogenes](https://en.wikipedia.org/wiki/Diogenes) (philosopher)",
          "[sun tzu](https://en.wikipedia.org/wiki/Sun_Tzu) (general, the art of war)",
          "[miyamoto musashi](https://en.wikipedia.org/wiki/Miyamoto_Musashi) (samurai, the book of five rings)",
          "[hermes trismegistus](https://en.wikipedia.org/wiki/Hermes_Trismegistus) (mystic, the kybalion)",
          "[jesus christ](https://en.wikipedia.org/wiki/Jesus) (lord and savior)",
          "[buddha](https://en.wikipedia.org/wiki/Gautama_Buddha) (spiritual teacher)",
          "[james baldwin](https://en.wikipedia.org/wiki/James_Baldwin) (author, activist)",
          "[gabriel garcía márquez](https://en.wikipedia.org/wiki/Gabriel_Garc%C3%ADa_M%C3%A1rquez) (author, one hundred years of solitude)",
          "[albert camus](https://en.wikipedia.org/wiki/Albert_Camus) (author, philosopher)",
          "[naval ravikant](https://nav.al) (founder, angellist)",
          "[paul graham](https://paulgraham.com) (co-founder, y combinator)",
          "[patrick collison](https://patrickcollison.com) (co-founder, stripe)",
          "[iyinoluwa aboyeji](https://aboyeji.com) (founder, flutterwave)",
          "[jensen huang](https://en.wikipedia.org/wiki/Jensen_Huang) (founder, nvidia)",
          "[steve jobs](https://en.wikipedia.org/wiki/Steve_Jobs) (co-founder, apple)",
          "[nikola tesla](https://en.wikipedia.org/wiki/Nikola_Tesla) (inventor)",
          "[leonardo da vinci](https://en.wikipedia.org/wiki/Leonardo_da_Vinci) (polymath)",
          "[i.m. pei](https://en.wikipedia.org/wiki/I._M._Pei) (architect)",
          "[tadao ando](https://en.wikipedia.org/wiki/Tadao_Ando) (architect)",
          "[takashi murakami](https://en.wikipedia.org/wiki/Takashi_Murakami) (artist)",
          "[virgil abloh](https://en.wikipedia.org/wiki/Virgil_Abloh) (designer, off-white)",
          "[christopher nolan](https://en.wikipedia.org/wiki/Christopher_Nolan) (filmmaker)",
          "[quentin tarantino](https://en.wikipedia.org/wiki/Quentin_Tarantino) (filmmaker)",
          "[hayao miyazaki](https://en.wikipedia.org/wiki/Hayao_Miyazaki) (filmmaker, studio ghibli)",
          "[hajime isayama](https://en.wikipedia.org/wiki/Hajime_Isayama) (mangaka, attack on titan)",
          "[tite kubo](https://en.wikipedia.org/wiki/Tite_Kubo) (mangaka, bleach)",
          "[masashi kishimoto](https://en.wikipedia.org/wiki/Masashi_Kishimoto) (mangaka, naruto)",
          "[gege akutami](https://en.wikipedia.org/wiki/Gege_Akutami) (mangaka, jujutsu kaisen)",
          "[mikhail tal](https://en.wikipedia.org/wiki/Mikhail_Tal) (chess grandmaster, the magician from riga)",
          "[lebron james](https://en.wikipedia.org/wiki/LeBron_James) (basketball player - the GOAT)",
          "[kobe bryant](https://en.wikipedia.org/wiki/Kobe_Bryant) (basketball player)",
          "[michael jordan](https://en.wikipedia.org/wiki/Michael_Jordan) (basketball player)",
          "[lewis hamilton](https://en.wikipedia.org/wiki/Lewis_Hamilton) (formula 1 driver)",
          "[miles davis](https://en.wikipedia.org/wiki/Miles_Davis) (musician, kind of blue)",
          "[john coltrane](https://en.wikipedia.org/wiki/John_Coltrane) (musician, a love supreme)",
          "[michael jackson](https://en.wikipedia.org/wiki/Michael_Jackson) (musician - the greatest)",
          "[kanye west](https://en.wikipedia.org/wiki/Kanye_West) (musician, producer)",
          "[fela kuti](https://en.wikipedia.org/wiki/Fela_Kuti) (musician, activist)",
          "[bach](https://en.wikipedia.org/wiki/Johann_Sebastian_Bach) (composer)",
          "[mozart](https://en.wikipedia.org/wiki/Wolfgang_Amadeus_Mozart) (composer)",
        ],
      },
    ],
  },
  {
    id: "how-it-works",
    emoji: "🛠",
    title: "how this site works",
    daysAgo: 3,
    preview: "built as a macOS desktop. next.js, typescript, framer motion.",
    blocks: [
      {
        type: "paragraph",
        text: "a full **macOS desktop** running in the browser. no backend, no database — everything is **client-side**, persisted to `localStorage` and `sessionStorage`.",
      },
      { type: "heading", text: "stack" },
      {
        type: "tags",
        items: [
          "[next.js 14](https://nextjs.org)",
          "typescript",
          "[tailwind](https://tailwindcss.com)",
          "[framer motion](https://www.framer.com/motion)",
        ],
      },
      { type: "heading", text: "architecture" },
      {
        type: "list",
        items: [
          "**providers → desktop → windows → apps** — 9 context providers wrap the app. `Desktop` owns all window state and renders every app component",
          "**app registry** in `lib/app-config.ts` — single source of truth for every app: id, label, icon, default size, dock visibility",
          "**window state** in `useWindows()` — position, size, z-index, open/minimized/fullscreen, all persisted to `localStorage`",
          "**cross-app navigation** via an event bus — clicking a song in Notes opens Music at that track without coupling the components",
        ],
      },
      { type: "heading", text: "how windows work" },
      {
        type: "list",
        items: [
          "drag via `mousedown/mousemove/mouseup` — no library",
          "**8-directional resize** handles on every edge and corner",
          "window geometry persists to `localStorage` — your layout survives refreshes",
          "open/minimized state **resets on every reload** — sessions always start clean",
          "minimum size: 420×320",
        ],
      },
      { type: "heading", text: "state persistence" },
      {
        type: "list",
        items: [
          "**`localStorage`** — durable: theme, wallpaper, window layout, notes, recents",
          "**`sessionStorage`** via `useSessionState(appId, key, default)` — per-window view state, auto-cleared when a window closes",
        ],
      },
      { type: "heading", text: "apps" },
      {
        type: "list",
        items: [
          "**finder** — file browser with sidebar, icon and list views, recents, file preview",
          "**notes** — owner notes (read-only) + user notes stored in `localStorage`",
          "**terminal** — simulated shell with a real filesystem tree and ~20 commands",
          "**settings** — 15+ panes including display, wallpaper, wifi, sound, accessibility",
          "**preview** — opens PDFs, markdown, code, images, and slide decks",
          "**music** — full player with playlists, albums, artists, real audio playback",
          "**weather** — live data from [open-meteo](https://open-meteo.com), animated scenes, city search",
        ],
      },
      { type: "heading", text: "other details" },
      {
        type: "list",
        items: [
          "**spotlight** `⌘K` — searches apps, notes, and files",
          "`⌘,` opens settings from anywhere",
          "right-click the desktop for a context menu",
          "**light and dark mode** — follows system preference, no flash on load",
          "mobile — shows notes only, since that's the most useful content on a small screen",
        ],
      },
      { type: "heading", text: "source" },
      {
        type: "paragraph",
        text: "built over a few weeks. if you want to see how something specific works, open **terminal** and poke around.",
      },
    ],
  },
  {
    id: "writing",
    emoji: "✏️",
    title: "writing",
    daysAgo: 11,
    preview: "context windows · ouroboros · onryō · now and forever · the cathedral is inside you",
    blocks: [
      {
        type: "paragraph",
        text: "i write about consciousness, perception, patterns, and the strange mechanics of being a person. published on [substack](https://coolshugz.substack.com).",
      },
      { type: "heading", text: "posts" },
      {
        type: "list",
        items: [
          "[context windows](https://coolshugz.substack.com/p/context-windows) — how to manage your attention and get what you want — apr 2026",
          "[ouroboros](https://coolshugz.substack.com/p/ouroboros) — how we can snap out of patterns we are trapped in or do not even know about — mar 2026",
          "[onryō](https://coolshugz.substack.com/p/onryo) — reminder that you're exactly where you need to be — jan 2026",
          "[now and forever](https://coolshugz.substack.com/p/now-and-forever) — people come and go sometimes. how to play your part — dec 2025",
          "[the cathedral is inside you](https://coolshugz.substack.com/p/the-cathedral-is-inside-you) — first piece. one-shotted the article just to talk about how everything you're looking for outside is inside you — nov 2025",
        ],
      },
    ],
  },
];

// Helpers
export function dateFromDaysAgo(daysAgo: number, ref: Date = new Date()): Date {
  const d = new Date(ref);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(17, 12, 0, 0);
  return d;
}

export const formatShortDate = (d: Date): string => {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const yr = d.getFullYear();
  return `${m}/${day < 10 ? "0" + day : day}/${yr}`;
};

export const formatLongDate = (d: Date): string => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let hours = d.getHours();
  const mins = d.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minStr = mins < 10 ? "0" + mins : `${mins}`;
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} at ${hours}:${minStr} ${ampm}`;
};

export type GroupKey =
  | "Pinned"
  | "Today"
  | "Yesterday"
  | "Previous 7 Days"
  | "Previous 30 Days"
  | "Earlier";

export const GROUP_ORDER: GroupKey[] = [
  "Pinned",
  "Today",
  "Yesterday",
  "Previous 7 Days",
  "Previous 30 Days",
  "Earlier",
];

export function groupNotes<T extends { pinned?: boolean; daysAgo: number }>(
  notes: T[]
): Record<GroupKey, T[]> {
  const groups: Record<GroupKey, T[]> = {
    Pinned: [],
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    "Previous 30 Days": [],
    Earlier: [],
  };
  for (const n of notes) {
    if (n.pinned) {
      groups.Pinned.push(n);
      continue;
    }
    const d = n.daysAgo;
    if (d <= 0) groups.Today.push(n);
    else if (d === 1) groups.Yesterday.push(n);
    else if (d <= 7) groups["Previous 7 Days"].push(n);
    else if (d <= 30) groups["Previous 30 Days"].push(n);
    else groups.Earlier.push(n);
  }
  return groups;
}

// Parse list-item strings into segments. Supports:
//   **text**      → bold
//   `text`        → inline code
//   [label](url)  → link (music: scheme deep-links into the Music app)
// Plain [your X] placeholders (no trailing url) stay as text.
export type Segment =
  | { kind: "text"; text: string }
  | { kind: "link"; label: string; url: string }
  | { kind: "bold"; text: string }
  | { kind: "code"; text: string };

export function parseSegments(s: string): Segment[] {
  const out: Segment[] = [];
  const regex = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(s)) !== null) {
    if (m.index > last) {
      out.push({ kind: "text", text: s.slice(last, m.index) });
    }
    if (m[1] !== undefined) {
      out.push({ kind: "bold", text: m[1] });
    } else if (m[2] !== undefined) {
      out.push({ kind: "code", text: m[2] });
    } else {
      out.push({ kind: "link", label: m[3], url: m[4] });
    }
    last = regex.lastIndex;
  }
  if (last < s.length) {
    out.push({ kind: "text", text: s.slice(last) });
  }
  return out.length ? out : [{ kind: "text", text: s }];
}
