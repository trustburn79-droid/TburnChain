const fs = require('fs');
const path = require('path');

const frTranslations = {
  "1": {
    "question": "Qu'est-ce que TBURN ?",
    "answer": "TBURN est une blockchain Layer 1 de nouvelle génération qui traite 520 000 TPS avec un temps de bloc de 100ms. Elle utilise un mécanisme de consensus BFT amélioré par l'IA pour fournir une haute sécurité et évolutivité, avec un modèle économique de token déflationniste visant une création de valeur durable."
  },
  "2": {
    "question": "Comment commencer avec TBURN ?",
    "answer": "1) Installez un portefeuille supporté (MetaMask, Rabby, Trust Wallet, etc.). 2) Connectez-vous au mainnet TBURN. 3) Achetez ou recevez des tokens TB. 4) Gérez vos actifs et utilisez les services DeFi depuis le tableau de bord du portefeuille."
  },
  "3": {
    "question": "Où puis-je acheter des tokens TB ?",
    "answer": "Les tokens TB peuvent être achetés sur le DEX intégré de TBURN, les exchanges partenaires ou via des ponts cross-chain. Vous pouvez échanger directement sur la page DEX ou apporter des actifs d'autres chaînes via le pont."
  },
  "4": {
    "question": "Quel est le format d'adresse du portefeuille TBURN ?",
    "answer": "TBURN utilise des adresses au format Bech32m. Toutes les adresses commencent par \"tb1\" et se composent de 41 caractères (ex., tb1edmprvaftt65lkp2x6v8fmjvst5spfruj47kwm). Ce format suit la norme BIP-350 avec détection d'erreurs intégrée."
  },
  "5": {
    "question": "Quels sont les frais de transaction ?",
    "answer": "Les frais de réseau de base de TBURN sont d'environ 0,0001 TB. De plus, tous les transferts ont des frais de burn de 0,5% qui brûlent définitivement les tokens. Ce mécanisme déflationniste contribue à maintenir la valeur du token."
  },
  "6": {
    "question": "Quelle est la différence entre le mainnet et le testnet TBURN ?",
    "answer": "Le mainnet est le réseau de production où les tokens TB avec une valeur réelle sont utilisés. Le testnet est utilisé pour le développement et les tests, et les tokens de test n'ont pas de valeur. Les développeurs doivent déployer et tester les contrats intelligents sur le testnet avant de les déployer sur le mainnet."
  },
  "7": {
    "question": "Qu'est-ce que TBURN Explorer ?",
    "answer": "TBURN Explorer (Scan) est un explorateur de blockchain où vous pouvez voir les blocs, transactions, portefeuilles et contrats intelligents. C'est un outil public pour vérifier de manière transparente l'état du réseau en temps réel, les informations des validateurs et les mouvements de tokens."
  },
  "8": {
    "question": "Quels sont les plans futurs dans la feuille de route ?",
    "answer": "La feuille de route de TBURN inclut l'expansion continue du réseau, l'intégration de nouveaux protocoles DeFi, l'expansion des ponts cross-chain, l'amélioration des fonctionnalités IA et la croissance de l'écosystème gaming/NFT. Les jalons détaillés se trouvent sur la page de la feuille de route."
  },
  "9": {
    "question": "Où puis-je lire le livre blanc TBURN ?",
    "answer": "Vous pouvez télécharger et consulter le livre blanc TBURN sur la page du livre blanc. Il couvre l'architecture technique, les tokenomics, le mécanisme de consensus et la feuille de route."
  },
  "10": {
    "question": "Qu'est-ce que le système de score de confiance ?",
    "answer": "Le système de score de confiance évalue la fiabilité des portefeuilles en fonction de l'historique des transactions, de l'activité de staking, de la participation à la gouvernance et plus encore. Les scores élevés obtiennent plus de récompenses et de fonctionnalités."
  },
  "11": {
    "question": "Comment faire du staking ?",
    "answer": "Sélectionnez un validateur sur la page de staking et entrez le montant à staker. Le staking verrouille vos tokens TB pendant une période pendant laquelle vous recevrez des récompenses. Le unstaking nécessite d'attendre la période de déliement."
  },
  "12": {
    "question": "Que sont les récompenses de staking ?",
    "answer": "Les récompenses de staking proviennent de l'inflation du réseau et des frais de transaction. Le rendement annuel en pourcentage (APY) change dynamiquement en fonction du staking total et de l'état du réseau. Vous pouvez voir les taux actuels sur le tableau de bord du staking."
  },
  "13": {
    "question": "Qu'est-ce que le staking liquide ?",
    "answer": "Le staking liquide vous permet de recevoir des tokens stTB tout en stakant des TB. Les tokens stTB représentent votre position de staking et peuvent être utilisés dans les protocoles DeFi tout en continuant à recevoir des récompenses de staking."
  },
  "14": {
    "question": "Comment choisir un validateur ?",
    "answer": "Considérez le temps de fonctionnement du validateur, le taux de commission, le staking total et la réputation. Consultez les métriques détaillées sur la page des validateurs et choisissez des validateurs avec des performances stables et des commissions raisonnables."
  },
  "15": {
    "question": "Qu'est-ce que la délégation ?",
    "answer": "La délégation est le processus de staking de vos tokens TB auprès d'un validateur. Vous conservez la propriété des tokens mais déléguez le pouvoir de validation au validateur. Les récompenses générées par le validateur sont distribuées proportionnellement aux délégateurs."
  },
  "16": {
    "question": "Comment voir mon historique de staking ?",
    "answer": "Consultez votre historique complet de staking sur le tableau de bord du staking, y compris les enregistrements de délégation, de dé-délégation et de réclamation de récompenses. Chaque opération est enregistrée sur la blockchain et peut être vérifiée dans l'explorateur."
  },
  "17": {
    "question": "Qu'est-ce qu'un pool de staking ?",
    "answer": "Les pools de staking permettent à plusieurs utilisateurs de combiner leurs fonds pour le staking. Cela réduit la barrière à l'entrée et fournit des rendements plus stables. Les opérateurs de pool facturent une petite commission comme compensation de gestion."
  },
  "18": {
    "question": "Quelle est la durée de la période de déliement ?",
    "answer": "La période de déliement est de 21 jours. Après le unstaking, vos tokens sont verrouillés pendant 21 jours sans générer de récompenses. Ceci est conçu pour la sécurité du réseau."
  },
  "19": {
    "question": "Qu'est-ce que la pénalité de slashing ?",
    "answer": "Si un validateur se comporte mal (comme la double signature ou être hors ligne pendant longtemps), une partie de ses tokens stakés sera slashée (brûlée). Les tokens délégués à ce validateur sont également affectés proportionnellement."
  },
  "20": {
    "question": "Comment réclamer des récompenses ?",
    "answer": "Cliquez sur le bouton \"Réclamer les récompenses\" sur le tableau de bord du staking. Les récompenses peuvent être réclamées à tout moment avec de petits frais de réseau. Les récompenses réclamées sont envoyées directement à votre portefeuille."
  },
  "21": {
    "question": "Qu'est-ce que le yield farming ?",
    "answer": "Le yield farming est une stratégie pour gagner des rendements supplémentaires en fournissant de la liquidité aux protocoles DeFi. Sur la page de yield farming de TBURN, vous pouvez déposer des tokens LP pour recevoir des récompenses TB supplémentaires."
  },
  "22": {
    "question": "Comment fonctionne le DEX ?",
    "answer": "Le DEX TBURN utilise un modèle de Market Maker Automatisé (AMM). Les fournisseurs de liquidité déposent des paires de tokens dans les pools, les traders échangent des tokens du pool, payant des frais de trading aux fournisseurs de liquidité."
  },
  "23": {
    "question": "Comment fournir de la liquidité ?",
    "answer": "Sélectionnez une paire de tokens sur la page DEX et entrez des montants égaux des deux tokens. Après avoir fourni de la liquidité, vous recevrez des tokens LP représentant votre part du pool."
  },
  "24": {
    "question": "Qu'est-ce que la perte impermanente ?",
    "answer": "Lorsque le ratio de prix des tokens dans un pool de liquidité change, la valeur des actifs que vous retirez peut être inférieure à la valeur pendant la détention. Cette différence est appelée perte impermanente, un risque inhérent à la fourniture de liquidité AMM."
  },
  "25": {
    "question": "Comment échanger des tokens ?",
    "answer": "Sélectionnez la paire de tokens à échanger sur la page DEX, entrez le montant, confirmez les détails de la transaction et exécutez l'échange. Le système affiche le slippage estimé et le montant final à recevoir."
  },
  "26": {
    "question": "Qu'est-ce que le protocole de prêt ?",
    "answer": "Le protocole de prêt TBURN permet aux utilisateurs de déposer des actifs pour gagner des intérêts ou d'emprunter d'autres actifs en utilisant des garanties. Les taux d'intérêt s'ajustent dynamiquement en fonction de l'offre et de la demande."
  },
  "27": {
    "question": "Comment emprunter ?",
    "answer": "Déposez d'abord des garanties, puis sélectionnez l'actif et le montant à emprunter. Les emprunts nécessitent une sur-collatéralisation, et les actifs seront liquidés si le ratio de garantie tombe en dessous du seuil de liquidation."
  },
  "28": {
    "question": "Qu'est-ce que la liquidation ?",
    "answer": "Lorsque votre ratio de garantie tombe en dessous de l'exigence minimale, d'autres peuvent rembourser une partie de votre dette et recevoir vos garanties en récompense. Cela assure la solvabilité du protocole."
  },
  "29": {
    "question": "Comment gagner des intérêts de prêt ?",
    "answer": "Déposez des actifs dans le pool de prêt pour commencer à gagner des intérêts. Les taux d'intérêt fluctuent en fonction de la demande d'emprunt, avec des taux plus élevés pendant une forte demande. Les intérêts s'accumulent en temps réel."
  },
  "30": {
    "question": "Qu'est-ce que la marketplace NFT ?",
    "answer": "La marketplace NFT TBURN est une plateforme pour acheter et vendre des objets de collection numériques. Les créateurs peuvent minter des NFT, les collectionneurs peuvent acheter, vendre ou mettre aux enchères des NFT. Supporte les royalties et les ventes secondaires."
  },
  "31": {
    "question": "Comment minter un NFT ?",
    "answer": "Téléchargez votre œuvre numérique sur la marketplace NFT, définissez les attributs comme le nom, la description, le pourcentage de royalties. Après avoir payé les frais de minting, le NFT est créé dans votre portefeuille."
  },
  "32": {
    "question": "Qu'est-ce que le launchpad NFT ?",
    "answer": "Le launchpad NFT est l'endroit où les nouveaux projets lancent des collections NFT. Les utilisateurs peuvent participer aux ventes publiques ou aux loteries pour obtenir des NFT à des prix préférentiels aux premières étapes."
  },
  "33": {
    "question": "Comment fonctionne le pont cross-chain ?",
    "answer": "Les ponts cross-chain permettent de transférer des actifs entre différentes blockchains. Verrouillez des actifs sur une chaîne et mintez des tokens wrapped équivalents sur une autre chaîne. Le pont est sécurisé par plusieurs validateurs."
  },
  "34": {
    "question": "Quelles chaînes sont supportées ?",
    "answer": "Le pont TBURN supporte actuellement Ethereum, BNB Chain, Polygon, Avalanche et Solana. D'autres chaînes seront ajoutées à l'avenir."
  },
  "35": {
    "question": "Combien de temps prend le bridging ?",
    "answer": "Le temps de bridging dépend des exigences de confirmation des chaînes source et destination. Cela prend généralement 5-30 minutes selon la congestion du réseau."
  },
  "36": {
    "question": "Qu'est-ce que GameFi ?",
    "answer": "GameFi combine le gaming et la DeFi, permettant aux joueurs de gagner des tokens et des NFT avec une valeur réelle dans les jeux. L'infrastructure GameFi de TBURN fournit des outils et des services aux développeurs de jeux."
  },
  "37": {
    "question": "Comment participer à GameFi ?",
    "answer": "Parcourez les jeux listés sur la page GameFi, connectez votre portefeuille pour commencer à jouer. Vous pouvez gagner des tokens in-game, échanger des équipements NFT et rejoindre des guildes de jeux."
  },
  "38": {
    "question": "Qu'est-ce que la gouvernance ?",
    "answer": "La gouvernance permet aux détenteurs de TB de voter sur les mises à niveau du réseau, les changements de paramètres et les dépenses du trésor. Les tokens TB stakés ont un pouvoir de vote, proportionnel au montant staké."
  },
  "39": {
    "question": "Comment voter ?",
    "answer": "Consultez les propositions actives sur la page de gouvernance, lisez les détails de la proposition et votez. Le vote nécessite des tokens TB stakés, les tokens restent verrouillés jusqu'à la fin de la période de vote."
  },
  "40": {
    "question": "Comment soumettre une proposition ?",
    "answer": "Vous devez satisfaire les exigences minimales de staking pour soumettre une proposition. Remplissez le titre de la proposition, la description et les détails de mise en œuvre, payez les frais de proposition et soumettez pour le vote communautaire."
  },
  "41": {
    "question": "Qu'est-ce que le consensus BFT ?",
    "answer": "Le consensus Tolérant aux Fautes Byzantines (BFT) permet au réseau de fonctionner normalement même si jusqu'à un tiers des nœuds échouent ou agissent de manière malveillante. Le BFT amélioré par l'IA de TBURN optimise davantage la production et la validation des blocs."
  },
  "42": {
    "question": "Quel est le temps de bloc ?",
    "answer": "Le temps de bloc de TBURN est de 100 millisecondes, l'un des plus rapides de l'industrie. Le temps de bloc rapide permet des confirmations de transaction quasi instantanées."
  },
  "43": {
    "question": "Quel est le TPS du réseau ?",
    "answer": "Le réseau TBURN peut traiter 520 000 TPS (transactions par seconde). Ceci est réalisé grâce à la technologie de sharding et à l'exécution parallèle, dépassant de loin la plupart des blockchains."
  },
  "44": {
    "question": "Comment devenir validateur ?",
    "answer": "Devenir validateur nécessite de satisfaire les exigences minimales de staking (variables selon le niveau), d'exécuter le logiciel de nœud validateur et de maintenir une haute disponibilité. Consultez la documentation du validateur pour les étapes détaillées."
  },
  "45": {
    "question": "Quels sont les niveaux de validateur ?",
    "answer": "Les validateurs sont divisés en niveaux Bronze (1 000 TB), Argent (10 000 TB), Or (100 000 TB) et Platine. Les niveaux supérieurs apportent des multiplicateurs de récompense plus élevés et plus de privilèges."
  },
  "46": {
    "question": "Qu'est-ce que la finalité ?",
    "answer": "La finalité est l'état où les transactions sont confirmées et ne peuvent pas être annulées. TBURN utilise la finalité en une seule confirmation, une fois qu'un bloc est produit, les transactions sont immédiatement finales."
  },
  "47": {
    "question": "Que signifie la hauteur de bloc ?",
    "answer": "La hauteur de bloc est le numéro de position d'un bloc dans la chaîne. Le bloc genesis est 0, avec chaque nouveau bloc la hauteur augmente de 1. La hauteur de bloc est utilisée pour référencer des blocs spécifiques."
  },
  "48": {
    "question": "Qu'est-ce que la récompense de bloc ?",
    "answer": "La récompense de bloc sont les tokens TB gagnés lorsqu'un validateur crée avec succès un nouveau bloc. Les récompenses proviennent de l'inflation du réseau et des frais de transaction, et sont distribuées aux validateurs et leurs délégateurs."
  },
  "49": {
    "question": "Comment les frais de réseau sont-ils distribués ?",
    "answer": "Les frais de transaction sont distribués comme suit : une partie va au producteur du bloc, une partie va au trésor pour le développement du réseau, et une partie est brûlée définitivement pour supporter la déflation."
  },
  "50": {
    "question": "Qu'est-ce que le sharding ?",
    "answer": "Le sharding est une technologie de mise à l'échelle qui divise la blockchain en plusieurs shards pour un traitement parallèle. Chaque shard traite les transactions indépendamment, augmentant le débit global du réseau."
  },
  "51": {
    "question": "Qu'est-ce que l'orchestration IA ?",
    "answer": "L'orchestration IA intègre plusieurs modèles d'IA (Gemini, Claude, GPT-4o, Grok) pour automatiser l'optimisation du réseau, l'ajustement du taux de burn, la détection des menaces de sécurité et plus encore."
  },
  "52": {
    "question": "Quelles sont les exigences pour les validateurs ?",
    "answer": "Les exigences varient selon le niveau de validateur : Bronze (1 000 TB), Argent (10 000 TB), Or (100 000 TB). Une infrastructure serveur stable, un temps de fonctionnement élevé et une capacité technique sont nécessaires."
  },
  "53": {
    "question": "Qu'est-ce qu'une transaction cross-shard ?",
    "answer": "Transactions entre comptes sur différents shards. Coordonnées par la chaîne beacon, peuvent nécessiter un temps de finalisation légèrement plus long que les transactions régulières."
  },
  "54": {
    "question": "Où puis-je vérifier l'état du réseau ?",
    "answer": "Vérifiez la hauteur de bloc actuelle, le TPS, les validateurs actifs, l'état des shards et la santé du réseau en temps réel sur la page État du Réseau."
  },
  "55": {
    "question": "Où puis-je obtenir le RPC testnet ?",
    "answer": "Consultez les informations de connexion testnet sur la page RPC Testnet. Le Chain ID, l'URL RPC, l'URL de l'explorateur et les liens du faucet sont fournis."
  },
  "56": {
    "question": "Qu'est-ce que la pénalité de validateur ?",
    "answer": "Les validateurs hors ligne ou en double signature feront face à des pénalités comme le slashing (brûler une partie du stake), la rétrogradation ou le retrait de l'ensemble actif."
  },
  "57": {
    "question": "Comment vérifier le statut du validateur ?",
    "answer": "Consultez les détails du validateur sur la page des validateurs ou l'explorateur, y compris le temps de fonctionnement, le taux de commission, la délégation totale, l'historique des performances et plus."
  },
  "58": {
    "question": "Qu'est-ce que la surveillance de santé du nœud validateur ?",
    "answer": "La surveillance de santé du nœud suit le temps de fonctionnement du validateur, le temps de réponse, les connexions de pairs et la production de blocs. Les systèmes d'alerte notifient lorsque des problèmes sont détectés."
  },
  "59": {
    "question": "Qu'est-ce que la chaîne beacon ?",
    "answer": "La chaîne beacon est la chaîne principale qui coordonne tous les shards. Elle gère l'ensemble des validateurs, la communication cross-shard et le consensus global."
  },
  "60": {
    "question": "Comment exécuter un nœud complet ?",
    "answer": "Téléchargez le logiciel de nœud TBURN, configurez les paramètres selon la documentation. Les nœuds complets stockent les données complètes de la blockchain, valident toutes les transactions mais ne participent pas au consensus."
  },
  "61": {
    "question": "Qu'est-ce que les frais de gas ?",
    "answer": "Le gas est l'unité de calcul requise pour exécuter des transactions et des opérations de contrats intelligents. Frais de gas = Gas utilisé × Prix du gas. Les opérations complexes nécessitent plus de gas."
  },
  "62": {
    "question": "Comment estimer le gas ?",
    "answer": "Le simulateur de transactions ou le SDK peut estimer les besoins en gas avant l'exécution. Il est recommandé de maintenir un solde suffisant pour couvrir les frais de gas et de burn."
  },
  "63": {
    "question": "Comment déployer un contrat intelligent ?",
    "answer": "Écrivez des contrats en Solidity ou Rust et compilez avec le compilateur TBURN. Déployez sur la page des Contrats Intelligents ou de manière programmatique via SDK/CLI."
  },
  "64": {
    "question": "Qu'est-ce que le Simulateur de Transactions ?",
    "answer": "Le Simulateur de Transactions est un outil pour prévisualiser les résultats des transactions avant l'exécution réelle. Vous pouvez identifier les frais de gas attendus, les changements d'état et les erreurs potentielles à l'avance."
  },
  "65": {
    "question": "Où puis-je obtenir des clés API ?",
    "answer": "Créez de nouvelles clés API sur la page des Clés API. Vous pouvez définir des permissions et des limites d'utilisation par clé, et surveiller l'utilisation sur le tableau de bord."
  },
  "66": {
    "question": "Quelles options de SDK sont disponibles ?",
    "answer": "Des SDK JavaScript/TypeScript, Python, Rust et Go sont fournis. Utilisez toutes les fonctions blockchain de manière programmatique, y compris la connexion de portefeuille, l'envoi de transactions et l'interaction avec les contrats intelligents."
  },
  "67": {
    "question": "Comment utiliser les outils CLI ?",
    "answer": "Installez TBURN CLI pour effectuer la gestion de compte, l'envoi de transactions et le déploiement de contrats intelligents depuis le terminal. Consultez le guide d'installation et de commandes dans la documentation développeur."
  },
  "68": {
    "question": "Comment migrer depuis EVM ?",
    "answer": "TBURN est compatible EVM, donc les contrats Solidity existants peuvent être déployés avec des modifications minimales. Consultez les méthodes étape par étape dans le guide de Migration EVM."
  },
  "69": {
    "question": "Qu'est-ce que l'API WebSocket ?",
    "answer": "L'API WebSocket permet de recevoir des blocs, transactions et événements en temps réel au format streaming. Utilisée lorsque les dApps ont besoin de mises à jour en temps réel."
  },
  "70": {
    "question": "Où est la documentation développeur ?",
    "answer": "Trouvez la documentation complète, la référence API, les tutoriels et les exemples de code dans le Hub Développeur. Commencez rapidement avec le guide de Démarrage Rapide."
  },
  "71": {
    "question": "Où puis-je trouver des exemples de code ?",
    "answer": "Trouvez des exemples de code pour divers cas d'utilisation, y compris l'envoi de transactions, l'émission de tokens, le minting de NFT et l'intégration DeFi sur la page des Exemples de Code."
  },
  "72": {
    "question": "Quels sont les endpoints de l'API REST ?",
    "answer": "Interrogez les blocs, transactions, comptes et informations sur les tokens via l'API REST. Consultez la liste complète des endpoints et les exemples de requêtes dans la documentation API."
  },
  "73": {
    "question": "Qu'est-ce que la vérification de contrat intelligent ?",
    "answer": "La vérification de contrat intelligent prouve que le bytecode déployé correspond au code source. Les contrats vérifiés ont le code source visible dans l'Explorateur, augmentant la transparence."
  },
  "74": {
    "question": "Comment interagir avec les contrats ?",
    "answer": "Appelez les fonctions directement via les onglets Lecture/Écriture des contrats vérifiés dans l'Explorateur. Ou interagissez de manière programmatique en utilisant les SDK."
  },
  "75": {
    "question": "Que sont les standards de token ?",
    "answer": "TBURN supporte les standards de token fongible similaires à ERC-20 et les standards NFT similaires à ERC-721/1155. Les interfaces standardisées assurent la compatibilité avec les portefeuilles et les dApps."
  },
  "76": {
    "question": "Comment créer un token ?",
    "answer": "Déployez un contrat intelligent conforme aux standards de token. Définissez des paramètres comme le nom, le symbole, l'offre totale. Utilisez la page d'Émission de Token pour créer des tokens sans code."
  },
  "77": {
    "question": "Qu'est-ce qu'un token wrapped ?",
    "answer": "Les tokens wrapped représentent des actifs verrouillés d'autres chaînes. Par exemple, wBTC représente du Bitcoin verrouillé dans le pont TBURN. Les tokens wrapped peuvent être utilisés dans l'écosystème TBURN."
  },
  "78": {
    "question": "Comment ajouter un token personnalisé ?",
    "answer": "Entrez l'adresse du contrat du token dans votre portefeuille pour ajouter des tokens personnalisés. Le portefeuille récupérera automatiquement les informations du token et affichera le solde."
  },
  "79": {
    "question": "Qu'est-ce que DePIN ?",
    "answer": "DePIN (Réseaux d'Infrastructure Physique Décentralisés) utilise la blockchain pour coordonner l'infrastructure du monde réel. TBURN supporte les réseaux d'appareils IoT, le stockage décentralisé et les marchés de calcul."
  },
  "80": {
    "question": "Que sont les stablecoins ?",
    "answer": "Les stablecoins sont des tokens indexés sur les monnaies fiat. L'écosystème TBURN inclut plusieurs options de stablecoin pour le trading et la DeFi sans risque de volatilité des cryptomonnaies."
  },
  "81": {
    "question": "Quelles options de portefeuille sont disponibles ?",
    "answer": "MetaMask, Rabby, Trust Wallet et d'autres portefeuilles compatibles EVM sont supportés. Les portefeuilles matériels comme Ledger peuvent également être connectés pour une sécurité accrue."
  },
  "82": {
    "question": "Comment créer un portefeuille ?",
    "answer": "Téléchargez l'application de portefeuille depuis des sources officielles, suivez le processus de configuration. Sauvegardez votre phrase de récupération en sécurité - la perdre signifie que vous ne pourrez pas récupérer votre portefeuille."
  },
  "83": {
    "question": "Qu'est-ce que le tableau de bord du portefeuille ?",
    "answer": "Le tableau de bord du portefeuille affiche vos actifs, l'historique des transactions et les positions DeFi. Vous pouvez envoyer/recevoir des tokens, faire du staking, connecter des dApps et gérer toutes les activités on-chain."
  },
  "84": {
    "question": "Comment exporter ma clé privée ?",
    "answer": "Exportez votre clé privée dans les options de sécurité des paramètres du portefeuille. Ne partagez jamais votre clé privée - quiconque l'a a le contrôle total de vos actifs."
  },
  "85": {
    "question": "Quelles sont les solutions de paiement ?",
    "answer": "Les solutions de paiement commercial de TBURN incluent l'intégration marchands, le règlement rapide et l'entrée fiat. Les entreprises peuvent accepter les paiements crypto et convertir instantanément en stablecoins."
  },
  "86": {
    "question": "Que sont les Blinks (Liens Blockchain) ?",
    "answer": "Les Blinks sont des liens partageables d'actions blockchain. Les destinataires peuvent exécuter des transactions, minter des NFT ou participer à des événements en un clic. Simplifie les interactions blockchain."
  },
  "87": {
    "question": "Qu'est-ce que BTCfi ?",
    "answer": "BTCfi sont des solutions rendant Bitcoin utilisable en DeFi. Via le pont TBURN, vous pouvez apporter du BTC à TBURN pour le prêt, le yield farming et d'autres activités DeFi."
  },
  "88": {
    "question": "Que sont les extensions de token ?",
    "answer": "Les extensions de token ajoutent des fonctionnalités programmables aux tokens standard. Les fonctionnalités incluent le burn automatique, les restrictions de transfert, les royalties et les transferts conditionnels."
  },
  "89": {
    "question": "Quelles solutions financières sont disponibles ?",
    "answer": "Fournit des solutions de garde, de trading, de paiement et de gestion d'actifs pour les institutions financières. Les outils de conformité et les pistes d'audit répondent aux exigences institutionnelles."
  },
  "90": {
    "question": "Quelles fonctionnalités IA sont disponibles ?",
    "answer": "Fournit l'optimisation du burn basée sur l'IA, l'analyse de gouvernance, l'évaluation des risques de pont, la détection d'anomalies et la planification des validateurs. Plusieurs modèles d'IA (Gemini, Claude, GPT-4o, Grok) sont intégrés."
  },
  "91": {
    "question": "Quels sont les cas d'usage entreprise ?",
    "answer": "Fournit des cas d'usage blockchain entreprise incluant le suivi de chaîne d'approvisionnement, la certification numérique, la vérification d'intégrité des données et les systèmes de tokens internes. Support dédié et SLA fournis."
  },
  "92": {
    "question": "Qu'est-ce que la tokenisation ?",
    "answer": "Convertir des actifs réels (immobilier, art, matières premières) en tokens blockchain. Permet la propriété fractionnée, une liquidité accrue et le trading 24/7."
  },
  "93": {
    "question": "Où puis-je voir les actualités et annonces ?",
    "answer": "Consultez la page Actualités de la Communauté pour les dernières mises à jour, annonces de partenariats et améliorations techniques. Abonnez-vous à la newsletter pour recevoir les mises à jour par email."
  },
  "94": {
    "question": "Comment participer aux événements ?",
    "answer": "Consultez la page Événements de la Communauté pour les airdrops en cours, campagnes et informations sur les meetups. Remplissez les conditions de participation et inscrivez-vous pour recevoir des récompenses."
  },
  "95": {
    "question": "Comment faire des propositions de gouvernance ?",
    "answer": "Staker un certain montant de TB vous permet de créer des propositions de gouvernance. Rédigez le contenu selon le format de proposition et soumettez pour le vote communautaire."
  },
  "96": {
    "question": "Que puis-je faire sur le Hub Communautaire ?",
    "answer": "Sur le Hub Communautaire, vous pouvez discuter avec d'autres utilisateurs, présenter des projets et partager des retours. Vous pouvez également voir les annonces officielles et les mises à jour de développement."
  },
  "97": {
    "question": "Comment garder mes actifs en sécurité ?",
    "answer": "1) Utilisez un portefeuille matériel, 2) Ne partagez jamais votre clé privée/phrase de récupération, 3) Méfiez-vous des sites de phishing, 4) Utilisez uniquement les URL officielles, 5) Activez le 2FA. Stockez les gros actifs dans des portefeuilles froids."
  },
  "98": {
    "question": "Comment identifier les arnaques ?",
    "answer": "Ne faites confiance qu'aux canaux officiels. Les demandes de clés privées ou de phrases de récupération sont 100% des arnaques. Méfiez-vous des messages créant l'urgence comme \"tokens gratuits\" ou \"mise à jour urgente\"."
  },
  "99": {
    "question": "Quelle est l'offre totale de tokens TB ?",
    "answer": "L'offre initiale et l'offre en circulation actuelle des tokens TB peuvent être vérifiées sur la page Tokenomics. En raison du mécanisme de burn, l'offre totale diminue continuellement."
  },
  "100": {
    "question": "Comment fonctionne le mécanisme de burn ?",
    "answer": "Des frais de burn de 0,5% s'appliquent à tous les transferts, brûlant définitivement ce montant. Une partie des frais de réseau est également brûlée. Ce modèle déflationniste soutient la valeur du token."
  }
};

const filePath = path.join(__dirname, '../client/src/locales/fr.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

if (data.qna && data.qna.content) {
  for (const [key, value] of Object.entries(frTranslations)) {
    if (data.qna.content[key]) {
      data.qna.content[key].question = value.question;
      data.qna.content[key].answer = value.answer;
    }
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('French Q&A translations updated successfully!');
