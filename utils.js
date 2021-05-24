function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

const REGEX = /(.*)(h|d|s|c)/

const findPairs = ({ analyticCards }) => {
  let pairCard = undefined;
  let groupNum = analyticCards.reduce((agg, card) => {
    agg[card.num] = analyticCards.filter(c => c.num === card.num)
    return agg;
  }, {})
  Object.keys(groupNum).forEach(t => {
    if (groupNum[t].length == 2 && (!pairCard || (groupNum[t][0].value > pairCard[0].value))) {
      pairCard = groupNum[t];
    }
  })
  if (!pairCard) return false;

  let otherPairs = findPairs({ analyticCards: analyticCards.filter(c => c.num !== pairCard[0].num) });
  if (!otherPairs) {
    return {
      name: 'onePair',
      value: 2,
      cards: [...pairCard, ...analyticCards.filter(c => c.num !== pairCard[0].num).slice(0, 3)]
    }
  } else {
    return {
      name: 'twoPair',
      value: 3,
      cards: [
        ...pairCard,
        ...otherPairs.cards.slice(0, 2),
        analyticCards.filter(c => c.num !== pairCard[0].num || c.num !== otherPairs.cards[0].num)[0],
      ]
    }
  }
}

const findTreeOfKind = ({ analyticCards }) => {
  let totk = undefined;
  let groupNum = analyticCards.reduce((agg, card) => {
    agg[card.num] = analyticCards.filter(c => c.num === card.num)
    return agg;
  }, {})
  Object.keys(groupNum).forEach(t => {
    if (groupNum[t].length == 3 && (!totk || (groupNum[t][0].value > totk[0].value))) {
      totk = groupNum[t];
    }
  })
  if (!totk) return false;
  let anotherCards = analyticCards.filter(c => c.num !== totk[0].num);
  return {
    name: 'totk',
    value: 4,
    cards: [...totk, ...anotherCards.slice(0, 2)],
  }
}

const findFullHouse = ({ analyticCards }) => {
  let threeOfKind = findTreeOfKind({ analyticCards })
  if (!threeOfKind) return false;
  let pairs = findPairs({ analyticCards: analyticCards.filter(c => c.num !== threeOfKind.totk[0].num) })
  if (!pairs) return false;
  return {
    name: 'fullHouse',
    value: 7,
    cards: [...threeOfKind.cards.slice(0, 3), ...pairs.cards.slice(0, 2)],
  }
}

const findQuad = ({ analyticCards }) => {
  let quad = undefined;
  let groupNum = analyticCards.reduce((agg, card) => {
    agg[card.num] = analyticCards.filter(c => c.num === card.num)
    return agg;
  }, {})
  Object.keys(groupNum).forEach(t => {
    if (groupNum[t].length == 4) {
      quad = groupNum[t];
    }
  })
  if (!quad) return false;

  return {
    name: 'quad',
    value: 8,
    cards: [...quad, analyticCards.filter(c => c.num !== quad[0].num)[0]]
  }
}

const findStraight = ({ analyticCards }) => {
  let straight = undefined;
  analyticCards.forEach(card => {

    let foundStraight = [0, 1, 2, 3, 4].map((i) => analyticCards.find(x => x.value + i === card.value)).filter(Boolean)
    if (foundStraight.length === 5 && (!straight || (straight && straight[0].value < foundStraight[0].value))) {
      straight = foundStraight;
    }
    if (!straight && card.value === 14) {
      let foundStraight = [4, 3, 2, 1].map((i) => analyticCards.find(x => x.value - i === 1)).filter(Boolean)
      if (foundStraight.length === 4) {
        straight = [...foundStraight, { ...card, value: 1 }];
      }
    }

  })
  if (!straight) return false;
  return {
    cards: straight,
    name: 'straight',
    value: 5
  }
}

const findFlush = ({ analyticCards }) => {
  let flush = undefined;
  let groupKind = ['c', 'd', 'h', 's'].reduce((agg, kind) => {
    agg[kind] = analyticCards.filter(c => c.kind === kind)
    return agg;
  }, {})
  Object.keys(groupKind).forEach(t => {
    if (groupKind[t].length >= 5) {
      flush = groupKind[t]
    }
  })
  if (!flush) return false;

  return {
    kind: flush[0].kind,
    cards: flush.slice(0, 5),
    fullFlush: flush,
    name: 'flush',
    value: 6
  }
}

const findStraightFlush = ({ analyticCards }) => {
  let flush = findFlush({ analyticCards })
  if (!flush) return false;

  let straightFlush = findStraight({ analyticCards: flush.fullFlush });
  if (!straightFlush) return false;


  return {
    name: 'straightFlush',
    value: 9,
    cards: straightFlush.cards,
  }

}

const getHighestCards = (cards = ['As', '10s', '3s', '5h', '8d', '9c', 'Jc']) => {
  const analyticCards = cards.map(c => {
    const arr = c.match(REGEX);
    let num = arr[1];
    let kind = arr[2];
    let value = 0;
    switch (num) {
      case 'A':
        value = 14;
        break;
      case 'K':
        value = 13;
        break;
      case 'Q':
        value = 12;
        break;
      case 'J':
        value = 11;
        break;
      default:
        value = +num || 0;
        break;
    }
    return {
      num,
      value,
      kind,
      data: c,
    }
  })
  analyticCards.sort((a, b) => b.value - a.value);
  let rs = findStraightFlush({ analyticCards })
  if (rs) return {
    analyticCards,
    ...rs,
  };
  rs = findQuad({ analyticCards });
  if (rs) return {
    analyticCards,
    ...rs,
  };
  rs = findFullHouse({ analyticCards });
  if (rs) return {
    analyticCards,
    ...rs,
  };;
  rs = findFlush({ analyticCards });
  if (rs) return {
    analyticCards,
    ...rs,
  };;
  rs = findStraight({ analyticCards });
  if (rs) return {
    analyticCards,
    ...rs,
  };
  rs = findTreeOfKind({ analyticCards });
  if (rs) return {
    analyticCards,
    ...rs,
  };
  rs = findPairs({ analyticCards });
  if (rs) return {
    analyticCards,
    ...rs,
  };
  return {
    analyticCards,
    cards: analyticCards,
    value: 1,
    name: 'highHand'
  }
}

const compare = ({ handA = [], handB = [] }) => {
  if (handA.length !== 7 || handB.length !== 7) return 0;

  const highestHandA = getHighestCards(handA);
  const highestHandB = getHighestCards(handB);

  if (highestHandA.value - highestHandB > 0) return 1;
  if (highestHandA.value - highestHandB < 0) return -1;
  let rs = 0;
  [0, 1, 2, 3, 4].forEach(i => {
    if (highestHandA.cards[i].value - highestHandB.cards[i].value > 0) {
      rs = 1;
      return;
    };
    if (highestHandA.cards[i].value - highestHandB.cards[i].value < 0) {
      rs = -1;
      return;
    }
  })

  return rs;
}

module.exports = {
  shuffle,
  getHighestCards,
  compare,
}