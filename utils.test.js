const utils = require('./utils')

describe('test so card', () => {
  test('straightFlush', () => {
    let rs = utils.getHighestCards(['2s', '3s', '4s', '5s', '7s', '9d', '6s'])
    expect(rs.name).toBe('straightFlush');
    expect(rs.value).toBe(9);
    expect(rs.cards[0].num).toBe('7');
    expect(rs.cards[4].num).toBe('3');
  })
  test('straightFlush 2', () => {
    let rs = utils.getHighestCards(['2s', '3s', '4s', '5s', '7s', 'As', '8d'])
    expect(rs.name).toBe('straightFlush');
    expect(rs.value).toBe(9);
    expect(rs.cards[0].num).toBe('5');
    expect(rs.cards[4].num).toBe('A');
  })
  test('flush', () => {
    let rs = utils.getHighestCards(['2s', '3s', '4s', '5s', '7s', '9d', '10s'])
    expect(rs.name).toBe('flush');
    expect(rs.value).toBe(6);
    expect(rs.cards[0].num).toBe('10');
    expect(rs.cards[4].num).toBe('3');
    expect(rs.fullFlush[5].num).toBe('2');
  })
  test('flush 2', () => {
    let rs = utils.getHighestCards(['2s', 'As', '4s', '5s', '7s', '9d', '10s'])
    expect(rs.name).toBe('flush');
    expect(rs.value).toBe(6);
    expect(rs.cards[0].num).toBe('A');
    expect(rs.cards[4].num).toBe('4');
    expect(rs.fullFlush[5].num).toBe('2');
  })
  test('straight 1', () => {
    let rs = utils.getHighestCards(['5d', '6c', '7s', '10s', '8c', '9d', 'Js'])
    expect(rs.name).toBe('straight');
    expect(rs.value).toBe(5);
    expect(rs.cards[0].num).toBe('J');
  })
  test('straight 2', () => {
    let rs = utils.getHighestCards(['5d', '4c', '3s', '2s', 'Ac', '9d', 'Js'])
    expect(rs.name).toBe('straight');
    expect(rs.value).toBe(5);
    expect(rs.cards[0].num).toBe('5');
  })
  test('straight 3', () => {
    let rs = utils.getHighestCards(['5d', '4c', '3s', '2s', 'Ac', '6d', '7s'])
    expect(rs.name).toBe('straight');
    expect(rs.value).toBe(5);
    expect(rs.cards[0].num).toBe('7');
  })
  test('quad 1', () => {
    let rs = utils.getHighestCards(['5d', '5c', '5s', '5h', 'Ac', '6d', '7s'])
    expect(rs.name).toBe('quad');
    expect(rs.value).toBe(8);
    expect(rs.cards[0].num).toBe('5');
    expect(rs.cards[4].num).toBe('A');
  })
  test('quad 2', () => {
    let rs = utils.getHighestCards(['5d', '5c', '5s', '5h', '2c', 'Kd', 'Qs'])
    expect(rs.name).toBe('quad');
    expect(rs.value).toBe(8);
    expect(rs.cards[0].num).toBe('5');
    expect(rs.cards[4].num).toBe('K');
  })

  test('pair 1', () => {
    let rs = utils.getHighestCards(['3d', '4c', '9s', 'Jh', 'Kc', 'Kd', 'Qs'])
    expect(rs.name).toBe('onePair');
    expect(rs.value).toBe(2);
    expect(rs.cards[0].num).toBe('K');
    expect(rs.cards[4].num).toBe('9');
  })
  test('pair 2', () => {
    let rs = utils.getHighestCards(['3d', '4c', 'Js', 'Jh', 'Kc', 'Kd', 'Qs'])
    expect(rs.name).toBe('twoPair');
    expect(rs.value).toBe(3);
    expect(rs.cards[0].num).toBe('K');
    expect(rs.cards[2].num).toBe('J');
    expect(rs.cards[4].num).toBe('Q');
  })
  test('pair 3', () => {
    let rs = utils.getHighestCards(['3d', '3c', 'Js', 'Jh', 'Kc', 'Kd', '2s'])
    expect(rs.name).toBe('twoPair');
    expect(rs.value).toBe(3);
    expect(rs.cards[0].num).toBe('K');
    expect(rs.cards[2].num).toBe('J');
    expect(rs.cards[4].num).toBe('3');
  })
  test('three 1', () => {
    let rs = utils.getHighestCards(['3d', '3c', '2s', '3h', '2c', '2d', '10s'])
    expect(rs.name).toBe('totk');
    expect(rs.value).toBe(4);
    expect(rs.cards[0].num).toBe('3');
    expect(rs.cards[1].num).toBe('3');
    expect(rs.cards[2].num).toBe('3');
    expect(rs.cards[3].num).toBe('10');
    expect(rs.cards[4].num).toBe('2');
  })

  test('compare 1', () => {
    let flop = ['4d', '4h', '7c', '4s', '4c']
    let handA = ['Kh', 'Ks']
    let handB = ['As', '2d']

    let rs = utils.compare({ handA: [...flop, ...handA], handB: [...flop, ...handB] })
    expect(rs).toBe(-1)
  })

  test('compare 2', () => {
    let flop = ['Ad', 'Ah', 'Kh', 'Jd', '3c']
    let handA = ['Ks', '8d']
    let handB = ['Kd', '4c']

    let rs = utils.compare({ handA: [...flop, ...handA], handB: [...flop, ...handB] })
    expect(rs).toBe(0)
  })

  test('compare 3', () => {
    let flop = ['10d', '10h', 'Jd', 'Jc', 'Qh']
    let handA = ['2h', '2c']
    let handB = ['8s', '8d']

    let rs = utils.compare({ handA: [...flop, ...handA], handB: [...flop, ...handB] })
    expect(rs).toBe(0)
  })
  test('compare 4', () => {
    let flop = ['Ac', '10d', '7s', 'Js', '6c']
    let handA = ['Ad', 'Kd']
    let handB = ['Ah', '4d']

    let rs = utils.compare({ handA: [...flop, ...handA], handB: [...flop, ...handB] })
    expect(rs).toBe(1)
  })
  test('compare 5', () => {
    let flop = ['8s', '8c', '7s', '7d', '9d']
    let handA = ['6h', '6d']
    let handB = ['10s', '2h']

    let rs = utils.compare({ handA: [...flop, ...handA], handB: [...flop, ...handB] })
    expect(rs).toBe(-1)
  })
  test('compare 5', () => {
    let flop = ['Ad', 'Qs', '6h', '10s', '6s']
    let handA = ['9c', 'Js']
    let handB = ['Ks', '7d']

    let rs = utils.compare({ handA: [...flop, ...handA], handB: [...flop, ...handB] })
    expect(rs).toBe(-1)
  })
  test('shuffle', () => {
    let cards = [
      '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Js', 'Qs', 'Ks', 'As',
      '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', 'Jh', 'Qh', 'Kh', 'Ah',
      '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d', 'Jd', 'Qd', 'Kd', 'Ad',
      '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', '10c', 'Jc', 'Qc', 'Kc', 'Ac',
    ]
    cards = utils.shuffle(cards)
    cards = utils.shuffle(cards)
    cards = utils.shuffle(cards)
  })
})